<template>
    <div v-for="info in infoSeries">
        <el-collapse v-model="activeNames" v-if="info.name !== 'RemarkInfo'">
            <el-collapse-item :name="info.name">
                <template #title>
                    <div class="text-base font-bold text-left align-top py-0 text-blue-50">{{ info.label }}</div>
                </template>
                <el-card>
                    <component :is="info.component" ref="infoRefs" :defaultForm="defaultForm" :editable="editable"
                        :orderType="orderType" :orderIndex="orderIndex" :demandName="demandName" class="px-4" />
                </el-card>
            </el-collapse-item>
        </el-collapse>
        <el-card v-else>
            <component :is="info.component" ref="infoRefs" :defaultForm="defaultForm" :editable="editable"
                :orderType="orderType" :orderIndex="orderIndex" :demandName="demandName" class="px-0" />
        </el-card>
    </div>
</template>

<script lang="ts" setup name="AttackOrder">
import { ref, reactive, markRaw, onMounted, nextTick, getCurrentInstance } from 'vue';
import AttackInfo from '@/components/formInfo/AttackInfo.vue';
import ExpectAmmunitionInfo from '@/components/formInfo/ExpectAmmunitionInfo.vue';
import TargetInfo from '@/components/formInfo/TargetInfo.vue';
import TacticInfo from '@/components/formInfo/TacticInfo.vue';
import RemarkInfo from '@/components/formInfo/RemarkInfo.vue';
const app = getCurrentInstance() as any
const props = defineProps({
    // 默认表项
    defaultForm: {
        type: Object,
        default: function () {
            return {};
        },
    },
    // 是否可编辑
    editable: { type: Boolean, default: true },
    // 调用的需求名称
    demandName: { type: String, default: "" },
    // 调用的订单序号
    orderIndex: { type: Number, default: 0 },
    // 展开全部
    expandAll: { type: Boolean, default: false },
});
const activeNames = ref(['TargetInfo', 'AttackInfo'])

const orderType = ref("AttackOrder")

const infoSeries = reactive([
    { label: '目标信息', component: markRaw(TargetInfo), name: 'TargetInfo' },
    { label: '打击信息', component: markRaw(AttackInfo), name: 'AttackInfo' },
    { label: '战术要求', component: markRaw(TacticInfo), name: 'TacticInfo' },
    { label: '期望弹药信息', component: markRaw(ExpectAmmunitionInfo), name: 'ExpectAmmunitionInfo' },
    { label: '备注信息', component: markRaw(RemarkInfo), name: 'RemarkInfo' }
])

const infoRefs = ref([])
onMounted(() => {
    if (props.expandAll) {
        activeNames.value = infoSeries.map(info => info.name);
    }
});
// 提交表单
const submitOrderForm = async () => {
    const results = [];
    const failedResults = [];

    for (const item of infoRefs.value) {
        const result = await item.submitInfoForm();
        results.push(result);
        if (!result) {
            failedResults.push(item.infoName);
            // 将未通过验证的表单加入 activeNames 中，确保不重复
            if (!activeNames.value.includes(item.infoName)) {
                activeNames.value.push(item.infoName);
            }
        }
    }

    if (failedResults.length === 0) {
        // 所有的验证都通过，返回所有表单的组合
        return Object.assign({}, ...results);
    } else {
        // 返回 false 表示至少有一个验证没有通过
        return false;
    }
};
// 保存表单
const saveOrderForm = () => {
    infoRefs.value.forEach((item) => {
        item.saveInfoForm()
    })
}
// 重置表单并设为默认值
const resetOrderForm = () => {
    infoRefs.value.forEach((item) => {
        item.resetInfoForm()
    })
}

defineExpose({
    submitOrderForm,
    saveOrderForm,
    resetOrderForm
})
</script>
<style lang="less">
// .el-collapse{
//     background-color: rgba(0,0,0,0.6);
// }
.el-card__body {
    padding-left: 0;
    padding-right: 0;
    padding-top: 8px;
    padding-bottom: 4px;
}

.el-card {
    border: none;
    background-color: rgba(0, 0, 0, 0.4);
    border: none;
    /* 下边框 */
    position: relative;
    /* 为伪元素定位做准备 */
}
</style>