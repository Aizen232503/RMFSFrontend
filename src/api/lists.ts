import { http } from '@/utils/request'

export const getOrdersData = (): Promise<any> => {
    //返回promise对象
    return http({
        url: 'orders/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
    })
}
export const getRobotsData = (): Promise<any> => {
    //返回promise对象
    return http({
        url: 'robots/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
    })
}
export const getStationsData = (): Promise<any> => {
    //返回promise对象
    return http({
        url: 'stations/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
    })
}