package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"bytes"
	"io"
	"time"

	"encoding/json"
	"net/http"
	"net/url"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"github.com/pkg/errors"
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
}

// AuthResult 返回登录结果
type AuthResult struct {
	User  database.User
	Token string
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
		println("创建POST请求失败:", err)
		return "", errors.Wrap(err, "创建POST请求失败")
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		println("请求GitHub获取access_token失败:", err)
		return "", errors.Wrap(err, "请求GitHub获取access_token失败")
	}
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		println("读取GitHub返回失败:", err)
		return "", errors.Wrap(err, "读取GitHub返回失败")
	}
	var tokenResponse struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.Unmarshal(bodyBytes, &tokenResponse); err != nil {
		println("解析GitHub返回的token失败:", err)
		return "", errors.Wrap(err, "解析GitHub返回的token失败")
	}
	println("GitHub access_token:", tokenResponse.AccessToken)
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

	print("GitHub用户信息:", user.Login, user.AvatarURL, user.Email)

	// 返回AuthInput给后续注册/登录
	return AuthInput{
		Provider:    ProviderGitHub,
		ProviderID:  user.Login,
		DisplayName: user.Login,
		AvatarURL:   user.AvatarURL,
	}, nil
}

// LoginOrRegister 登录或注册
func LoginOrRegister(input AuthInput) (AuthResult, error) {
	var auth database.AuthAccount

	// 先查找是否已有绑定的第三方账号
	err := global.DB.Where("provider = ? AND provider_id = ?", input.Provider, input.ProviderID).First(&auth).Error
	if err == nil {
		// 如果已绑定，查找用户
		var user database.User
		if err := global.DB.Where("uuid = ?", auth.ProfileUUID).First(&user).Error; err != nil {
			return AuthResult{}, errors.New("Error: user not found")
		}
		// 生成JWT
		token, _ := GenerateJWT(user.UUID)
		return AuthResult{User: user, Token: token}, nil
	}

	// 若没有绑定，进行注册
	newUUID := uuid.New().String()
	newUser := database.User{
		UUID:       newUUID,
		CreatedAt:  time.Now(),
		Username:   input.DisplayName,
		AvatarURL:  input.AvatarURL,
		IsVerified: false,
		Gender:     "Other", // 默认设置为Other，实际可以根据情况修改
		Coin:       0,
	}

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
	return AuthResult{User: newUser, Token: token}, nil
}
