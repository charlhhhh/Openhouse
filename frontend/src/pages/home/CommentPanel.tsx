import React, { useState, useEffect } from 'react';
import { Avatar, Button, Input, Space, message } from 'antd';
import { Comment, CommentListParams } from './types';
import { authService } from '../../services/auth';
import { formatPostDate } from '../../utils/dateFormat';
import { LikeOutlined, MessageOutlined } from '@ant-design/icons';

interface CommentPanelProps {
    postId: number;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({ postId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [expandedComments, setExpandedComments] = useState<number[]>([]);
    const [repliesList, setRepliesList] = useState<{ [key: number]: Comment[] }>({});
    const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});

    const fetchComments = async () => {
        try {
            setLoading(true);
            const params: CommentListParams = {
                post_id: postId,
                page_num: 1,
                page_size: 50,
                sort_by: 'time'
            };
            const response = await authService.getCommentsList(params);
            if (response.data?.list) {
                setComments(response.data.list.map(comment => ({
                    ...comment,
                    replies: [],
                    replies_more_count: 0  // 初始化回复数
                })));
            }
        } catch (error) {
            message.error('Failed to get comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);
    const fetchReplies = async (commentId: number) => {
        try {
            const response = await authService.getCommentReplies({
                comment_id: commentId,
                page_num: 1,
                page_size: 50
            });
            if (response.data?.list) {
                setRepliesList(prev => ({
                    ...prev,
                    [commentId]: response.data.list
                }));
            }
        } catch (error) {
            message.error('获取回复失败');
        }
    };

    const handleSubmitComment = async () => {
        if (!commentContent.trim()) {
            message.warning('Please enter a comment');
            return;
        }

        try {
            setLoading(true);
            const params = replyingTo
                ? { post_id: postId, comment_id: replyingTo, content: commentContent.trim() }
                : { post_id: postId, content: commentContent.trim() };

            await authService.createComment(params);
            message.success('评论成功');
            setCommentContent('');
            if (replyingTo) {
                await fetchReplies(replyingTo);
            }
            await fetchComments();
            setReplyingTo(null);
        } catch (error) {
            message.error('评论失败');
        } finally {
            setLoading(false);
        }
    };

    const handleLikeComment = async (commentId: number, isLiked: boolean) => {
        try {
            if (isLiked) {
                await authService.unlikeComment(commentId);
            } else {
                await authService.likeComment(commentId);
            }

            // 更新评论列表中的点赞状态
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            is_liked: !isLiked,
                            like_number: isLiked ? comment.like_number - 1 : comment.like_number + 1
                        };
                    }
                    return comment;
                })
            );

            // 更新回复列表中的点赞状态
            setRepliesList(prevReplies => {
                const newReplies = { ...prevReplies };
                Object.keys(newReplies).forEach((key: string) => {
                    newReplies[Number(key)] = newReplies[Number(key)].map((reply: Comment) => {
                        if (reply.id === commentId) {
                            return {
                                ...reply,
                                is_liked: !isLiked,
                                like_number: isLiked ? reply.like_number - 1 : reply.like_number + 1
                            };
                        }
                        return reply;
                    });
                });
                return newReplies;
            });
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleReplyClick = async (commentId: number) => {
        setReplyingTo(replyingTo === commentId ? null : commentId);
        setShowReplies(prev => ({
            ...prev,
            [commentId]: true
        }));

        if (!repliesList[commentId]) {
            await fetchReplies(commentId);
        }
    };

    const renderReplies = (commentId: number) => {
        const replies = repliesList[commentId] || [];
        return (
            <div className="replies-container">
                {replies.map((reply: Comment) => (
                    <div key={reply.id} className="reply-item">
                        <div className="reply-header">
                            <Space>
                                <Avatar src={reply.avatar_url || '/default-avatar.png'} size={32} />
                                <div className="comment-info">
                                    <span className="comment-username">{reply.username || '匿名用户'}</span>
                                    <span className="comment-date">{formatPostDate(reply.create_time)}</span>
                                </div>
                            </Space>
                        </div>
                        <div className="reply-content">{reply.content}</div>
                        <div className="reply-actions">
                            <Button
                                className={`action-button ${reply.is_liked ? 'liked' : ''}`}
                                onClick={() => handleLikeComment(reply.id, reply.is_liked)}
                            >
                                <img src="/icon_check.svg" className="action-icon" />
                                <span className={`action-text ${reply.is_liked ? 'active' : ''}`}>
                                    {reply.like_number}
                                </span>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderComment = (comment: Comment) => (
        <div key={comment.id} className="comment-item">
            <div className="comment-header">
                <Space>
                    <Avatar src={comment.avatar_url} size={32} />
                    <div className="comment-info">
                        <span className="comment-username">{comment.username}</span>
                        <span className="comment-date">{formatPostDate(comment.create_time)}</span>
                    </div>
                </Space>
            </div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-actions">
                <Button
                    className={`action-button ${comment.is_liked ? 'liked' : ''}`}
                    onClick={() => handleLikeComment(comment.id, comment.is_liked)}
                >
                    <img src="/icon_check.svg" className="action-icon" />
                    <span className={`action-text ${comment.is_liked ? 'active' : ''}`}>
                        {comment.like_number}
                    </span>
                </Button>
                <Button
                    className="action-button"
                    onClick={() => handleReplyClick(comment.id)}
                >
                    <img src="/icon_comment.svg" className="action-icon" />
                    <span className="action-text">Reply</span>
                </Button>
            </div>
            {replyingTo === comment.id && (
                <>
                    <div className="reply-input-container">
                        <Input
                            className="comment-input"
                            placeholder={`Reply To ${comment.username}`}
                            value={commentContent}
                            onChange={e => setCommentContent(e.target.value)}
                            onPressEnter={handleSubmitComment}
                        />
                        <Button
                            className="comment-submit-button"
                            onClick={handleSubmitComment}
                        >
                            Comment
                        </Button>
                    </div>
                </>
            )}
            {repliesList[comment.id]?.length > 0 && renderReplies(comment.id)}
        </div>
    );

    return (
        <div className="comments-panel">
            <div className="comments-divider" />
            {!replyingTo && (
                <div className="comment-input-container">
                    <Input
                        className="comment-input"
                        placeholder="发表评论..."
                        value={commentContent}
                        onChange={e => setCommentContent(e.target.value)}
                        onPressEnter={handleSubmitComment}
                    />
                    <Button
                        className="comment-submit-button"
                        onClick={handleSubmitComment}
                    >
                        发表
                    </Button>
                </div>
            )}
            <div className="comments-list">
                {comments.map(renderComment)}
            </div>
        </div>
    );
}; 