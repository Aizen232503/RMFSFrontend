import mitt from 'mitt';

type Events = {
    initializeSystem: { orderCount: number; robotCount: number }; // 定义事件类型
};

const eventBus = mitt<Events>();

export default eventBus;