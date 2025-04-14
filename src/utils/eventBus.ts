import mitt from 'mitt';

type Events = {
    initializeSystem: Record<string, any>; // 定义事件类型
    calculateWorkingCondition: Record<string, any>; // 定义事件类型
};

const eventBus = mitt<Events>();

export default eventBus;