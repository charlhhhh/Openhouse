package v1

import (
	"OpenHouse/model/response"
	"OpenHouse/service"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"

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

// SendVerifyEmail 获取验证码
// @Summary     获取申请验证码
// @Description 用户点击"获取验证码"按钮，系统向用户提供的邮箱发送6位验证码，用户需要在申请表单中填入验证码才可以成功完成身份验证，否则不应该可以提交申请。验证码时限为10分钟，超时无效
// @Tags        Auth
// @Param       data body response.GetVerifyCodeQ true "data"
// @Accept      json
// @Produce     json
// @Success     200 {string} json "{"msg": "邮件发送成功","status": 200}"
// @Failure     400 {string} json "{"msg": "数据格式错误", "status": 400}"
// @Failure     401 {string} json "{"msg": "没有该用户", "status": 401}"
// @Failure     402 {string} json "{"msg": "验证码存储失败","status": 402}"
// @Failure     403 {string} json "{"msg": "发送邮件失败","status": 403}"
// @Router      /api/v1/auth/email/send [post]
func SendVerifyEmail(c *gin.Context) {
	var d response.GetVerifyCodeQ
	if err := c.ShouldBind(&d); err != nil {
		c.JSON(400, gin.H{"msg": "数据格式错误", "status": 400})
		return
	}
	email := d.Email
	code := ""
	for i := 0; i < 6; i++ {
		code += strconv.Itoa(rand.Int() % 10)
	}
	fmt.Println(code)
	err := service.CreateVerifyCodeRecode(code, email)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"msg": "验证码存储失败", "status": 402})
		return
	}

	err = service.SendVerifyCode(email, code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "发送邮件失败", "status": 403})
		return
	}
	c.JSON(http.StatusOK, gin.H{"msg": "邮件发送成功", "status": 200})
}

// EmailLogin
// @Summary 邮箱验证码验证
// @Description 验证邮箱验证码是否正确,如果正确则登录或注册用户
// @Tags Auth
// @Accept json
// @Produce json
// @Param data body EmailLoginRequest true "邮箱+验证码"
// @Success 200 {object} response.Response{data=service.AuthResult}
// @Router /api/v1/auth/email/verify [post]
func EmailLogin(c *gin.Context) {
	var req EmailLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	// 检查验证码是否正确
	// prase code to int
	code, err := strconv.Atoi(req.Code)
	if err != nil {
		response.FailWithMessage("验证码格式错误", c)
		return
	}
	rec, notFound := service.CheckVerifyCode(0, code, req.Email)
	if notFound {
		response.FailWithMessage("验证码错误或已过期", c)
		return
	}

	authInput := service.AuthInput{
		Provider:    service.ProviderEmail,
		ProviderID:  rec.Email,
		DisplayName: rec.Email,
		AvatarURL:   "", // 邮箱没头像
		UUID:        "",
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithData(result, c)
}

// GitHubCallback
// @Summary GitHub登录回调, 前端不调用该API
// Github登录时，直接跳转: https://github.com/login/oauth/authorize?scope=user:email&client_id=Ov23liKlSNhwhBevQPD7
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

	// 设置一个重定向URL，跳转到前端页面,本地测试
	fmt.Println("result.Token", result.Token)
	redirectURL := fmt.Sprintf("http://localhost:5173/oauth_success?token=%s", result.Token)
	// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/oauth_success?token=%s", result.Token)
	c.Redirect(http.StatusFound, redirectURL)
}

// GoogleCallback
// @Summary Google 登录回调，前端不调用该接口
// @Tags Auth
// @Accept json
// @Produce json
// @Param code query string true "Google 回调 code"
// @Success 302 {string} string "跳转至前端 oauth_success 页面"
// @Router /api/v1/auth/google_callback [get]
func GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		response.FailWithMessage("缺少 code 参数", c)
		return
	}

	authInput, err := service.GetGoogleUserInfo(code)
	if err != nil {
		response.FailWithMessage("Google 认证失败："+err.Error(), c)
		return
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	redirectURL := fmt.Sprintf("http://localhost:5173/#/oauth_success?token=%s", result.Token)
	// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/oauth_success?token=%s", result.Token)

	c.Redirect(http.StatusFound, redirectURL)
}
