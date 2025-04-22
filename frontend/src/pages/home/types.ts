export interface Author {
    avatar: string;
    name: string;
    isFollowing?: boolean;
    tags: string[];
}

export interface Comment {
    id: string;
    author: Author;
    content: string;
    date: string;
}

export interface Post {
    id: string;
    author: Author;
    date: string;
    title?: string;
    content: string;
    images?: string[];
    stats: {
        views: number;
        comments: number;
        likes: number;
        hotness: number;
    };
    parentId?: string;
    replies?: Post[];
} 