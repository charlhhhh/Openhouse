package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"strconv"
	"time"

	"encoding/json"
	"net/http"
	"net/url"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

// AuthProvider 定义支持的第三方登录方式
type AuthProvider string

const (
	ProviderEmail  AuthProvider = "email"
	ProviderGitHub AuthProvider = "github"
	ProviderGoogle AuthProvider = "google"
)

// AuthInput 通用登录输入
type AuthInput struct {
	Provider    AuthProvider
	ProviderID  string // 比如邮箱地址 / GitHub userID / Google sub
	DisplayName string
	AvatarURL   string
	Email       string
}

// AuthResult 返回登录结果
type AuthResult struct {
	Token string
}

// BindAccountResult 绑定账号结果
type BindAccountResult struct {
	Result string
}

// GenerateJWT 生成JWT Token
func GenerateJWT(uuid string) (string, error) {
	// 创建JWT声明
	claims := jwt.MapClaims{
		"uuid": uuid,
		"exp":  time.Now().Add(time.Hour * 72).Unix(), // 设置过期时间
	}

	// 使用HMAC签名生成JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(global.VP.GetString("jwt.secret")))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// SendEmailCode 发送验证码到邮箱
func SendMail(mailTo []string, subject string, body string) error {
	mailConn := map[string]string{
		"user": global.VP.GetString("smtp.username"),
		"pass": global.VP.GetString("smtp.password"),
		"host": global.VP.GetString("smtp.host"),
		"port": global.VP.GetString("smtp.port"),
	}

	port, _ := strconv.Atoi(mailConn["port"]) //转换端口类型为int

	m := gomail.NewMessage()

	m.SetHeader("From", m.FormatAddress(mailConn["user"], "OpenHouse")) //这种方式可以添加别名，即“XX官方”
	m.SetHeader("To", mailTo...)                                        //发送给多个用户
	m.SetHeader("Subject", subject)                                     //设置邮件主题
	m.SetBody("text/html", body)                                        //设置邮件正文

	d := gomail.NewDialer(mailConn["host"], port, mailConn["user"], mailConn["pass"])

	err := d.DialAndSend(m)
	return err
}

func SendVerifyCode(email string, code string) (err error) {
	subject := "Your OpenHouse Verification Code"
	// 邮件正文
	mailTo := []string{
		email,
	}
	body := "Hi,\n\n"
	body += "Your verification code is: " + code + "\n\n"
	body += "This code will expire in 10min. Please enter it in the application to verify your email.\n\n"
	body += "If you did not request this code, please ignore this email.\n\n"

	err = SendMail(mailTo, subject, body)
	if err != nil {
		log.Println(err)
		fmt.Println("send code fail")
		//panic(err)
		return err
	}
	fmt.Println("send code successfully")
	return nil
}

func CreateVerifyCodeRecode(code string, email string) (err error) {
	rec := database.VerifyCode{
		Code:    code,
		Email:   email,
		GenTime: time.Now(),
	}
	if err = global.DB.Create(&rec).Error; err != nil {
		return err
	}
	return nil
}

func CheckVerifyCode(userID uint64, code int, email string) (rec database.VerifyCode, notFound bool) {
	rec = database.VerifyCode{}
	err := global.DB.Where("code = ? AND email = ?", code, email).First(&rec).Error
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return rec, true
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		panic(err)
	} else {
		// todo 检查验证码是否过期
		return rec, false
	}
}

// getGitHubToken 获取GitHub的access_token
func getGitHubToken(code string) (string, error) {
	var clientID = global.VP.GetString("oauth.github_client_id")
	var clientSecret = global.VP.GetString("oauth.github_client_secret")

	// 准备POST form数据
	formData := url.Values{}
	formData.Set("client_id", clientID)
	formData.Set("client_secret", clientSecret)
	formData.Set("code", code)

	// POST到GitHub的access_token接口
	req, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBufferString(formData.Encode()))
	if err != nil {
		return "", errors.Wrap(err, "创建POST请求失败")
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", errors.Wrap(err, "请求GitHub获取access_token失败")
	}
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.Wrap(err, "读取GitHub返回失败")
	}
	var tokenResponse struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenResponse); err != nil {
		return "", errors.Wrap(err, "解析GitHub返回的token失败")
	}
	return tokenResponse.AccessToken, nil
}

func GetGitHubUserInfo(code string) (AuthInput, error) {
	var access_token, err = getGitHubToken(code)
	if err != nil {
		return AuthInput{}, errors.Wrap(err, "获取GitHub access_token失败")
	}

	// 用AccessToken去拿GitHub用户信息
	userInfoReq, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return AuthInput{}, errors.Wrap(err, "Error: creating request failed")
	}
	userInfoReq.Header.Set("Authorization", "Bearer "+access_token)

	client := &http.Client{}

	userResp, err := client.Do(userInfoReq)
	if err != nil {
		return AuthInput{}, errors.Wrap(err, "Eerror: requesting GitHub user info failed")
	}
	defer userResp.Body.Close()

	userBytes, err := io.ReadAll(userResp.Body)
	if err != nil {
		return AuthInput{}, errors.Wrap(err, "Error: reading user info failed")
	}

	var user struct {
		Login     string `json:"login"`
		AvatarURL string `json:"avatar_url"`
		Email     string `json:"email"`
	}

	if err := json.Unmarshal(userBytes, &user); err != nil {
		return AuthInput{}, errors.Wrap(err, "Error: parsing GitHub user info failed")
	}

	// 返回AuthInput给后续注册/登录
	return AuthInput{
		Provider:    ProviderGitHub,
		ProviderID:  user.Login,
		DisplayName: user.Login,
		AvatarURL:   user.AvatarURL,
		Email:       user.Email,
	}, nil
}

// getGoogleToken 使用 code 获取 access_token
func getGoogleToken(code string) (*oauth2.Token, error) {
	var googleOAuthConf = &oauth2.Config{
		ClientID:     global.VP.GetString("oauth.google_client_id"),
		ClientSecret: global.VP.GetString("oauth.google_client_secret"),
		RedirectURL:  global.VP.GetString("oauth.google_redirect_uri"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
	token, err := googleOAuthConf.Exchange(context.Background(), code)
	if err != nil {
		return nil, errors.Wrap(err, "获取 Google token 失败")
	}
	return token, nil
}

// GetGoogleUserInfo 获取 Google 用户信息并构造 AuthInput
func GetGoogleUserInfo(code string) (AuthInput, error) {
	token, err := getGoogleToken(code)
	if err != nil {
		return AuthInput{}, err
	}
	var googleOAuthConf = &oauth2.Config{
		ClientID:     global.VP.GetString("oauth.google_client_id"),
		ClientSecret: global.VP.GetString("oauth.google_client_secret"),
		RedirectURL:  global.VP.GetString("oauth.google_redirect_uri"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	client := googleOAuthConf.Client(context.Background(), token)

	res, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return AuthInput{}, errors.Wrap(err, "获取用户信息失败")
	}
	defer res.Body.Close()

	var user struct {
		Sub     string `json:"sub"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.NewDecoder(res.Body).Decode(&user); err != nil {
		return AuthInput{}, errors.Wrap(err, "解析用户信息失败")
	}

	fmt.Println("Google用户信息:", user.Sub, user.Email, user.Name, user.Picture)

	return AuthInput{
		Provider:    ProviderGoogle,
		ProviderID:  user.Sub,
		DisplayName: user.Name,
		AvatarURL:   user.Picture,
		Email:       user.Email,
	}, nil
}

func BindAccount(input AuthInput, uuid string) (BindAccountResult, error) {
	if uuid == "" {
		return BindAccountResult{}, errors.New("Error: UUID not found")
	}

	// 1. 检查该第三方账号是否已绑定其他用户
	var existing database.AuthAccount
	err := global.DB.Where("provider = ? AND provider_id = ?", input.Provider, input.ProviderID).First(&existing).Error
	if err == nil {
		// 如果已存在绑定且不是当前用户
		if existing.ProfileUUID != uuid {
			return BindAccountResult{Result: "duplicate_bind"}, errors.New("Error: this account is already bound to another user")
		}
		// 如果已绑定当前用户 → 直接返回
		return BindAccountResult{Result: "already_bound"}, nil
	}

	// 2. 创建绑定关系
	bind := database.AuthAccount{
		ProfileUUID: uuid,
		Provider:    string(input.Provider),
		ProviderID:  input.ProviderID,
	}
	if err := global.DB.Create(&bind).Error; err != nil {
		return BindAccountResult{Result: "failed_bind"}, errors.Wrap(err, "Error: creating bind record failed")
	}

	// 3. 更新用户表中的绑定标志位
	field := map[AuthProvider]string{
		ProviderEmail:  "is_email_bound",
		ProviderGitHub: "is_github_bound",
		ProviderGoogle: "is_google_bound",
	}[input.Provider]

	if field != "" {
		_ = global.DB.Model(&database.User{}).
			Where("uuid = ?", uuid).
			Update(field, true).Error
	}

	return BindAccountResult{Result: "success_bind"}, nil
}

// LoginOrRegister 登录或注册
func LoginOrRegister(input AuthInput) (AuthResult, error) {
	var auth database.AuthAccount

	// 先查找是否已有绑定的第三方账号
	err := global.DB.Where("provider = ? AND provider_id = ?", input.Provider, input.ProviderID).First(&auth).Error
	if err == nil {
		// 如果已绑定，查找用户
		fmt.Println("已绑定的用户UUID:", auth.ProfileUUID)
		var user database.User
		if err := global.DB.Where("uuid = ?", auth.ProfileUUID).First(&user).Error; err != nil {
			return AuthResult{}, errors.New("Error: user not found")
		}
		// 生成JWT
		token, _ := GenerateJWT(user.UUID)
		return AuthResult{Token: token}, nil
	}

	// 若没有绑定，进行注册
	newUUID := uuid.New().String()
	newUser := database.User{
		UUID:       newUUID,
		CreatedAt:  time.Now(),
		Username:   input.DisplayName,
		Email:      input.Email,
		AvatarURL:  input.AvatarURL,
		IsVerified: false,
		Gender:     "Other", // 默认设置为Other，实际可以根据情况修改
		Coin:       0,
	}
	// 根据AuthInput的Provider设置绑定标志位
	switch input.Provider {
	case ProviderEmail:
		newUser.IsEmailBound = true
	case ProviderGitHub:
		newUser.IsGitHubBound = true
	case ProviderGoogle:
		newUser.IsGoogleBound = true
	default:
		return AuthResult{}, errors.New("Error: unsupported provider")
	}

	println("新用户UUID:", newUser.UUID)

	if err := global.DB.Create(&newUser).Error; err != nil {
		return AuthResult{}, errors.New("Error: user creation failed")
	}

	// 创建认证账号的绑定
	newAuth := database.AuthAccount{
		ProfileUUID: newUUID,
		Provider:    string(input.Provider),
		ProviderID:  input.ProviderID,
	}

	if err := global.DB.Create(&newAuth).Error; err != nil {
		return AuthResult{}, errors.New("Error: auth account creation failed")
	}

	// 生成JWT
	token, _ := GenerateJWT(newUser.UUID)
	return AuthResult{Token: token}, nil
}
