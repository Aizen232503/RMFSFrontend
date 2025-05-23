import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useParamsStore = defineStore('params', () => {
    const params = ref({
        "场景名称": '场景A',
        "机器人数量": '小规模',
        "机器人种类": '单类型',
        "任务生成速率": '中',
        "订单分配方案": '混合分层型-快速',
        "扰动类型": '有'
    })
    const savedParams = ref({
        "场景名称": '场景B',
        "机器人数量": '大规模',
        "机器人种类": '复合型',
        "任务生成速率": '中',
        "订单分配方案": '混合分层型-快速',
        "扰动类型": '有'
    })
    const paramsInfo = ref({
        "场景名称": {
            label: '场景名称',
            type: 'select',
            default: null,
            options: [
                { label: '场景A', value: '场景A' },
                { label: '场景B', value: '场景B' },
                { label: '场景C', value: '场景C' }
            ]
        },
        "机器人数量": {
            label: '机器人数量',
            type: 'select',
            default: null,
            options: [
                { label: '小规模', value: '小规模' },
                { label: '中规模', value: '中规模' },
                { label: '大规模', value: '大规模' }
            ]
        },
        "机器人种类": {
            label: '机器人种类',
            type: 'select',
            default: null,
            options: [
                { label: '单类型', value: '单类型' },
                { label: '复合型', value: '复合型' }
            ]
        },
        "任务生成速率": {
            label: '任务生成速率',
            type: 'select',
            default: null,
            options: [
                { label: '低', value: '低' },
                { label: '中', value: '中' },
                { label: '高', value: '高' }
            ]
        },
        "订单分配方案": {
            label: '订单分配方案',
            type: 'select',
            default: null,
            options: [
                { label: '基准类型', value: '基准类型' },
                { label: '混合分层型-经济', value: '混合分层型-经济' },
                { label: '混合分层型-综合', value: '混合分层型-综合' },
                { label: '混合分层型-快速', value: '混合分层型-快速' },
            ]
        },
        "扰动类型": {
            label: '扰动类型',
            type: 'select',
            default: null,
            options: [
                { label: '有', value: '有' },
                { label: '无', value: '无' },
            ]
        }
    });

    return {
        params, savedParams, paramsInfo
    };
},
    {
        persist: true,
    }
);