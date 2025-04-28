export interface Author {
    avatar: string;
    name: string;
    isFollowing?: boolean;
    tags: string[];
}

export interface Comment {
    author_uuid: string;
    avatar_url: string;
    id: number;
    content: string;
    create_time: string;
    like_number: number;
    post_id: number;
    replies: string[];
    replies_more_count: number;
    username: string;
    is_liked: boolean;
}

export interface Post {
    post_id: number;
    author_uuid: string;
    avatar_url: string;
    username: string;
    is_following: boolean;
    title: string;
    content: string;
    image_urls: string[];
    create_date: string;
    intro_short: string;
    intro_long: string;
    view_number: number;
    comment_number: number;
    star_number: number;
    favorite_number: number;
    is_starred: boolean;
    is_favorited: boolean;
}

export interface PostListResponse {
    code: number;
    data: {
        list: Post[];
        total: number;
    };
    message: string;
}

export interface PostListParams {
    page_num: number;
    page_size: number;
    sort_order: 'asc' | 'desc';
}

export interface CommentListParams {
    page_num: number;
    page_size: number;
    post_id: number;
    sort_by: 'time';
}

export interface CommentRepliesParams {
    comment_id: number;
    page_num: number;
    page_size: number;
}

export interface CreateCommentParams {
    post_id?: number;
    comment_id?: number;
    content: string;
}

export interface CommentListResponse {
    code: number;
    data: {
        list: Comment[];
        total: number;
    };
    message: string;
}

export interface CommentResponse {
    code: number;
    data: string;
    message: string;
} 