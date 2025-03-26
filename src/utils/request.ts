import axios from 'axios'

import { pinia } from '@/main';
import { useUserStore } from "@/store/user";

// import { Message, Loading } from 'element-plus';
// import _ from 'lodash';


var baseURL = import.meta.env.VITE_BASE_URL
var mockURL = import.meta.env.VITE_MOCK_URL
var isMock = import.meta.env.VITE_IS_MOCK === 'true' ? true : false

// 创建axios实例
const createHttpInstance = (baseURL, timeout = 10000) => {
    let http_instance = axios.create({
        baseURL,
        timeout,
        maxContentLength: 50 * 1024 * 1024, // 设置最大内容长度为 50MB
        maxBodyLength: 50 * 1024 * 1024 // 设置最大请求体长度为 50MB
    });
    // 添加请求拦截器
    http_instance.interceptors.request.use((config) => {
        // nprogress.start();
        var token = useUserStore(pinia).currentUser.token
        if (config.headers?.alwaysAdminAuth === "true") {
            config.headers.Authorization = "ad92c560a25d4bb0be62316b6645d6d5"
        }
        if (config.headers?.explicitlyNoAuth !== "true" && token) {
            config.headers.Authorization = token;
        }
        //判断当前请求是否设置了不显示Loading
        if (config.headers.showLoading !== false) {
            // showLoading(config.headers.loadingTarget);
        }
        return config;
    }, err => {//判断当前请求是否设置了不显示Loading

        // Message.error('请求超时!');
        return Promise.resolve(err);
    }
    );


    // 添加响应拦截器

    http_instance.interceptors.response.use(
        (res) => {
            //响应成功
            // nprogress.done();
            if (res.config.headers.showLoading !== false) {
                // hideLoading();
            }
            // console.log("响应拦截器成功信息", res.data)
            return res.data;

        },
        async (err) => {
            console.log("err", err)
            //响应失败
            if (err.config?.headers?.showLoading !== false) {
                // hideLoading();
            }
            if (err.response?.status == 400) {
                return Promise.reject(err.response.data)
            }
            if (err.response?.status == 500) {
                return Promise.reject("服务器错误")
            }
            return Promise.reject(err.response.data)
        });

    return http_instance
};

export const http = isMock ? createHttpInstance(mockURL) : createHttpInstance(baseURL);