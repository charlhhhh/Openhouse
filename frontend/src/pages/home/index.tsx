import { Avatar, Button, Card, Space, Tag, Tooltip, Spin, Empty, Pagination } from 'antd';
import './styles.css';
import { useState, useEffect } from 'react';
import { CommentPanel } from './CommentPanel';
import { Post, PostListParams } from './types';
import { SageSheet } from '../../components/SageSheet';
import { PostCard } from './PostCard';
import { postService } from '../../services/post';

const BannerCard = ({ image, title, tag, onClick }: { image: string; title: string; tag: string; onClick?: () => void }) => (
    <div className="banner-card" onClick={onClick}>
        <div
            className="banner-card-content"
            style={{ backgroundImage: `url(${image})` }}
        >
            <h2 className="banner-title">{title}</h2>
            <div className="banner-tag">{tag}</div>
        </div>
    </div>
);

export default function Home() {
    const [sageSheetVisible, setSageSheetVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const handleSageClick = () => {
        setSageSheetVisible(true);
    };

    const fetchPosts = async (page: number = 1) => {
        setLoading(true);
        try {
            const params: PostListParams = {
                page_num: page,
                page_size: pageSize,
                sort_order: 'desc'
            };

            const response = await postService.getFeedList(params);
            if (response.code === 0) {
                setPosts(response.data.list);
                setTotal(response.data.total);
            }
        } catch (error) {
            console.error('获取帖子列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchPosts(page);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="home-container">
            <div className="home-content">
                <div className="banner-container">
                    <BannerCard
                        image="/banner_sage.png"
                        title="AI Sage"
                        tag="Find More"
                        onClick={handleSageClick}
                    />
                    <BannerCard
                        image="/banner_find.png"
                        title="寻找同行"
                        tag="开始交流"
                    />
                </div>

                <div className="feed-container">
                    {loading ? (
                        <div className="loading-container">
                            <Spin size="large" />
                        </div>
                    ) : posts.length > 0 ? (
                        <>
                            {posts.map((post) => (
                                <PostCard key={post.post_id} post={post} />
                            ))}
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
                        <Empty description="暂无内容" />
                    )}
                </div>
            </div>

            <SageSheet
                visible={sageSheetVisible}
                onClose={() => setSageSheetVisible(false)}
            />
        </div>
    );
}