package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"encoding/json"
	"errors"
)

type ProfileResponse struct {
	UUID         string   `json:"uuid"`
	IsVerified   bool     `json:"is_verified"`
	Username     string   `json:"username"`
	Gender       string   `json:"gender"`
	AvatarURL    string   `json:"avatar_url"`
	IntroShort   string   `json:"intro_short"`
	IntroLong    string   `json:"intro_long"`
	Tags         []string `json:"tags"`
	ResearchArea string   `json:"research_area"`
	Coin         int      `json:"coin"`
}

// GetProfile 查询用户Profile
func GetProfile(uuid string) (ProfileResponse, error) {
	var user database.User
	if err := global.DB.Where("uuid = ?", uuid).First(&user).Error; err != nil {
		return ProfileResponse{}, err
	}

	var tags []string
	if len(user.Tags) > 0 {
		_ = json.Unmarshal(user.Tags, &tags)
	}

	return ProfileResponse{
		UUID:         user.UUID,
		IsVerified:   user.IsVerified,
		Username:     user.Username,
		Gender:       user.Gender,
		AvatarURL:    user.AvatarURL,
		IntroShort:   user.IntroShort,
		IntroLong:    user.IntroLong,
		Tags:         tags,
		ResearchArea: user.ResearchArea,
		Coin:         user.Coin,
	}, nil
}

type UpdateProfileInput struct {
	Username     *string   `json:"username,omitempty"`
	IsVerified   *bool     `json:"is_verified,omitempty"`
	AvatarURL    *string   `json:"avatar_url,omitempty"`
	IntroShort   *string   `json:"intro_short,omitempty"`
	IntroLong    *string   `json:"intro_long,omitempty"`
	Gender       *string   `json:"gender,omitempty"`
	Tags         *[]string `json:"tags,omitempty"`
	ResearchArea *string   `json:"research_area,omitempty"`
}

// UpdateProfile 更新用户Profile（支持部分字段）
func UpdateProfile(uuid string, input UpdateProfileInput) error {
	updates := make(map[string]interface{})

	if input.Username != nil {
		updates["username"] = *input.Username
	}
	if input.IsVerified != nil {
		updates["is_verified"] = *input.IsVerified
	}
	if input.AvatarURL != nil {
		updates["avatar_url"] = *input.AvatarURL
	}
	if input.IntroShort != nil {
		updates["intro_short"] = *input.IntroShort
	}
	if input.IntroLong != nil {
		updates["intro_long"] = *input.IntroLong
	}
	if input.Gender != nil {
		updates["gender"] = *input.Gender
	}
	if input.ResearchArea != nil {
		updates["research_area"] = *input.ResearchArea
	}
	if input.Tags != nil {
		tagsJSON, err := json.Marshal(input.Tags)
		if err != nil {
			return errors.New("标签序列化失败")
		}
		updates["tags"] = tagsJSON
	}

	if len(updates) == 0 {
		return errors.New("没有需要更新的字段")
	}

	return global.DB.Model(&database.User{}).Where("uuid = ?", uuid).Updates(updates).Error
}
