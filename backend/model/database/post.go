package database

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Post struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Title         string         `gorm:"type:varchar(100);not null" json:"title"`
	AuthorUUID    string         `gorm:"type:char(36);not null;index" json:"author_uuid"`
	Content       string         `gorm:"type:text" json:"content"`
	ImageURLs     datatypes.JSON `gorm:"type:json" json:"image_urls"` // 仍用 datatypes.JSON 存储
	CreateDate    time.Time      `gorm:"autoCreateTime" json:"create_date"`
	StarNumber    int            `gorm:"default:0" json:"star_number"`
	ViewNumber    int            `gorm:"default:0" json:"view_number"`
	CommentNumber int            `gorm:"default:0" json:"comment_number"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// PostComment 帖子评论表
type PostComment struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	PostID     uint           `gorm:"not null;index" json:"post_id"`     // 外键关联帖子
	CommentID  *uint          `gorm:"index" json:"comment_id,omitempty"` // 父评论ID，支持为空
	AuthorUUID string         `gorm:"type:char(36);not null;index" json:"author_uuid"`
	Content    string         `gorm:"type:text;not null" json:"content"` // 评论内容
	LikeNumber int            `gorm:"default:0" json:"like_number"`      // 点赞数
	CreateDate time.Time      `gorm:"autoCreateTime" json:"create_date"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"` // 软删除
}

// UserPostLike 用户点赞帖子表
type UserPostLike struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    string         `gorm:"type:char(36);not null;index" json:"user_id"`
	PostID    uint           `gorm:"not null;index" json:"post_id"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// UserFollow 用户关注关系表
type UserFollow struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    string         `gorm:"type:char(36);not null;index" json:"user_id"`   // 谁关注
	FollowID  string         `gorm:"type:char(36);not null;index" json:"follow_id"` // 关注谁
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// UserPostFavorite 用户收藏帖子表
type UserPostFavorite struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    string         `gorm:"type:char(36);not null;index" json:"user_id"`
	PostID    uint           `gorm:"not null;index" json:"post_id"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
