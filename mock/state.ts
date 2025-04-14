export const state = {
    orders: [] as any[], // 全局订单数组
    robots: [] as any[], // 全局机器人数组
    stations: [] as any[], // 全局拣选站数组
    chunkedItems: {
        assigned: {} as Record<number, any[]>,
        unassigned: {} as Record<number, any[]>,
        robots: {} as Record<number, any[]>
    },
    robotOrderMap: new Map<string, string>(), // 机器人和订单的对应关系
    // taskParams: {
    //     orderCount: 100, // 默认订单数量
    //     robotCount: 1000, // 默认机器人数量
    //     stationCount: 11, // 默认站台数量
    //     generateSpeed: 4, // 默认生成速度，每3秒生成xx条订单
    //     assignSpeed: 1, // 默认分配速度，每3秒分配xx条订单
    //     processSpeed: 4, // 默认处理速度，每3秒进度增加xx%
    //     maxOrders: 10000, // 默认最大订单数量
    //     ifDisturbed: false, // 扰动类型
    // }
};