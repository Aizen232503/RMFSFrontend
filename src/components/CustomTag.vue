<template>
    <el-tag :style="{ backgroundColor: backgroundColor, color: textColor }" :closable :disable-transitions :hit :color
        :size :effect :round>
        <slot></slot>
    </el-tag>
</template>

<script setup>
import { computed } from 'vue';
import { ElTag } from 'element-plus';

// const emits = defineEmits(['click', 'close']);

// const handleClick = (event) => {
//     emits('click', event);
// };

// const handleClose = (event) => {
//     emits('close', event);
// };
const props = defineProps({
    type: {
        type: String,
        default: 'primary',
    },
    closable: {
        type: Boolean,
        default: false
    },
    disableTransitions: {
        type: Boolean,
        default: false
    },
    hit: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
    },
    size: {
        type: String,
    },
    effect: {
        type: String,
    },
    round: {
        type: Boolean,
        default: false
    },
});

const colorSchemes = {
    primary: {
        backgroundColor: '#18222C',
        textColor: '#409EFF'
    },
    success: {
        backgroundColor: '#1C2518',
        textColor: '#67C23A'
    },
    info: {
        backgroundColor: '#202121',
        textColor: '#909399'
    },
    warning: {
        backgroundColor: '#292218',
        textColor: '#E6A23C'
    },
    danger: {
        backgroundColor: '#2B1D1D',
        textColor: '#F56C6C'
    },
    purple: {
        backgroundColor: '#2E1A47',
        textColor: '#9B59B6'
    },
    pink: {
        backgroundColor: '#3E1A2B',
        textColor: '#FF69B4'
    },
    darkGreen: {
        backgroundColor: '#1A3E2B',
        textColor: '#2ECC71'
    },
    deepGold: {
        backgroundColor: '#3E3A1A',
        textColor: '#D4AF37'
    },
    orange: {
        backgroundColor: '#3E2A1A',
        textColor: '#E67E22'
    },
    armyGreen: {
        backgroundColor: '#1B2E1A',
        textColor: '#6B8E23'
    },
    lightBlue: {
        backgroundColor: '#1A2E3E',
        textColor: '#ADD8E6'
    },
    skyBlue: {
        backgroundColor: '#1C1C1C87CEEB',
        textColor: '#87CEEB'
    }
};

const backgroundColor = computed(() => colorSchemes[props.type].backgroundColor);
const textColor = computed(() => colorSchemes[props.type].textColor);
</script>

<style scoped>
/* 你可以在这里添加更多的样式 */
</style>