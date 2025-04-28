import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const request = axios.create({
    baseURL: 'http://openhouse.horik.cn',
    timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 从localStorage获取token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (!error.response) {
            // 网络错误或服务器没有响应
            if (error.code === 'ERR_NETWORK') {
                message.error('网络连接失败，请检查您的网络');
            } else if (error.code === 'ECONNABORTED') {
                message.error('请求超时，请稍后重试');
            } else {
                message.error('服务器无响应，请稍后重试');
            }
        } else {
            // HTTP 错误
            const status = error.response.status;
            switch (status) {
                case 400:
                    message.error(error.response.data?.message || '请求参数错误');
                    break;
                case 401:
                    message.error('未登录或登录已过期');
                    break;
                case 403:
                    message.error('没有权限访问');
                    break;
                case 404:
                    message.error('请求的资源不存在');
                    break;
                case 500:
                    message.error('服务器错误，请稍后重试');
                    break;
                default:
                    message.error(error.response.data?.message || '请求失败');
            }
        }
        return Promise.reject(error);
    }
);

export default request; 