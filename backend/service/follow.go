package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/response"
	"OpenHouse/utils"

	"github.com/pkg/errors"
	"gorm.io/gorm"
)

func FollowUser(userUUID, followedUUID string) error {
	if userUUID == followedUUID {
		return errors.New("不能关注自己")
	}

	// 检查用户是否存在
	var user database.User
	if err := global.DB.First(&user, "uuid = ?", followedUUID).Error; err != nil {
		return errors.New("用户不存在")
	}

	var relation database.UserFollow
	err := global.DB.
		Where("user_id = ? AND follow_id = ?", userUUID, followedUUID).
		First(&relation).Error

	if err == nil {
		if relation.DeletedAt.Valid {
			return global.DB.Model(&relation).Update("deleted_at", nil).Error
		}
		return errors.New("请勿重复关注")
	}

	newRelation := database.UserFollow{
		UserID:   userUUID,
		FollowID: followedUUID,
	}
	return global.DB.Create(&newRelation).Error
}

func UnfollowUser(userUUID, followedUUID string) error {
	var relation database.UserFollow
	err := global.DB.
		Where("user_id = ? AND follow_id = ? AND deleted_at IS NULL", userUUID, followedUUID).
		First(&relation).Error

	if err != nil {
		return errors.New("你未关注该用户")
	}
	return global.DB.Delete(&relation).Error
}

func ListFollowedUsers(userUUID string, pageNum, pageSize int) ([]response.FollowedUserInfo, int64, error) {
	var relations []database.UserFollow
	var total int64

	if err := global.DB.Model(&database.UserFollow{}).
		Where("user_id = ? AND deleted_at IS NULL", userUUID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := global.DB.
		Where("user_id = ? AND deleted_at IS NULL", userUUID).
		Order("id desc").
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&relations).Error; err != nil {
		return nil, 0, err
	}

	followIDs := make([]string, 0, len(relations))
	for _, r := range relations {
		followIDs = append(followIDs, r.FollowID)
	}

	var users []database.User
	if len(followIDs) == 0 {
		return []response.FollowedUserInfo{}, total, nil
	}
	if err := global.DB.Where("uuid IN ?", followIDs).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	result := make([]response.FollowedUserInfo, 0, len(users))
	for _, u := range users {
		result = append(result, response.FollowedUserInfo{
			UUID:      u.UUID,
			Username:  u.Username,
			AvatarURL: u.AvatarURL,
		})
	}
	return result, total, nil
}

func ListFollowers(userUUID string, pageNum, pageSize int) ([]response.FollowedUserInfo, int64, error) {
	var relations []database.UserFollow
	var total int64

	if err := global.DB.Model(&database.UserFollow{}).
		Where("follow_id = ? AND deleted_at IS NULL", userUUID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := global.DB.
		Where("follow_id = ? AND deleted_at IS NULL", userUUID).
		Order("id desc").
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&relations).Error; err != nil {
		return nil, 0, err
	}

	userIDs := make([]string, 0, len(relations))
	for _, r := range relations {
		userIDs = append(userIDs, r.UserID)
	}

	var users []database.User
	if len(userIDs) == 0 {
		return []response.FollowedUserInfo{}, total, nil
	}
	if err := global.DB.Where("uuid IN ?", userIDs).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	result := make([]response.FollowedUserInfo, 0, len(users))
	for _, u := range users {
		result = append(result, response.FollowedUserInfo{
			UUID:      u.UUID,
			Username:  u.Username,
			AvatarURL: u.AvatarURL,
		})
	}
	return result, total, nil
}

func GetFollowCount(userUUID string) (int64, int64, error) {
	var following int64
	var follower int64

	if err := global.DB.Model(&database.UserFollow{}).
		Where("user_id = ? AND deleted_at IS NULL", userUUID).
		Count(&following).Error; err != nil {
		return 0, 0, err
	}
	if err := global.DB.Model(&database.UserFollow{}).
		Where("follow_id = ? AND deleted_at IS NULL", userUUID).
		Count(&follower).Error; err != nil {
		return 0, 0, err
	}
	return following, follower, nil
}

func IsFollowing(userUUID, targetUUID string) (bool, error) {
	if userUUID == targetUUID {
		return false, nil
	}
	var follow database.UserFollow
	err := global.DB.
		Where("user_id = ? AND follow_id = ? AND deleted_at IS NULL", userUUID, targetUUID).
		First(&follow).Error
	if err == nil {
		return true, nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return false, nil
	}
	return false, err
}

func ListFollowedPosts(userUUID string, pageNum, pageSize int, sortOrder string) ([]response.PostInfo, int64, error) {
	var relations []database.UserFollow
	if err := global.DB.
		Where("user_id = ? AND deleted_at IS NULL", userUUID).
		Find(&relations).Error; err != nil {
		return nil, 0, err
	}

	followUUIDs := make([]string, 0, len(relations))
	for _, r := range relations {
		followUUIDs = append(followUUIDs, r.FollowID)
	}

	if len(followUUIDs) == 0 {
		return []response.PostInfo{}, 0, nil
	}

	var posts []database.Post
	var total int64

	db := global.DB.Model(&database.Post{}).Where("author_uuid IN ?", followUUIDs)
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	order := "create_date desc"
	if sortOrder == "asc" {
		order = "create_date asc"
	}

	if err := db.Order(order).
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	result := make([]response.PostInfo, 0, len(posts))
	for _, p := range posts {
		result = append(result, utils.ConvertPostModelWithUser(p, userUUID))
	}
	return result, total, nil
}
