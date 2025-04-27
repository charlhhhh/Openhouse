import request from '../utils/request';

export interface EmailVerifyParams {
    email: string;
    code: string;
}

export interface UserProfile {
    avatar_url: string;
    coin: number;
    gender: string;
    intro_long: string;
    intro_short: string;
    is_verified: boolean;
    research_area: string;
    tags: string[];
    username: string;
    uuid: string;
}

export interface UpdateProfileParams {
    avatar_url?: string;
    gender?: string;
    intro_long?: string;
    is_verified?: boolean;
    research_area?: string;
    tags?: string[];
    username?: string;
}

export const authService = {
    // 发送邮箱验证码
    sendEmailCode: async (email: string) => {
        return request.post('/api/v1/auth/email/send', { "email": email });
    },

    // 验证邮箱验证码
    verifyEmailCode: async (params: EmailVerifyParams) => {
        return request.post('/api/v1/auth/email/verify', params);
    },

    // 保存token到localStorage
    saveToken: (token: string) => {
        localStorage.setItem('token', token);
    },

    // 从localStorage获取token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // 清除token
    clearToken: () => {
        localStorage.removeItem('token');
    },

    // 获取Github认证URL
    getGithubAuthUrl: () => {
        return 'https://github.com/login/oauth/authorize?scope=user:email&client_id=Ov23liKlSNhwhBevQPD7';
    },

    // 解析重定向URL中的token
    parseTokenFromUrl: () => {
        // 获取完整的查询字符串
        const searchParams = new URLSearchParams(window.location.search);
        console.log('URL查询参数:', window.location.search);

        // 直接从查询参数中获取token
        const token = searchParams.get('token');
        console.log('解析到的token:', token);

        return token;
    },

    // 获取用户信息
    getUserProfile: async (): Promise<{
        code: number;
        data: UserProfile;
        message: string;
    }> => {
        return request.get('/api/v1/user/profile');
    },

    // 更新用户信息
    updateUserProfile: async (params: UpdateProfileParams): Promise<{
        code: number;
        data: string;
        message: string;
    }> => {
        return request.post('/api/v1/user/profile', params);
    },

    // 检查是否已登录
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    // 上传文件
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://openhouse.horik.cn/api/v1/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('文件上传失败');
        }

        const data = await response.json();
        return data.url; // 假设返回的数据中包含文件的URL
    }
}; 