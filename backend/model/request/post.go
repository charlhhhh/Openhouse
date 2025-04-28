package request

// CreatePostRequest 请求参数
type CreatePostRequest struct {
	Title     string   `json:"title" binding:"required,max=100"`    // 帖子标题 100 字符以内
	Content   string   `json:"content" binding:"required"`          // 帖子内容
	ImageURLs []string `json:"image_urls" binding:"max=3,dive,url"` // 最多3张图片，每张是合法 URL
}

// UpdatePostRequest 请求参数
type UpdatePostRequest struct {
	PostID    uint     `json:"post_id" binding:"required"`          // 帖子 ID
	Title     string   `json:"title" binding:"required,max=100"`    // 帖子标题 100 字符以内
	Content   string   `json:"content" binding:"required"`          // 帖子内容
	ImageURLs []string `json:"image_urls" binding:"max=3,dive,url"` // 最多3张图片，每张是合法 URL
}

// ListPostRequest 获取帖子列表的请求
type ListPostRequest struct {
	PageNum   int    `json:"page_num" binding:"required,min=1"`             // 页码
	PageSize  int    `json:"page_size" binding:"required,min=1,max=50"`     // 每页条数
	SortOrder string `json:"sort_order" binding:"omitempty,oneof=asc desc"` // 时间排序 asc / desc（默认 desc）
}

// DeletePostRequest 请求参数
type DeletePostRequest struct {
	PostID uint `json:"post_id" binding:"required"`
}

type FavoritePostRequest struct {
	PostID uint `json:"post_id" binding:"required"`
}

type LikePostRequest struct {
	PostID uint `json:"post_id" binding:"required"`
}

type PostDetailRequest struct {
	PostID uint `json:"post_id" binding:"required"`
}
