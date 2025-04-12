export const state = {
    orders: [] as any[], // 全局订单数组
    robots: [] as any[], // 全局机器人数组
    stations: [] as any[], // 全局拣选站数组
    chunkedItems: {
        assigned: {} as Record<number, any[]>,
        unassigned: {} as Record<number, any[]>,
        robots: {} as Record<number, any[]>
    },
    robotOrderMap: new Map<string, string>() // 机器人和订单的对应关系
};