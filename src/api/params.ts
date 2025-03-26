import { http } from '@/utils/request'
// 请求所有参数
export const getParams = (): Promise<any> => {
    //返回promise对象
    return http({
        url: `/settings/`,
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
    })
}
//更新所有参数
export const updateParams = (params) => {
    //返回promise对象
    return http({
        url: `/settings/`,
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'put',
        data: {
            ...params
        },
    })
}