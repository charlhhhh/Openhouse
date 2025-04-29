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

// EmailLoginRequest Email login request
type EmailLoginRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

// GitHubLoginRequest GitHub login callback parameters
type GitHubLoginRequest struct {
	Code string `form:"code" binding:"required"`
}

// GoogleLoginRequest Google login callback parameters
type GoogleLoginRequest struct {
	Code string `form:"code" binding:"required"`
}

// SendVerifyEmail Send verification email
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
		c.JSON(400, gin.H{"msg": "Invalid data format", "status": 400})
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
		c.JSON(http.StatusOK, gin.H{"msg": "Failed to store verification code", "status": 402})
		return
	}

	err = service.SendVerifyCode(email, code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"msg": "Failed to send email", "status": 403})
		return
	}
	c.JSON(http.StatusOK, gin.H{"msg": "Email sent successfully", "status": 200})
}

// EmailLogin Verify email login
// @Summary 邮箱验证码验证
// @Description 验证邮箱验证码是否正确,如果正确则登录或注册用户
// @Description 如果用户已经注册，则绑定邮箱到当前用户
// @Tags Auth
// @Accept json
// @Produce json
// @Param data body EmailLoginRequest true "邮箱+验证码"
// @Success 200 {object} response.Response{data=service.AuthResult}
// @Router /api/v1/auth/email/verify [post]
func EmailLogin(c *gin.Context) {
	var req EmailLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters", c)
		return
	}

	code, err := strconv.Atoi(req.Code)
	if err != nil {
		response.FailWithMessage("Invalid verification code format", c)
		return
	}
	rec, notFound := service.CheckVerifyCode(0, code, req.Email)
	if notFound {
		response.FailWithMessage("Verification code is incorrect or expired", c)
		return
	}

	authInput := service.AuthInput{
		Provider:    service.ProviderEmail,
		ProviderID:  rec.Email,
		DisplayName: rec.Email,
		AvatarURL:   "",
		Email:       req.Email,
	}

	userUUID, _ := c.Get("uuid")
	if userUUIDStr, ok := userUUID.(string); ok {
		fmt.Println("Registered user binding email, UUID:", userUUIDStr)
		bindresult, err := service.BindAccount(authInput, userUUIDStr)
		if err != nil {
			response.FailWithMessage(err.Error(), c)
			return
		}
		response.OkWithData(bindresult, c)
		return
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithData(result, c)
}

// GitHubCallback GitHub login callback
// @Summary GitHub登录回调, 前端不调用该API
// @Description 用户在GitHub登录后，GitHub会回调该接口，并传递code参数
// @Description 该接口会使用code参数获取用户信息，并进行登录或注册
// @Description 如果用户已经注册，则绑定GitHub账号到当前用户
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
		response.FailWithMessage("Invalid parameters", c)
		return
	}

	authInput, err := service.GetGitHubUserInfo(req.Code)
	if err != nil {
		response.FailWithMessage("GitHub authentication failed", c)
		return
	}

	userUUID, _ := c.Get("uuid")
	if userUUIDStr, ok := userUUID.(string); ok {
		fmt.Println("Registered user binding GitHub, UUID:", userUUIDStr)
		bindresult, _ := service.BindAccount(authInput, userUUIDStr)
		fmt.Println("bindresult", bindresult)
		redirectURL := fmt.Sprintf("http://localhost:5173/bind_success?result=%s", bindresult.Result)
		// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/bind_success?result=%s", bindresult.Result)
		c.Redirect(http.StatusFound, redirectURL)
		return
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	redirectURL := fmt.Sprintf("http://localhost:5173/oauth_success?token=%s", result.Token)
	// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/oauth_success?token=%s", result.Token)
	c.Redirect(http.StatusFound, redirectURL)
}

// GoogleCallback Google login callback
// @Summary Google 登录回调，前端不调用该接口
// @Description 用户在Google登录后，Google会回调该接口，并传递code参数
// @Description 该接口会使用code参数获取用户信息，并进行登录或注册
// @Description 如果用户已经注册，则绑定Google账号到当前用户
// @Description 如果用户没有注册，则进行注册
// @Description 如果用户已经注册，则绑定Google账号到当前用户
// @Tags Auth
// @Accept json
// @Produce json
// @Param code query string true "Google 回调 code"
// @Success 302 {string} string "跳转至前端 oauth_success 页面"
// @Router /api/v1/auth/google_callback [get]
func GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		response.FailWithMessage("Missing code parameter", c)
		return
	}

	authInput, err := service.GetGoogleUserInfo(code)
	if err != nil {
		response.FailWithMessage("Google authentication failed: "+err.Error(), c)
		return
	}

	userUUID, _ := c.Get("uuid")
	if userUUIDStr, ok := userUUID.(string); ok {
		fmt.Println("Registered user binding Google, UUID:", userUUIDStr)
		bindresult, _ := service.BindAccount(authInput, userUUIDStr)
		redirectURL := fmt.Sprintf("http://localhost:5173/bind_success?result=%s", bindresult.Result)
		// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/bind_success?result=%s", bindresult.Result)
		c.Redirect(http.StatusFound, redirectURL)
		return
	}

	result, err := service.LoginOrRegister(authInput)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	if userUUID == nil {
		response.OkWithData(result, c)
		return
	}

	redirectURL := fmt.Sprintf("http://localhost:5173/oauth_success?token=%s", result.Token)
	// redirectURL := fmt.Sprintf("http://openhouse.horik.cn/oauth_success?token=%s", result.Token)

	c.Redirect(http.StatusFound, redirectURL)
}
