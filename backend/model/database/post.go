package database

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Post struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Title          string         `gorm:"type:varchar(100);not null" json:"title"`
	AuthorUUID     string         `gorm:"type:char(36);not null;index" json:"author_uuid"`
	Content        string         `gorm:"type:text" json:"content"`
	ImageURLs      datatypes.JSON `gorm:"type:json" json:"image_urls"` // 仍用 datatypes.JSON 存储
	CreateDate     time.Time      `gorm:"autoCreateTime" json:"create_date"`
	StarNumber     int            `gorm:"default:0" json:"star_number"`
	FavoriteNumber int            `gorm:"default:0" json:"favorite_number"`
	ViewNumber     int            `gorm:"default:0" json:"view_number"`
	CommentNumber  int            `gorm:"default:0" json:"comment_number"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
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
