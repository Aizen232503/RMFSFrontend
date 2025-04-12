import axios from 'axios';
import { state } from '../../mock/state.ts'; // 引入 state

// 创建 Axios 实例
const instance = axios.create();

// 添加请求拦截器
instance.interceptors.request.use((config: any) => {
    // 检查请求 URL，决定是否拦截
    if (config.url?.startsWith('/mockapi/')) {
        const url = config.url;
        const query = config.params || {};

        // 根据 URL 返回对应的 state 数据
        if (url === '/mockapi/orders') {
            const { type = 'assigned', page = 1, pageSize = 100 } = query;
            const { orders, chunkedItems } = state;

            let count = 0;
            if (type === 'assigned') {
                count = orders.filter(order => order.status !== '等待').length;
            } else if (type === 'unassigned') {
                count = orders.filter(order => order.status === '等待').length;
            }

            let results = [];
            if (pageSize == 100) {
                results = chunkedItems[type]?.[page] ?? [];
            }
            if (pageSize == 50) {
                const newPage = Math.ceil(page / 2);
                if (page % 2 == 0) {
                    results = chunkedItems[type]?.[newPage]?.slice(50, 100) ?? [];
                } else {
                    results = chunkedItems[type]?.[newPage]?.slice(0, 50) ?? [];
                }
            }

            // 模拟返回数据
            return Promise.resolve({
                data: {
                    code: 200,
                    message: '获取订单数据成功',
                    count,
                    results,
                },
            });
        }

        if (url === '/mockapi/robots') {
            console.log('获取机器人数据请求被拦截', query);
            const { page = 1, pageSize = 100 } = query;
            const { robots, chunkedItems } = state;

            let count = robots.length;
            let results = [];

            if (pageSize == 100) {
                results = chunkedItems['robots']?.[page] ?? [];
            }
            if (pageSize == 50) {
                const newPage = Math.ceil(page / 2);
                if (page % 2 == 0) {
                    results = chunkedItems['robots']?.[newPage]?.slice(50, 100) ?? [];
                } else {
                    results = chunkedItems['robots']?.[newPage]?.slice(0, 50) ?? [];
                }
            }

            // 模拟返回数据
            return Promise.resolve({
                data: {
                    code: 200,
                    message: '获取机器人数据成功',
                    count,
                    results,
                },
            });
        }
    }

    // 如果不拦截，继续发送请求
    return config;
});

// 导出 Axios 实例
export default instance;