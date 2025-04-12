import { http } from '@/utils/request'

/**
 * 获取订单数据
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns Promise<any>
 */
export const getOrdersData = (type: string = "unassigned", page: number = 1, pageSize: number = 100): Promise<any> => {
    return http({
        url: 'orders/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
        params: { type, page, pageSize } // 传递分页参数
    })
}

/**
 * 获取机器人数据
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns Promise<any>
 */
export const getRobotsData = (page: number = 1, pageSize: number = 100): Promise<any> => {
    return http({
        url: 'robots/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
        params: { page, pageSize } // 传递分页参数
    })
}

/**
 * 获取拣选站数据
 * @param page 当前页码
 * @param pageSize 每页条数
 * @returns Promise<any>
 */
export const getStationsData = (page: number = 1, pageSize: number = 10): Promise<any> => {
    return http({
        url: 'stations/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
        params: { page, pageSize } // 传递分页参数
    })
}