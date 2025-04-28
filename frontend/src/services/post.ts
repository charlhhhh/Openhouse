import { Post, PostListParams, PostListResponse } from '../pages/home/types';
import { authService } from './auth';
import request from '../utils/request';

interface PostResponse {
    code: number;
    data: string;
    message: string;
}

interface UpdatePostParams {
    post_id: number;
    title: string;
    content: string;
    image_urls: string[];
}

class PostService {
    async getFeedList(params: PostListParams): Promise<PostListResponse> {
        return authService.getPostsList(params);
    }

    async starPost(postId: string): Promise<PostResponse> {
        return request.post('/api/v1/posts/star', { post_id: Number(postId) });
    }

    async unstarPost(postId: string): Promise<PostResponse> {
        return request.post('/api/v1/posts/unstar', { post_id: Number(postId) });
    }

    async favoritePost(postId: string): Promise<PostResponse> {
        return request.post('/api/v1/posts/favorite', { post_id: Number(postId) });
    }

    async unfavoritePost(postId: string): Promise<PostResponse> {
        return request.post('/api/v1/posts/unfavorite', { post_id: Number(postId) });
    }

    async updatePost(params: UpdatePostParams): Promise<PostResponse> {
        return request.post('/api/v1/posts/update', params);
    }

    async deletePost(postId: number): Promise<PostResponse> {
        return request.post('/api/v1/posts/delete', { post_id: postId });
    }
}

export const postService = new PostService(); 