import Mock from 'mockjs';
import { state } from './state.ts';
import eventBus from '@/utils/eventBus';
import { fa, ro } from 'element-plus/es/locale/index.mjs';

const { orders, robots, stations, chunkedItems, robotOrderMap } = state;

let orderCounter = 1; // 递增计数器，从 1 开始
let robotCounter = 1; // 递增计数器，从 1 开始
let stationCounter = 1; // 递增计数器，从 1 开始
// const robotOrderMap = new Map<string, string>(); // 存储机器人和订单的对应关系

const formatCurrentTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 生成指定数量的订单
 * @param count 要生成的订单数量
 * @param status 可选参数，指定订单状态（如 "未分配", "拣选中", "完成"）
 * @returns 生成的订单数组
 */
const generateOrders = (count: number, priority?: string, status?: string) => {
    if (count <= 0) return []; // 如果数量小于等于 0，返回空数组
    const currentDate = new Date();
    const datePart = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`; // 当前日期部分
    return Mock.mock({
        [`data|${count}`]: [
            {
                'order_id': () => {
                    const orderId = `O-${datePart}-${String(orderCounter).padStart(6, '0')}`; // 格式化订单ID
                    orderCounter++; // 递增计数器
                    return orderId;
                },
                'priority': priority || '@pick(["紧急", "普通"])', // 优先级
                'status': status || '@pick(["未分配", "拣选中", "完成"])', // 如果指定了状态，则使用指定状态，否则随机生成
                'robot_id': function () {
                    return this.status === '未分配' ? null : `R-${Mock.mock('@integer(1000, 9999)')}`;
                }, // 机器人ID
                'station_id': null, // 所在站台
                'batch_id': '@integer(1, 10)', // 批次
                'SKU_detail': () => `SKU${Mock.mock('@integer(100, 999):@integer(1, 99)')}`, // SKU详情
                'timestamp': () => formatCurrentTime(), // 使用当前时间
                'order_process': '0%' // 进度
            }
        ]
    }).data;
};

const generateRobots = (count: number, mixRatio: number = 0, disturbRatio: number = 0, stationCount: number = 5) => {
    if (count <= 0) return []; // 如果数量小于等于 0，返回空数组

    return Mock.mock({
        [`data|${count}`]: [
            {
                'robot_id': () => {
                    const robotID = `R-${String(robotCounter).padStart(6, '0')}`; // 格式化机器人ID
                    robotCounter++; // 递增计数器
                    return robotID;
                },
                'robot_type': function () {
                    // 根据混合比例随机生成机器人类型
                    const randomValue = Math.random();
                    if (randomValue < mixRatio / 2) {
                        return '叉车式'; // 一半的混合比例分配给叉车式
                    } else if (randomValue < mixRatio) {
                        return '牵引式'; // 另一半的混合比例分配给牵引式
                    } else {
                        return '潜伏式'; // 剩余部分分配给潜伏式
                    }
                },
                'status': function () {
                    // 根据故障比例生成状态
                    return Math.random() < disturbRatio ? '故障' : '空闲';
                },
                'order_id': null,
                'station_id': () =>
                    `S-${String(Math.floor(Math.random() * stationCount) + 1).padStart(3, '0')}`, // 格式化站台ID
                'last_updated': () => formatCurrentTime(), // 使用当前时间
            }
        ]
    }).data;
}
const generateStations = (count: number) => {
    if (count <= 0) return []; // 如果数量小于等于 0，返回空数组
    return Mock.mock({
        [`data|${count}`]: [
            {
                'station_id': () => {
                    const stationID = `S-${String(stationCounter).padStart(3, '0')}`; // 格式化站台ID
                    stationCounter++; // 递增计数器
                    return stationID;
                },
                'status': '拣选中', // 状态
                'timestamp': () => formatCurrentTime(), // 使用当前时间
            }
        ]
    }).data;
}

let intervalId: NodeJS.Timeout | null = null; // 用于存储定时任务的 ID

const chunkSize = 100; // 每页条数

// 初始化分片存储
const initializeChunks = () => {
    chunkedItems.assigned = {};
    chunkedItems.unassigned = {};
    chunkedItems.robots = {};
};
const clearChunks = () => {
    Object.keys(chunkedItems).forEach(key => {
        if (chunkedItems[key]) {
            Object.keys(chunkedItems[key]).forEach(chunk => {
                delete chunkedItems[key][chunk]; // 删除每个分片的数据
            });
        }
    });
};
// 更新分片存储
const updateChunks = (
    newOrders: any[] = [],
    newRobots: any[] = [],
    newStations: any[] = [],
    types: ('assigned' | 'unassigned' | 'robots' | 'stations')[] = ['assigned', 'unassigned', 'robots']
) => {

    // 插入新订单到头部
    if (newOrders.length > 0) {
        for (let i = 0; i < newOrders.length; i++) {
            orders.unshift(newOrders[i]); // 从尾部逐个插入到头部
        }
    }

    // 插入新机器人到机器人数据
    if (newRobots.length > 0) {
        for (let i = 0; i < newRobots.length; i++) {
            robots.unshift(newRobots[i]); // 从尾部逐个插入到头部
        }
    }

    // 插入新站台到站台数据
    if (newStations.length > 0) {
        for (let i = 0; i < newStations.length; i++) {
            stations.push(newStations[i]); // 顺序插入即可
        }
    }

    // 遍历需要更新的类型
    types.forEach(type => {
        if (type === 'assigned') {
            // 更新已分配订单分片
            const assigned = orders.filter(order => order.status !== '未分配'); // 筛选已分配订单
            const totalChunks = Math.ceil(assigned.length / chunkSize); // 计算总分片数
            for (let i = 0; i < totalChunks; i++) {
                const chunk = i + 1;
                chunkedItems.assigned[chunk] = assigned.slice(i * chunkSize, (i + 1) * chunkSize);
            }
            // 清空多余的分片
            Object.keys(chunkedItems.assigned).forEach(chunk => {
                if (parseInt(chunk) > totalChunks) {
                    delete chunkedItems.assigned[chunk];
                }
            });
        }

        if (type === 'unassigned') {
            // 更新未分配订单分片
            const unassigned = orders.filter(order => order.status === '未分配'); // 筛选未分配订单
            const totalChunks = Math.ceil(unassigned.length / chunkSize); // 计算总分片数
            for (let i = 0; i < totalChunks; i++) {
                const chunk = i + 1;
                chunkedItems.unassigned[chunk] = unassigned.slice(i * chunkSize, (i + 1) * chunkSize);
            }
            // 清空多余的分片
            Object.keys(chunkedItems.unassigned).forEach(chunk => {
                if (parseInt(chunk) > totalChunks) {
                    delete chunkedItems.unassigned[chunk];
                }
            });
        }

        if (type === 'robots') {
            // 更新机器人分片
            const totalChunks = Math.ceil(robots.length / chunkSize); // 计算总分片数
            for (let i = 0; i < totalChunks; i++) {
                const chunk = i + 1;
                chunkedItems.robots[chunk] = robots.slice(i * chunkSize, (i + 1) * chunkSize);
            }
            // 清空多余的分片
            Object.keys(chunkedItems.robots).forEach(chunk => {
                if (parseInt(chunk) > totalChunks) {
                    delete chunkedItems.robots[chunk];
                }
            });
        }
    });
};

// 定时任务
const startIntervalTask = (interval: number = 3000, params?: Record<string, any>) => {
    intervalId = setInterval(() => {
        const { orderCount, robotCount, stationCount, generateSpeed, assignSpeed, processSpeed, maxOrders, ifMixed, ifDisturbed } = calculateTaskParams(params);
        // 为未分配的订单分配机器人和站台
        const assignedOrders = orders.filter(order => order.status !== '未分配'); // 筛选已分配订单
        const unassignedOrders = orders.filter(order => order.status === '未分配'); // 筛选未分配订单

        // 更新已分配订单的进度
        assignedOrders.forEach(order => {
            const currentProgress = parseFloat(order.order_process.replace('%', '')); // 提取当前进度
            if (currentProgress < 100) {
                const increment = processSpeed; // 增长速度
                const newProgress = Math.min(currentProgress + increment, 100); // 增加进度，但不超过 100%
                order.order_process = `${newProgress.toFixed(2)}%`; // 保留两位小数

                if (newProgress >= 100) {
                    order.status = '完成'; // 更新订单状态为完成
                    // 恢复机器人状态为 "空闲"
                    const robotId = order.robot_id;
                    if (robotOrderMap.has(robotId)) {
                        const robot = robots.find(robot => robot.robot_id === robotId);
                        if (robot) {
                            robot.status = '空闲'; // 更新机器人状态为 "空闲"
                            robot.order_id = null; // 清空订单ID
                            robot.last_updated = formatCurrentTime(); // 更新时间
                            robotOrderMap.delete(robotId); // 删除对应关系
                        }
                    }
                    // 更新机器人和订单的对应关系
                    robotOrderMap.delete(order.robot_id); // 删除对应关系
                    order.robot_id = null; // 清空机器人ID
                }
            }
        });

        // 为未分配的订单分配机器人和站台（限制每次分配的订单数量）
        const ordersToAssign = unassignedOrders.slice(-assignSpeed); // 每次只取后若干个订单

        ordersToAssign.forEach(order => {
            // 随机选择一个未被占用，且状态为 "空闲" 的机器人
            const availableRobots = robots.filter(robot =>
                !robotOrderMap.has(robot.robot_id) && robot.status === '空闲'
            ); // 过滤出可用的机器人

            if (availableRobots.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableRobots.length); // 随机选择一个机器人
                const selectedRobot = availableRobots[randomIndex];

                // 分配机器人和站台
                order.robot_id = selectedRobot.robot_id;
                order.station_id = selectedRobot.station_id;
                order.status = '拣选中'; // 更新订单状态

                // 更新机器人状态
                selectedRobot.status = '忙碌'; // 更新机器人状态为忙碌
                selectedRobot.order_id = order.order_id; // 关联订单ID
                selectedRobot.last_updated = formatCurrentTime(); // 更新时间

                // 将机器人和订单的对应关系存储到 Map 中
                robotOrderMap.set(selectedRobot.robot_id, order.order_id);
            }
        });

        let newOrders = []; // 新订单数据

        // 如果订单数量没有到达上限，每次生成新订单并更新分片
        if (orders.length < maxOrders) {
            newOrders = generateOrders(generateSpeed, '普通', '未分配'); // 生成新订单数据
        }
        updateChunks(newOrders); // 更新分片存储


        workingCondition = calculateWorkingCondition({ orderCount, robotCount, stationCount, generateSpeed, assignSpeed, processSpeed, maxOrders, ifMixed, ifDisturbed }); // 计算工况信息
        // console.log('工况信息:', workingCondition); // 输出工况信息

    }, interval);

    console.log('新的定时任务已启动');
};

let assignSpeedInitial = 0; // 订单分配速率初始值
// 根据配置参数计算任务参数
const calculateTaskParams = (params: Record<string, any>) => {

    let orderCount = 0; // 初始订单数量
    let robotCount = 10000; // 初始机器人数量
    let stationCount = 50; // 站台数量
    let generateSpeed = 50; // 任务生成速率
    let assignSpeed = 10; // 订单分配速率
    let processSpeed = 10; // 订单处理速率
    let maxOrders = 28000; // 最大订单数量
    let ifMixed = false; // 是否混合机器人类型
    let ifDisturbed = false; // 是否有扰动

    let assignRatio = 0.5; // 期望分配比例


    // 随机增加分配速率初始值
    if (assignSpeedInitial < 200) {
        assignSpeedInitial = Math.floor(Math.random() * 15) + assignSpeedInitial;
    }


    switch (params.机器人数量) {
        case '小规模':
            robotCount = 5000; // 机器人数量
            break;
        case '中规模':
            robotCount = 12000; // 机器人数量
            break;
        case '大规模':
            robotCount = 25000; // 机器人数量
            break;
    }
    maxOrders = robotCount * 1.2; // 最大订单数量

    switch (params.机器人种类) {
        case '单类型':
            ifMixed = false; // 是否混合机器人类型
            break;
        case '复合型':
            ifMixed = true; // 是否混合机器人类型
            break;
    }

    switch (params.任务生成速率) {
        case '低':
            generateSpeed = 100; // 任务生成速率
            break;
        case '中':
            generateSpeed = 150; // 任务生成速率
            break;
        case '高':
            generateSpeed = 200; // 任务生成速率
            break;
    }

    // 公式：分配速率/处理速率*100===总机器人数量*期望最终达到的分配比例

    switch (params.订单分配方案) {
        case '基准类型':
            assignSpeed = Math.min(50, assignSpeedInitial) + Math.floor(Math.random() * 5 - 2)  // 限制初始值，并加入随机波动
            assignRatio = 0.74; // 期望最终达到的分配比例
            processSpeed = assignSpeed * 100 / robotCount / assignRatio; // 订单处理速率
            break;
        case '混合分层型-经济':
            assignSpeed = Math.min(80, assignSpeedInitial) + Math.floor(Math.random() * 5 - 2)  // 限制初始值，并加入随机波动
            assignRatio = 0.84; // 期望最终达到的分配比例
            processSpeed = assignSpeed * 100 / robotCount / assignRatio; // 订单处理速率
            break;
        case '混合分层型-综合':
            assignSpeed = Math.min(85, assignSpeedInitial) + Math.floor(Math.random() * 5 - 2)  // 限制初始值，并加入随机波动
            assignRatio = 0.88; // 期望最终达到的分配比例
            processSpeed = assignSpeed * 100 / robotCount / assignRatio; // 订单处理速率
            break;
        case '混合分层型-快速':
            assignSpeed = Math.min(90, assignSpeedInitial) + Math.floor(Math.random() * 5 - 2)  // 限制初始值，并加入随机波动
            assignRatio = 0.94; // 期望最终达到的分配比例
            processSpeed = assignSpeed * 100 / robotCount / assignRatio; // 订单处理速率
            break;


    }

    switch (params.扰动类型) {
        case '有':
            ifDisturbed = true; // 是否有扰动
            break;
        case '无':
            ifDisturbed = false; // 是否有扰动
            break;
    }
    return {
        orderCount, robotCount, stationCount, generateSpeed, assignSpeed, processSpeed, maxOrders, ifMixed, ifDisturbed
    };
}

let workingRobotsPeak = 0; // 工作状态下机器人数量的峰值

// 计算工况信息
const calculateWorkingCondition = (taskParams: Record<string, any>) => {
    const { orderCount, robotCount, stationCount, generateSpeed, assignSpeed, processSpeed, maxOrders, ifMixed, ifDisturbed } = taskParams;// 解构任务参数

    // 工作状态的机器人
    const workingRobots = robots.filter(robot => robot.status === '忙碌').length; // 处于工作状态的机器人数量
    // 未分配的订单数量
    const unassignedOrders = orders.filter(order => order.status === '未分配'); // 筛选未分配订单
    // 更新峰值
    if (workingRobots > workingRobotsPeak) {
        workingRobotsPeak = workingRobots; // 更新峰值
    }
    // 订单总数
    const totalOrders = orders.length; // 订单总数
    let trueGenerateSpeed = totalOrders < maxOrders ? generateSpeed : 0; // 生成速率
    let trueAssignSpeed = assignSpeed < unassignedOrders.length ? assignSpeed : unassignedOrders.length; // 分配速率
    // // 已处理的订单
    // const processedOrders = orders.filter(order => order.status === '拣选中' || '完成').length; // 处于处理中的订单数量
    // 计算工况信息
    return {
        generateSpeed: trueGenerateSpeed, robotCount, stationCount, workingRobots, workingRobotsPeak, processSpeed, assignSpeed: trueAssignSpeed, totalOrders
    };
}
// 初始化系统
export const initializeSystem = (params?: Record<string, any>) => {
    // 从配置中计算相关参数
    // 如果没有传入参数，则使用默认参数
    if (!params) {
        params = {
            场景名称: '场景A',
            机器人数量: '小规模',
            机器人种类: '单类型',
            任务生成速率: '低',
            订单分配方案: '基准类型',
            扰动类型: '无'
        };
    }
    const { orderCount, robotCount, stationCount, generateSpeed, assignSpeed, processSpeed, maxOrders, ifMixed, ifDisturbed } = calculateTaskParams(params);
    const mixRatio = ifMixed ? 0.15 : 0; // 混合比例
    const disturbRatio = 0
    // const disturbRatio = ifDisturbed ? 0.01 : 0; // 故障比例
    console.log('初始化系统...')
    console.log('本次初始化的参数为...', params)
    console.log('计算出的参数为...', stationCount)
    // 停止定时任务
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('定时任务已停止');
    }
    // 清空现有数据
    orders.length = 0; // 清空订单数据
    robots.length = 0; // 清空机器人数据
    stations.length = 0; // 清空站台数据

    // 清空分片存储
    clearChunks();

    // 清空机器人和订单的对应关系
    robotOrderMap.clear();

    // 生成订单和机器人数据
    let newOrders = generateOrders(orderCount, '未分配'); // 生成订单数据
    let newRobots = generateRobots(robotCount, mixRatio, disturbRatio, stationCount); // 生成机器人数据
    let newStations = generateStations(stationCount); // 生成站台数据


    // 更新分片存储
    updateChunks(newOrders, newRobots, newStations, ['assigned', 'unassigned', 'robots', 'stations']); // 更新分片存储

    // 启动定时任务
    startIntervalTask(3000, params); // 每 3 秒执行一次
    // 输出系统初始化信息
    console.log(`系统已初始化：订单数量=${orderCount}, 机器人数量=${robotCount}`);
};
// 初始化分片存储
initializeChunks();
// autoInitializeSystem(4000, { orderCount: 47, robotCount: 12 });
// autoInitializeSystem(9000, { orderCount: 32, robotCount: 32 });
// 初始化系统
initializeSystem(); // 默认生成 1000 条订单和 10000 台机器人

// 监听事件
eventBus.on('initializeSystem', (params) => {
    initializeSystem(params);
});
// const workingCondition = Mock.mock({
//     'data': {
//         'working_robots': '@integer(1000, 3000)', // 处于工作状态下的机器人数量
//         'system_runtime': '@float(1, 10, 1, 1)', // 系统运行时长，单位小时
//         'processed_orders': '@integer(1000, 7000)', // 已处理订单数量
//         'pending_orders': '@integer(1000, 7000)', // 待处理订单数量
//         'average_wait_time': '@integer(100, 200)' // 订单平均等待时长，单位秒
//     }
// }).data;

var workingCondition = {
};

export default [
    {
        url: '/mockapi/orders',
        method: 'get',
        response: (config) => {
            const { type = 'assigned', page = 1, pageSize = 100 } = config.query;
            let count = 0
            if (type === 'assigned') {
                count = orders.filter(order => order.status !== '未分配').length; // 已分配订单总数
            } else if (type === 'unassigned') {
                count = orders.filter(order => order.status === '未分配').length; // 未分配订单总数
            }


            let results = []
            if (pageSize == 100) {
                results = chunkedItems[type]?.[page] ?? [];
            }
            if (pageSize == 50) {
                const newPage = Math.ceil(page / 2); // 计算新的页码
                if (page % 2 == 0) { // 如果是偶数页
                    results = chunkedItems[type]?.[newPage]?.slice(50, 100) ?? [];
                }
                else { // 如果是奇数页
                    // 计算新的页码，向下取整
                    results = chunkedItems[type]?.[newPage]?.slice(0, 50) ?? [];
                }
            }
            return {
                code: 200,
                message: '获取订单数据成功',
                count,
                results
            }
        }
    },
    {
        url: '/mockapi/robots',
        method: 'get',
        response: (config) => {
            const { page = 1, pageSize = 100 } = config.query;
            const { robots, chunkedItems } = state; // 获取 robots 和 chunkedItems

            let count = robots.length; // 机器人总数
            let results = []

            if (pageSize == 100) {
                results = chunkedItems['robots']?.[page] ?? [];
            }
            if (pageSize == 50) {
                const newPage = Math.ceil(page / 2); // 计算新的页码
                if (page % 2 == 0) { // 如果是偶数页
                    results = chunkedItems['robots']?.[newPage]?.slice(50, 100) ?? [];
                }
                else { // 如果是奇数页
                    // 计算新的页码，向下取整
                    results = chunkedItems['robots']?.[newPage]?.slice(0, 50) ?? [];
                }
            }
            return {
                code: 200,
                message: '获取机器人数据成功',
                count,
                results
            }
        }
    },
    {
        url: '/mockapi/stations',
        method: 'get',
        response: (config) => {
            const { page = 1, pageSize = 10 } = config.query; // 获取分页参数，默认每页 10 条
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            return {
                code: 200,
                message: '获取拣选站数据成功',
                count: stations.length, // 总数据量
                results: stations.slice(start, end) // 返回当前页的数据
            };
        }
    },
    {
        url: '/mockapi/working_condition',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: '获取工况数据成功',
                results: workingCondition
            };
        }
    }
];