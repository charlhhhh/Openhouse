import React, { useState } from 'react';
import { Avatar, Button, Card, Modal, Space, Tooltip, message, Spin } from 'antd';
import { Post } from './types';
import { formatPostDate } from '../../utils/dateFormat';
import { postService } from '../../services/post';
import { authService } from '../../services/auth';
import { CommentPanel } from './CommentPanel';
import './styles.css';

interface PostCardProps {
    post: Post;
    onPostUpdate?: () => void;
}

const ActionButton = ({ icon, text, onClick, isActive }: {
    icon: string;
    text?: number;
    onClick?: () => void;
    isActive?: boolean;
}) => (
    <Button
        className={`action-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
        <img src={icon} className="action-icon" />
        {text !== undefined && (
            <span className={`action-text ${isActive ? 'active' : ''}`}>
                {text}
            </span>
        )}
    </Button>
);

const PostImages: React.FC<{ imageUrls: string[]; onImageClick: (url: string) => void }> = ({ imageUrls, onImageClick }) => {
    const [loadingArr, setLoadingArr] = useState<boolean[]>(imageUrls.map(() => true));

    const handleImageLoad = (idx: number) => {
        setLoadingArr(arr => {
            const newArr = [...arr];
            newArr[idx] = false;
            return newArr;
        });
    };

    return (
        <div className="post-images">
            {imageUrls.slice(0, 3).map((image, index) => (
                <div
                    key={index}
                    className="image-container"
                    style={{ position: 'relative' }}
                    onClick={() => onImageClick(image)}
                >
                    {loadingArr[index] && (
                        <div
                            style={{
                                position: 'absolute',
                                left: 0, top: 0, right: 0, bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#F5F7FA',
                                borderRadius: 8,
                                zIndex: 1
                            }}
                        >
                            <Spin />
                        </div>
                    )}
                    <img
                        src={image}
                        alt=""
                        style={{
                            height: '100%',
                            objectFit: 'scale-down',
                            borderRadius: '8px',
                            display: loadingArr[index] ? 'none' : 'block'
                        }}
                        onLoad={() => handleImageLoad(index)}
                    />
                </div>
            ))}
        </div>
    );
};

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate }) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isStarred, setIsStarred] = useState(post.is_starred);
    const [isFavorited, setIsFavorited] = useState(post.is_favorited);
    const [starCount, setStarCount] = useState(post.star_number);
    const [favCount, setFavCount] = useState(post.favorite_number);
    const [isFollowing, setIsFollowing] = useState(post.is_following);
    const [showComments, setShowComments] = useState(false);

    const handleImageClick = (imageUrl: string) => {
        setPreviewImage(imageUrl);
    };

    const handleStar = async () => {
        try {
            if (isStarred) {
                await postService.unstarPost(post.post_id.toString());
                setStarCount(prev => prev - 1);
            } else {
                await postService.starPost(post.post_id.toString());
                setStarCount(prev => prev + 1);
            }
            setIsStarred(!isStarred);
        } catch (error) {
            message.error('操作失败，请稍后重试');
        }
    };

    const handleFavorite = async () => {
        try {
            if (isFavorited) {
                await postService.unfavoritePost(post.post_id.toString());
                setFavCount(prev => prev - 1);
            } else {
                await postService.favoritePost(post.post_id.toString());
                setFavCount(prev => prev + 1);
            }
            setIsFavorited(!isFavorited);
            onPostUpdate?.();
        } catch (error) {
            message.error('操作失败，请稍后重试');
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await authService.unfollowUser(post.author_uuid);
                message.success('已取消关注');
            } else {
                await authService.followUser(post.author_uuid);
                message.success('关注成功');
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            message.error('操作失败，请稍后重试');
        }
    };

    return (
        <Card className="post-card">
            <div className="post-header">
                <Space>
                    <Avatar
                        className="user-avatar"
                        src={post.avatar_url}
                        size={48}
                    />
                    <div className="user-info">
                        <div className="user-info-container">
                            <span className="user-name">{post.username}</span>
                            {post.is_following !== undefined && (
                                <Button
                                    className={`action-button user-follow-button ${isFollowing ? 'following' : 'not-following'}`}
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </Button>
                            )}
                        </div>
                        <div className="user-intro">
                            <span>{post.intro_short}</span>
                        </div>
                    </div>
                </Space>
                <span className="post-date">{formatPostDate(post.create_date)}</span>
            </div>

            {post.title && <h3 className="post-title">{post.title}</h3>}
            <p className="post-content">{post.content}</p>

            {post.image_urls && post.image_urls.length > 0 && (
                <PostImages imageUrls={post.image_urls} onImageClick={handleImageClick} />
            )}

            <div className="post-actions">
                <ActionButton
                    icon="/icon_read.svg"
                    text={post.view_number}
                />
                <ActionButton
                    icon="/icon_comment.svg"
                    text={post.comment_number}
                    onClick={() => setShowComments(!showComments)}
                    isActive={showComments}
                />
                <ActionButton
                    icon="/icon_check.svg"
                    text={starCount}
                    onClick={handleStar}
                    isActive={isStarred}
                />
                <ActionButton
                    icon="/icon_hotness.svg"
                    text={favCount}
                    onClick={handleFavorite}
                    isActive={isFavorited}
                />
            </div>

            {showComments && (
                <CommentPanel postId={post.post_id} />
            )}

            <Modal
                open={!!previewImage}
                footer={null}
                onCancel={() => setPreviewImage(null)}
                width="auto"
                centered
                closable={true}
                maskClosable={true}
                styles={{
                    body: {
                        padding: 0,
                        lineHeight: 0,
                    },
                }}
            >
                {previewImage && (
                    <img
                        src={previewImage}
                        alt="预览图"
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            objectFit: 'contain'
                        }}
                    />
                )}
            </Modal>
        </Card>
    );
}; 