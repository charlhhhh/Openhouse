export interface Post {
    id: string;
    title: string;
    content: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    image_url?: string;
    likes_count: number;
    comments_count: number;
    tags?: string[];
} 