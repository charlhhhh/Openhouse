package response

import "time"

// PostInfo 用于返回帖子信息

type PostInfo struct {
	PostID         uint      `json:"post_id"`
	AuthorUUID     string    `json:"author_uuid"`
	Title          string    `json:"title"`
	Content        string    `json:"content"`
	ImageURLs      []string  `json:"image_urls"`
	CreateDate     time.Time `json:"create_date"`
	StarNumber     int       `json:"star_number"`
	FavoriteNumber int       `json:"favorite_number"`
	ViewNumber     int       `json:"view_number"`
	CommentNumber  int       `json:"comment_number"`

	// 新增发帖用户信息字段
	Username    string `json:"username"`
	IntroLong   string `json:"intro_long"`
	AvatarURL   string `json:"avatar_url"`
	IsFollowing bool   `json:"is_following"`
}

// PostListResponse 用于返回分页帖子
type PostListResponse struct {
	Total int        `json:"total"` // 总条数
	List  []PostInfo `json:"list"`  // 当前页帖子
}

// PostDetailResponse = PostInfo + 用户态信息
type PostDetailResponse struct {
	PostInfo
	IsLiked     bool `json:"is_liked"`
	IsFavorited bool `json:"is_favorited"`
}
