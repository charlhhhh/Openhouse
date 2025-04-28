import React, { useState, useEffect } from 'react';
import { Spin, Empty, Pagination } from 'antd';
import { Post, PostListParams } from '../home/types';
import { PostCard } from '../home/PostCard';
import { authService } from '../../services/auth';
import './styles.css';

const SavedTopics: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchSavedPosts = async (page: number = 1) => {
        setLoading(true);
        try {
            const params: PostListParams = {
                page_num: page,
                page_size: pageSize,
                sort_order: 'desc'
            };

            const response = await authService.getFavoritePosts(params);
            if (response.code === 0) {
                setPosts(response.data.list);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('获取收藏帖子列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchSavedPosts(page);
    };

    // 处理帖子取消收藏后的刷新
    const handlePostUpdate = () => {
        fetchSavedPosts(currentPage);
    };

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    return (
        <div className="saved-topics-container">
            <div className="saved-topics-header">
                <h1 className="saved-topics-title">Saved Topics</h1>
            </div>
            <div className="saved-topics-content">
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        <div className="feed-container">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.post_id}
                                    post={post}
                                    onPostUpdate={handlePostUpdate}
                                />
                            ))}
                        </div>
                        <div className="pagination-container">
                            <Pagination
                                current={currentPage}
                                total={total}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="暂无收藏内容" />
                )}
            </div>
        </div>
    );
};

export default SavedTopics; 