package response

import "time"

type CommentInfo struct {
	ID         uint      `json:"id"`
	PostID     uint      `json:"post_id"`
	CommentID  *uint     `json:"comment_id"`
	Content    string    `json:"content"`
	CreateTime time.Time `json:"create_time"`
	LikeNumber int       `json:"like_number"`

	// 评论用户信息
	AuthorUUID string `json:"author_uuid"`
	Username   string `json:"username"`
	AvatarURL  string `json:"avatar_url"`

	// 当前用户是否点赞
	IsLiked bool `json:"is_liked"`

	// 子评论信息
	Replies          []CommentInfo `json:"replies,omitempty"`
	RepliesMoreCount int           `json:"replies_more_count,omitempty"`
}
