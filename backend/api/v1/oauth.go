package v1

import (
	"OpenHouse/model/response"
	"OpenHouse/service"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// EmailLoginRequest 邮箱验证码登录请求
type EmailLoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

// GitHubLoginRequest GitHub登录回调参数
type GitHubLoginRequest struct {
	Code string `form:"code" binding:"required"`
}

// GoogleLoginRequest Google登录回调参数
type GoogleLoginRequest struct {
	Code string `form:"code" binding:"required"`
}

// EmailLogin
// @Summary 邮箱验证码登录
// @Tags Auth
// @Accept json
// @Produce json
// @Param data body EmailLoginRequest true "邮箱+验证码"
// @Success 200 {object} response.Response{data=service.AuthResult}
// @Router /api/v1/auth/email_login [post]
func EmailLogin(c *gin.Context) {
	var req EmailLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 这里应验证验证码是否正确（假设通过）
	authInput := service.AuthInput{
		Provider:    service.ProviderEmail,
		ProviderID:  req.Email,
		DisplayName: req.Email,
		AvatarURL:   "", // 邮箱没头像
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithData(result, c)
}

// GitHubCallback
// @Summary GitHub登录回调
// @Tags Auth
// @Accept json
// @Produce json
// @Param code query string true "GitHub回调Code"
// @Success 200 {object} response.Response{data=service.AuthResult}
// @Router /api/v1/auth/github_callback [get]
func GitHubCallback(c *gin.Context) {
	var req GitHubLoginRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	authInput, err := service.GetGitHubUserInfo(req.Code)
	if err != nil {
		response.FailWithMessage("GitHub认证失败", c)
		return
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	// 这里可以设置一个重定向URL，跳转到前端页面
	redirectURL := fmt.Sprintf("http://openhouse.horik.cn/#/oauth_success?token=%s", result.Token)
	c.Redirect(http.StatusFound, redirectURL)
}

// GoogleCallback
// @Summary Google登录回调
// @Tags Auth
// @Accept json
// @Produce json
// @Param code query string true "Google回调Code"
// @Success 200 {object} response.Response{data=service.AuthResult}
// @Router /api/v1/auth/google_callback [get]
func GoogleCallback(c *gin.Context) {
	// var req GoogleLoginRequest
	// if err := c.ShouldBindQuery(&req); err != nil {
	// 	response.FailWithMessage("参数错误", c)
	// 	return
	// }

	// authInput, err := service.GetGoogleUserInfo(req.Code)
	// if err != nil {
	// 	response.FailWithMessage("Google认证失败", c)
	// 	return
	// }

	// result, err := service.LoginOrRegister(authInput)
	// if err != nil {
	// 	response.FailWithMessage(err.Error(), c)
	// 	return
	// }

	// // 这里可以设置一个重定向URL，跳转到前端页面
	// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/#/oauth_success?token=%s", result.Token)
	// c.Redirect(http.StatusFound, redirectURL)
}
