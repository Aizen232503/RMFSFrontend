<template>
    <aYinTechBorderB4>
        <div style="height: 100%;">
            <div class="flex items-center justify-center">
                <h2 style="font-family: AliHYAiHei;margin-top: 20px;margin-bottom: 20px;font-size:16px"> {{ info.label
                    }}
                </h2>
            </div>

            <el-form style="margin: auto; width: 90%; height: 80%;" :model="params" label-width="auto">
                <el-form-item>
                    <el-radio-group v-model="params[info.label]" placeholder="Select" size="large"
                        style="width: 300px; margin: auto; display: flex; flex-direction: column; gap: 10px;">
                        <el-radio v-for="option in info.options" :key="option.value" :label="option.label"
                            :value="option.value" style="margin-right:0;margin-bottom: 10px; text-align: center;" />
                    </el-radio-group>
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
const { params, paramsInfo } = storeToRefs(paramsStore)
const props = defineProps({
    title: String,
    info: Object,
});
</script>

<style scoped lang="less">
:deep(.form-item) {
    margin-bottom: 5px !important;
}

.selected-config {
    background-color: white;
    color: #409EFF;
    border-radius: 5px;
    padding: 2px 5px;
    cursor: pointer;
}
</style>