import { http } from '@/utils/request'

export const getWorkingConditionData = (): Promise<any> => {
    //返回promise对象
    return http({
        url: 'working_condition/',
        headers: {
            'Content-Type': 'application/json',
            'showLoading': false
        },
        method: 'get',
    })
}