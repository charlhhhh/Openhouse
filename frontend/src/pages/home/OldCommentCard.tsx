import React from 'react';
import { Avatar, Card, Space } from 'antd';
import { Comment } from './types';

interface CommentCardProps {
    comment: Comment;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
    return (
        <Card className="post-card" bordered={false}>
            <div className="post-header">
                <Space>
                    <Avatar
                        className="user-avatar"
                        src={comment.avatar_url}
                        size={48}
                    />
                    <div className="user-info">
                        <div className="user-info-container">
                            <span className="user-name">{comment.username}</span>
                        </div>
                    </div>
                </Space>
                <span className="post-date">{comment.create_time}</span>
            </div>
            <p className="post-content">{comment.content}</p>
        </Card>
    );
}; 