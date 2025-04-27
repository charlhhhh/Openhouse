import axios from 'axios';

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const deletePost = async (postId: string): Promise<boolean> => {
    try {
        // 模拟 API 调用
        await delay(1000);
        // 在实际项目中，这里应该是真实的 API 调用
        // await axios.delete(`/api/posts/${postId}`);
        return true;
    } catch (error) {
        console.error('删除帖子失败:', error);
        throw error;
    }
}; 