import Mock from 'mockjs';


const orders = Mock.mock({
    'data|200-300': [
        {
            'order_id': () => `O-${Mock.mock('@date("yyyyMMdd-HHmmss")')}`, // 订单ID
            'priority': '@pick(["高", "中", "低"])', // 优先级
            'status': '@pick(["等待", "拣选中", "完成"])', // 订单状态
            'batch_id': '@integer(1, 10)', // 批次
            'SKU_detail': () => `SKU${Mock.mock('@integer(100, 999):@integer(1, 99)')}`, // SKU详情
            'timestamp': '@datetime("yyyy-MM-dd HH:mm:ss")', // 创建时间
            'order_process': '@integer(0, 100)%' // 进度
        }
    ]
}).data;
const robots = Mock.mock({
    'data|200-300': [
        {
            'robot_id': () => `R-${Mock.mock('@integer(1000, 9999)')}`, // 机器人ID
            'order_id': () => {
                // 随机选择 "无" 或符合格式的订单号
                const isNoOrder = Mock.mock('@boolean'); // 随机生成 true 或 false
                return isNoOrder ? '无' : `O-${Mock.mock('@date("yyyyMMdd-HHmmss")')}`;
            }, // 当前订单
            'station': () => Mock.mock('@pick(["Station #1", "Station #2", "Station #3", "Station #4", "Station #5", "Station #6", "Station #7", "Station #8"])'), // 所在站台
            'status': '@pick(["待机中", "搬运中", "空闲"])', // 状态
            'battery': '@integer(10, 100)%', // 电量
            'last_updated': '@datetime("yyyy-MM-dd HH:mm:ss")' // 最后刷新时间
        }
    ]
}).data;
const stations = Mock.mock({
    'data|8': [
        {
            'station_id|+1': ['Station #1', 'Station #2', 'Station #3', 'Station #4', 'Station #5', 'Station #6', 'Station #7', 'Station #8'], // 拣选站ID
            'status': '@pick(["故障", "忙碌", "空闲"])', // 状态
            'order_id': () => {
                // 随机选择 "无" 或符合格式的订单号
                const isNoOrder = Mock.mock('@boolean'); // 随机生成 true 或 false
                return isNoOrder ? '无' : `O-${Mock.mock('@date("yyyyMMdd-HHmmss")')}`;
            }, // 当前订单
            'waiting_queue': () => {
                const queueLength = Mock.mock('@integer(0, 3)'); // 随机生成等待队列长度（0到3）
                if (queueLength === 0) return '无';
                return Array.from({ length: queueLength }, () => `O-${Mock.mock('@integer(20240000, 20249999)')}`).join(', ');
            }, // 等待队列
            'last_updated': '@datetime("yyyy-MM-dd HH:mm:ss")' // 更新时间
        }
    ]
}).data;
const workingCondition = Mock.mock({
    'data': {
        'working_robots': '@integer(1000, 3000)', // 处于工作状态下的机器人数量
        'system_runtime': '@float(1, 10, 1, 1)', // 系统运行时长，单位小时
        'processed_orders': '@integer(1000, 7000)', // 已处理订单数量
        'pending_orders': '@integer(1000, 7000)', // 待处理订单数量
        'average_wait_time': '@integer(100, 200)' // 订单平均等待时长，单位秒
    }
}).data;
export default [
    {
        url: '/mockapi/orders',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: '获取订单数据成功',
                count: orders.length,
                results: orders
            };
        }
    },
    {
        url: '/mockapi/robots',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: '获取机器人数据成功',
                count: robots.length,
                results: robots
            };
        }
    },
    {
        url: '/mockapi/stations',
        method: 'get',
        response: () => {
            return {
                code: 200,
                message: '获取拣选站数据成功',
                count: stations.length,
                results: stations
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