package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/request"
	"encoding/json"

	"gorm.io/datatypes"
)

func GetProfile(uuid string) (database.User, error) {
	var user database.User
	if err := global.DB.Where("uuid = ?", uuid).First(&user).Error; err != nil {
		return user, err
	}
	return user, nil
}

func UpdateProfile(uuid string, input request.UpdateProfileRequest) error {
	var user database.User
	if err := global.DB.Where("uuid = ?", uuid).First(&user).Error; err != nil {
		return err
	}

	// 部分更新，只更新非空字段
	if input.IsVerified != nil {
		user.IsVerified = *input.IsVerified
	}
	if input.Username != nil {
		user.Username = *input.Username
	}
	if input.Gender != nil {
		user.Gender = *input.Gender
	}
	if input.IntroShort != nil {
		user.IntroShort = *input.IntroShort
	}
	if input.IntroLong != nil {
		user.IntroLong = *input.IntroLong
	}
	if input.Tags != nil {
		tagsJSON, _ := json.Marshal(input.Tags)
		user.Tags = datatypes.JSON(tagsJSON)
	}
	if input.ResearchArea != nil {
		user.ResearchArea = *input.ResearchArea
	}

	return global.DB.Save(&user).Error
}

func UpdateAvatar(uuid string, avatarURL string) error {
	return global.DB.Model(&database.User{}).
		Where("uuid = ?", uuid).
		Update("avatar_url", avatarURL).Error
}
