package request

// FollowRequest 用户关注请求
type FollowRequest struct {
	FollowedUUID string `json:"followed_uuid" binding:"required"`
}

type FollowListRequest struct {
	PageNum  int `json:"page_num" binding:"required,min=1"`
	PageSize int `json:"page_size" binding:"required,min=1,max=50"`
}

// FollowStatusRequest 判断是否关注某用户
type FollowStatusRequest struct {
	TargetUUID string `json:"target_uuid" binding:"required"`
}
