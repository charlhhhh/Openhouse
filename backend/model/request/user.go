package request

// UpdateProfileRequest 定义只更新部分字段
type UpdateProfileRequest struct {
	IsVerified   *bool     `json:"is_verified"`
	Username     *string   `json:"username"`
	Gender       *string   `json:"gender"`
	IntroShort   *string   `json:"intro_short"`
	IntroLong    *string   `json:"intro_long"`
	Tags         *[]string `json:"tags"`
	ResearchArea *string   `json:"research_area"`
}

// UploadAvatarRequest 头像上传接口
type UploadAvatarRequest struct {
	AvatarURL string `json:"avatar_url" binding:"required"`
}
