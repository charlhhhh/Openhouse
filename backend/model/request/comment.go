package request

type CreateCommentRequest struct {
	PostID    uint   `json:"post_id" binding:"required"`
	CommentID *uint  `json:"comment_id"` // 可选，若为 null 表示一级评论
	Content   string `json:"content" binding:"required,min=1,max=500"`
}

type ListCommentRequest struct {
	PostID   uint   `json:"post_id" binding:"required"`
	PageNum  int    `json:"page_num" binding:"required,min=1"`
	PageSize int    `json:"page_size" binding:"required,min=1,max=50"`
	SortBy   string `json:"sort_by" binding:"omitempty,oneof=time likes"`
}

type LikeCommentRequest struct {
	CommentID uint `json:"comment_id" binding:"required"`
}

type ListReplyRequest struct {
	CommentID uint `json:"comment_id" binding:"required"`             // 父评论 ID
	PageNum   int  `json:"page_num" binding:"required,min=1"`         // 页码
	PageSize  int  `json:"page_size" binding:"required,min=1,max=50"` // 每页条数，前端默认每次传 5
}
