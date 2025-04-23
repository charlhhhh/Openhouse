import { Post, Author } from './types';

// 模拟用户数据
const mockAuthors: Author[] = [
    {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        isFollowing: true,
        name: '张三',
        tags: ['计算机科学', '人工智能']
    },
    {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        isFollowing: false,
        name: '李四',
        tags: ['数据科学']
    },
    {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        isFollowing: false,
        name: '王五',
        tags: ['机器学习', '深度学习']
    },
    {
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
        isFollowing: true,
        name: '赵六',
        tags: ['计算机视觉']
    }
];

// 创建模拟评论数据
const createMockPost = (
    id: string,
    author: Author,
    content: string,
    parentId?: string,
    title?: string
): Post => ({
    id,
    author,
    content,
    title,
    date: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString('zh-CN'),
    stats: {
        views: Math.floor(Math.random() * 1000),
        comments: 0,
        likes: Math.floor(Math.random() * 100),
        hotness: Math.floor(Math.random() * 100)
    },
    parentId,
    replies: []
});

// 模拟帖子数据存储
const mockPosts: Record<string, Post> = {};

// 初始化一些模拟数据
const initializeMockData = () => {
    // 创建主帖子
    const mainPost: Post = createMockPost(
        'post1',
        mockAuthors[0],
        '近年来，深度学习在计算机视觉领域取得了突破性进展...',
        undefined,
        '深度学习在计算机视觉中的应用'
    );
    mainPost.stats.comments = 20;
    mockPosts[mainPost.id] = mainPost;

    // 创建一些评论
    Array.from({ length: 20 }).forEach((_, index) => {
        const comment = createMockPost(
            `comment${index + 1}`,
            mockAuthors[index % mockAuthors.length],
            `这是第${index + 1}条评论。深度学习技术确实在计算机视觉领域取得了突破性进展，特别是在图像识别和目标检测方面的应用令人印象深刻。`,
            'post1'
        );
        mockPosts[comment.id] = comment;
    });
};

initializeMockData();

// 模拟延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 修改获取评论的API
export const fetchComments = async (parentId: string, page: number): Promise<Post[]> => {
    await sleep(1000);

    const comments = Object.values(mockPosts)
        .filter(post => post.parentId === parentId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const start = (page - 1) * 5;
    const end = start + 5;
    return comments.slice(start, end);
};

// 修改添加评论的API
export const addComment = async (parentId: string, content: string): Promise<Post> => {
    await sleep(500);

    const newComment: Post = createMockPost(
        `comment${Date.now()}`,
        {
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
            name: '当前用户',
            tags: ['访客']
        },
        content,
        parentId
    );

    mockPosts[newComment.id] = newComment;

    // 更新父帖子的评论数
    const parentPost = mockPosts[parentId];
    if (parentPost) {
        parentPost.stats.comments += 1;
    }

    return newComment;
};

export const getPost = (postId: string): Post | undefined => {
    return mockPosts[postId];
}; 