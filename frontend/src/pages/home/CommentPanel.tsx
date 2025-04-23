import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { Post } from './types';
import { PostCard } from './PostCard';

interface CommentPanelProps {
    postId: string;
    onAddComment: (content: string) => Promise<void>;
    onLoadMore: () => Promise<void>;
    comments: Post[];
    hasMore: boolean;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
    postId,
    onAddComment,
    onLoadMore,
    comments,
    hasMore
}) => {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!commentText.trim()) {
            message.warning('请输入评论内容');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAddComment(commentText);
            setCommentText(''); // 清空输入框
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="comments-panel">
            <div className="comments-divider" />

            {/* 评论输入区域 */}
            <div className="comment-input-container">
                <Input
                    className="comment-input"
                    placeholder="Add a reply..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onPressEnter={handleSubmit}
                />
                <Button
                    className="comment-submit-button"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    Comment
                </Button>
            </div>

            {/* 评论列表 */}
            <div className="comments-list">
                {comments.map(comment => (
                    <PostCard key={comment.id} post={comment} isComment={true} />
                ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && (
                <div className="view-more-button" onClick={onLoadMore}>
                    view more replies
                </div>
            )}
        </div>
    );
}; 