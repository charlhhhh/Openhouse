package database

import (
	"time"

	"gorm.io/gorm"
)

// PostComment 帖子评论表
type PostComment struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	PostID     uint           `gorm:"index;not null" json:"post_id"`
	CommentID  *uint          `gorm:"index" json:"comment_id"` // null 表示一级评论
	AuthorUUID string         `gorm:"type:char(36);index;not null" json:"author_uuid"`
	Content    string         `gorm:"type:text;not null" json:"content"`
	CreateTime time.Time      `gorm:"autoCreateTime" json:"create_time"`
	LikeNumber int            `gorm:"default:0" json:"like_number"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type CommentLike struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    string         `gorm:"type:char(36);index;not null" json:"user_id"`
	CommentID uint           `gorm:"index;not null" json:"comment_id"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
