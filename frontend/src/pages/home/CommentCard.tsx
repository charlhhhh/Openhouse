import React from 'react';
import { Avatar, Card, Space, Tag } from 'antd';
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
                        src={comment.author.avatar}
                        size={48}
                    />
                    <div className="user-info">
                        <div className="user-info-container">
                            <span className="user-name">{comment.author.name}</span>
                        </div>
                        <div>
                            {comment.author.tags.map((tag, index) => (
                                <Tag key={index} className="user-tag">
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                    </div>
                </Space>
                <span className="post-date">{comment.date}</span>
            </div>
            <p className="post-content">{comment.content}</p>
        </Card>
    );
}; 