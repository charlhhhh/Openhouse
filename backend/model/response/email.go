package response

type GetVerifyCodeQ struct {
	Email string `json:"email" binding:"required"`
}
