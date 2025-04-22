import React, { useState } from 'react';
import { Avatar, Button, Card, Space, Tag, Tooltip } from 'antd';
import { Post } from './types';
import { CommentPanel } from './CommentPanel';
import { fetchComments, addComment } from './mockData';

interface PostCardProps {
    post: Post;
    isComment?: boolean;
}

const ActionButton = ({ icon, text, tooltip, onClick }: {
    icon: string;
    text?: number;
    tooltip: string;
    onClick?: () => void;
}) => (
    <Tooltip title={tooltip}>
        <Button className="action-button" onClick={onClick}>
            <img src={icon} alt={tooltip} className="action-icon" />
            {text !== undefined && <span className="action-text">{text}</span>}
        </Button>
    </Tooltip>
);

export const PostCard: React.FC<PostCardProps> = ({ post, isComment = false }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Post[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const loadComments = async () => {
        if (isLoadingComments) return;

        setIsLoadingComments(true);
        try {
            const newComments = await fetchComments(post.id, page);
            setComments(prev => [...prev, ...newComments]);
            setHasMore(newComments.length === 5);
            setPage(prev => prev + 1);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleAddComment = async (content: string) => {
        const newComment = await addComment(post.id, content);
        setComments(prev => [newComment, ...prev]);
        post.stats.comments += 1;
    };

    return (
        <Card className={`post-card ${isComment ? 'comment-card' : ''}`}>
            <div className="post-header">
                <Space>
                    <Avatar
                        className="user-avatar"
                        src={post.author.avatar}
                        size={48}
                    />
                    <div className="user-info">
                        <div className="user-info-container">
                            <span className="user-name">{post.author.name}</span>
                            {!isComment && post.author.isFollowing !== undefined && (
                                <Button
                                    className={`action-button user-follow-button ${post.author.isFollowing ? 'following' : 'not-following'
                                        }`}
                                >
                                    {post.author.isFollowing ? "已关注" : "关注"}
                                </Button>
                            )}
                        </div>
                        <div>
                            {post.author.tags.map((tag, index) => (
                                <Tag key={index} className="user-tag">{tag}</Tag>
                            ))}
                        </div>
                    </div>
                </Space>
                <span className="post-date">{post.date}</span>
            </div>

            {post.title && <h3 className="post-title">{post.title}</h3>}
            <p className="post-content">{post.content}</p>

            {post.images && post.images.length > 0 && (
                <div className="post-images">
                    {post.images.map((image, index) => (
                        <img key={index} src={image} alt="" className="post-image" />
                    ))}
                </div>
            )}

            <div className="post-actions">
                <ActionButton
                    icon="/icon_read.svg"
                    text={post.stats.views}
                    tooltip="浏览次数"
                />
                <ActionButton
                    icon="/icon_comment.svg"
                    text={post.stats.comments}
                    tooltip="评论"
                    onClick={() => {
                        setShowComments(!showComments);
                        if (!showComments && comments.length === 0) {
                            loadComments();
                        }
                    }}
                />
                <ActionButton
                    icon="/icon_check.svg"
                    text={post.stats.likes}
                    tooltip="赞同"
                />
                <ActionButton
                    icon="/icon_hotness.svg"
                    tooltip="分享"
                />
            </div>

            {showComments && (
                <CommentPanel
                    postId={post.id}
                    comments={comments}
                    hasMore={hasMore}
                    onAddComment={handleAddComment}
                    onLoadMore={loadComments}
                />
            )}
        </Card>
    );
}; 