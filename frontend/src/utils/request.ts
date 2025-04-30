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
                message.error('Network Connection Failed, Please Check Your Network');
            } else if (error.code === 'ECONNABORTED') {
                message.error('Request Timeout, Please Try Again Later');
            } else {
                message.error('Server Unresponsive, Please Try Again Later');
            }
        } else {
            // HTTP 错误
            const status = error.response.status;
            switch (status) {
                case 400:
                    message.error(error.response.data?.message || '请求参数错误');
                    break;
                case 401:
                    message.error('Not Logged In or Login Expired');
                    break;
                case 403:
                    message.error('No Permission to Access');
                    break;
                case 404:
                    message.error('Requested Resource Not Found');
                    break;
                case 500:
                    message.error('Server Error, Please Try Again Later');
                    break;
                default:
                    message.error(error.response.data?.message || 'Request Failed');
            }
        }
        return Promise.reject(error);
    }
);

export default request; 