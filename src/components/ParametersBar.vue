<template>
    <aYinTechBorderB4>
        <div style="height: 100%;">
            <div class="flex items-center justify-center">
                <h2 style="font-family: AliHYAiHei;margin-top: 10px"> {{ info.name }}</h2>
                <el-tooltip v-if="info.description" effect="light" :content="info.description" placement="top-start">
                    <el-icon class="ml-2 mt-2">
                        <InfoFilled />
                    </el-icon>
                </el-tooltip>
            </div>

            <el-form
                style="display: flex; flex-direction: column; justify-content: space-around;margin: auto; width: 90%;height:60%;margin-top: 10px;"
                :model="params" label-width="auto" label-position="top">
                <el-form-item :label="''" v-if="info.type === 'number'">
                    <el-input class="params-input" type="number " style="width:80%" v-model.number="params[title]"
                        :step="0.1" @mousewheel.native.prevent>
                        <template #append v-if="info.unit">{{ info.unit }}</template>
                    </el-input>
                </el-form-item>
            </el-form>
            <!-- <el-button type="" @click="console.log(params[title])"></el-button> -->
            <!-- <el-select v-model="selectedConfig" @change="applyConfig">
                <el-option v-for="config in configs" :key="config.name" :label="JSON.stringify(config)" :value="config">
                </el-option>
            </el-select> -->
        </div>
    </aYinTechBorderB4>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

import { storeToRefs } from 'pinia';
import { useParamsStore } from '@/store/params'
const paramsStore = useParamsStore()
const { params, orderingParamsInfo, otherParamsInfo } = storeToRefs(paramsStore)
const form = reactive({
})
const props = defineProps({
    title: String,
    info: Object,
});
const selectedConfig = ref([])
// 将默认值和推荐值一起计算configs
const configs = computed(() => {
    return [props.info.default, ...props.info.recommended]
})
const applyConfig = (value) => {
    params.value[props.title] = value
}
</script>

<style scoped lang="less">
:deep(.params-input .el-input__inner) {
    text-align: center;
}

:deep(.date-input .el-input__inner) {
    text-align: center;
}
</style>