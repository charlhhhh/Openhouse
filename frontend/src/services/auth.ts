import request from '../utils/request';
import { Post, PostListParams, PostListResponse, Comment, CommentListResponse, CommentListParams, CommentRepliesParams, CreateCommentParams, CommentResponse } from '../pages/home/types';
import { data } from 'react-router-dom';
import { useState } from 'react';

interface BaseResponse {
    code: number;
    message: string;
}

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
    is_github_bound: boolean;
    is_google_bound: boolean;
    is_email_bound: boolean;
    match_status: string;
}

export interface UpdateProfileParams {
    avatar_url?: string;
    gender?: string;
    intro_long?: string;
    is_verified?: boolean;
    research_area?: string;
    tags?: string[];
    username?: string;
    is_email_bound?: boolean;
    is_github_bound?: boolean;
    is_google_bound?: boolean;
    coin?: number;
}

export interface VerifySchoolEmailParams {
    email: string;
}

export const authService = {
    // 发送邮箱验证码
    sendEmailCode: async (email: string): Promise<BaseResponse> => {
        return request.post('/api/v1/auth/email/send', { "email": email });
    },

    // 验证邮箱验证码
    verifyEmailCode: async (params: EmailVerifyParams) => {
        return request.post('/api/v1/auth/email/verify', params);
    },

    // 绑定学校邮箱
    verifySchoolEmail: async (params: VerifySchoolEmailParams) => {
        return request.get('/api/v1/auth/email/academic_check', { params });
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
    getGoogleAuthUrl: () => {
        return 'https://accounts.google.com/o/oauth2/v2/auth?client_id=1096406563590-dg8skdq3ook05s6hj2s9s41arvhj4l4s.apps.googleusercontent.com&redirect_uri=https://openhouse.horik.cn/api/v1/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+openid';
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

    parseBindSuccessFromUrl: () => {
        const searchParams = new URLSearchParams(window.location.search);
        const result = searchParams.get('result');
        console.log('解析到的绑定结果:', result);
        return result;
    },

    // 获取用户信息
    getUserProfile: async (): Promise<UserProfile> => {
        const userProfile = (await request.get('/api/v1/user/profile')).data;
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
        return userProfile;
    },

    // 更新用户信息
    updateUserProfile: async (params: UpdateProfileParams): Promise<BaseResponse> => {
        const response = (await request.post('/api/v1/user/profile', params)).data;
        return response;
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
    },

    // 上传图片到OSS
    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await request.post('/api/v1/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }) as { code: number; data: string; message: string };
        if (res.code !== 0) {
            throw new Error(res.message || '图片上传失败');
        }
        return res.data;
    },

    // 获取帖子列表
    getPostsList: async (params: PostListParams): Promise<PostListResponse> => {
        try {
            const response = await request.post<any, PostListResponse>('/api/v1/posts/list', params);
            return response;
        } catch (error) {
            console.error('获取帖子列表失败:', error);
            return {
                code: -1,
                data: {
                    list: [],
                    total: 0,
                },
                message: '获取失败'
            };
        }
    },

    // 关注用户
    followUser: async (followedUuid: string): Promise<{
        code: number;
        data: string;
        message: string;
    }> => {
        return request.post('/api/v1/user/follow', { followed_uuid: followedUuid });
    },

    // 取消关注用户
    unfollowUser: async (followedUuid: string): Promise<{
        code: number;
        data: string;
        message: string;
    }> => {
        return request.post('/api/v1/user/unfollow', { followed_uuid: followedUuid });
    },

    // 获取评论列表
    getCommentsList: async (params: CommentListParams): Promise<CommentListResponse> => {
        return request.post('/api/v1/comments/list', params);
    },

    // 获取评论回复列表
    getCommentReplies: async (params: CommentRepliesParams): Promise<CommentListResponse> => {
        return request.post('/api/v1/comments/replies', params);
    },

    // 创建评论
    createComment: async (params: CreateCommentParams): Promise<CommentResponse> => {
        return request.post('/api/v1/comments/create', params);
    },

    // 点赞评论
    likeComment: async (commentId: number): Promise<CommentResponse> => {
        return request.post('/api/v1/comments/like', { comment_id: commentId });
    },

    // 取消点赞评论
    unlikeComment: async (commentId: number): Promise<CommentResponse> => {
        return request.post('/api/v1/comments/unlike', { comment_id: commentId });
    },

    async getFollowingPosts(params: PostListParams): Promise<PostListResponse> {
        return request.post('/api/v1/user/following/posts', params);
    },

    async getFavoritePosts(params: PostListParams): Promise<PostListResponse> {
        return request.post('/api/v1/posts/favorites_list', params);
    },

    async getMyPosts(params: PostListParams): Promise<PostListResponse> {
        return request.post('/api/v1/posts/mypostlist', params);
    },

    // 匹配相关接口
    matchTrigger: async (): Promise<{ code: number; data: string; message: string }> => {
        return request.get('/api/v1/match/trigger');
    },

    getTodayMatch: async (): Promise<{
        code: number;
        data: {
            avatar_url: string;
            intro_short: string;
            is_following: boolean;
            llm_comment: string;
            match_score: number;
            research_area: string;
            tags: string[];
            username: string;
            uuid: string;
        };
        message: string;
    }> => {
        return request.get('/api/v1/match/today');
    },

    // 匹配

}; 