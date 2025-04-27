package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/response"
	"OpenHouse/utils"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

func CreatePost(authorUUID string, title string, content string, imageURLs []string) (database.Post, error) {
	if len(imageURLs) > 3 {
		return database.Post{}, errors.New("最多只能上传3张图片")
	}

	imgJSON, err := json.Marshal(imageURLs)
	if err != nil {
		return database.Post{}, err
	}

	post := database.Post{
		AuthorUUID: authorUUID,
		Title:      title,
		Content:    content,
		ImageURLs:  imgJSON,
		CreateDate: time.Now(),
	}

	if err := global.DB.Create(&post).Error; err != nil {
		return database.Post{}, err
	}

	return post, nil
}

// ListPosts 分页查询帖子
func ListPosts(pageNum, pageSize int, sortOrder string, userUUID string) ([]response.PostInfo, int64, error) {
	var posts []database.Post
	var total int64

	db := global.DB.Model(&database.Post{})

	// 查询总数
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 排序字段
	order := "create_date desc"
	if sortOrder == "asc" {
		order = "create_date asc"
	}

	// 分页 + 排序
	if err := db.Order(order).
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	// 转换为 PostInfo
	result := make([]response.PostInfo, 0, len(posts))
	for _, p := range posts {
		result = append(result, utils.ConvertPostModelWithUser(p, userUUID))
	}
	return result, total, nil

}

// ListUserPosts 查询当前用户的帖子
func ListUserPosts(authorUUID string, pageNum, pageSize int, sortOrder string, userUUID string) ([]response.PostInfo, int64, error) {
	var posts []database.Post
	var total int64

	db := global.DB.Model(&database.Post{}).Where("author_uuid = ?", authorUUID)

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

// DeletePost 删除指定帖子（只能删除自己的）
func DeletePost(userUUID string, postID uint) error {
	var post database.Post
	if err := global.DB.First(&post, postID).Error; err != nil {
		return errors.New("帖子不存在")
	}
	if post.AuthorUUID != userUUID {
		return errors.New("无权限删除该帖子")
	}
	return global.DB.Delete(&post).Error
}

// FavoritePost 收藏帖子
func FavoritePost(userUUID string, postID uint) error {
	// 检查帖子是否存在
	var post database.Post
	if err := global.DB.First(&post, postID).Error; err != nil {
		return errors.New("帖子不存在")
	}

	// 查询是否存在记录
	var fav database.UserPostFavorite
	err := global.DB.Unscoped().
		Where("user_id = ? AND post_id = ?", userUUID, postID).
		First(&fav).Error

	if err == nil {
		if fav.DeletedAt.Valid {
			// 恢复已删除记录
			if err := global.DB.Model(&fav).Update("deleted_at", nil).Error; err != nil {
				return err
			}
		} else {
			return errors.New("不能重复收藏")
		}
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		newFav := database.UserPostFavorite{
			UserID: userUUID,
			PostID: postID,
		}
		if err := global.DB.Create(&newFav).Error; err != nil {
			return err
		}
	} else {
		return err
	}

	// 收藏数 +1
	return global.DB.Model(&database.Post{}).
		Where("id = ?", postID).
		UpdateColumn("favorite_number", gorm.Expr("favorite_number + 1")).Error
}

// UnfavoritePost 取消收藏帖子
func UnfavoritePost(userUUID string, postID uint) error {
	var fav database.UserPostFavorite
	err := global.DB.
		Where("user_id = ? AND post_id = ? AND deleted_at IS NULL", userUUID, postID).
		First(&fav).Error

	if err != nil {
		return errors.New("尚未收藏该帖子")
	}

	if err := global.DB.Delete(&fav).Error; err != nil {
		return err
	}

	// 收藏数 -1（最小为 0）
	return global.DB.Exec(`
		UPDATE posts
		SET favorite_number = GREATEST(favorite_number - 1, 0)
		WHERE id = ?
	`, postID).Error
}

// ListFavoritePosts 查询用户收藏的帖子
func ListFavoritePosts(userUUID string, pageNum, pageSize int, sortOrder string) ([]response.PostInfo, int64, error) {
	var favorites []database.UserPostFavorite
	var total int64

	// 先查总数
	if err := global.DB.Model(&database.UserPostFavorite{}).
		Where("user_id = ? AND deleted_at IS NULL", userUUID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查收藏记录
	if err := global.DB.Where("user_id = ? AND deleted_at IS NULL", userUUID).
		Order("id desc").
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&favorites).Error; err != nil {
		return nil, 0, err
	}

	// 拿到 post_id 列表
	postIDs := make([]uint, 0, len(favorites))
	for _, fav := range favorites {
		postIDs = append(postIDs, fav.PostID)
	}

	// 查帖子
	var posts []database.Post
	if len(postIDs) == 0 {
		return []response.PostInfo{}, total, nil
	}

	order := "create_date desc"
	if sortOrder == "asc" {
		order = "create_date asc"
	}

	if err := global.DB.
		Where("id IN ?", postIDs).
		Order(order).
		Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	// 转换
	list := make([]response.PostInfo, 0, len(posts))
	for _, p := range posts {
		list = append(list, utils.ConvertPostModelWithUser(p, userUUID))
	}

	return list, total, nil
}

// LikePost 点赞帖子
func LikePost(userUUID string, postID uint) error {
	// 检查帖子是否存在
	var post database.Post
	if err := global.DB.First(&post, postID).Error; err != nil {
		return errors.New("帖子不存在")
	}

	var like database.UserPostLike
	err := global.DB.
		Where("user_id = ? AND post_id = ?", userUUID, postID).
		First(&like).Error

	if err == nil {
		if like.DeletedAt.Valid {
			// 恢复点赞
			if err := global.DB.Model(&like).Update("deleted_at", nil).Error; err != nil {
				return err
			}
		} else {
			return errors.New("请勿重复点赞")
		}
	} else {
		newLike := database.UserPostLike{
			UserID: userUUID,
			PostID: postID,
		}
		if err := global.DB.Create(&newLike).Error; err != nil {
			return err
		}
	}

	// 更新 star_number
	return global.DB.Model(&post).UpdateColumn("star_number", gorm.Expr("star_number + ?", 1)).Error
}

// UnLikePost 取消点赞
func UnLikePost(userUUID string, postID uint) error {
	var like database.UserPostLike
	err := global.DB.
		Where("user_id = ? AND post_id = ? AND deleted_at IS NULL", userUUID, postID).
		First(&like).Error

	if err != nil {
		return errors.New("尚未点赞该帖子")
	}

	if err := global.DB.Delete(&like).Error; err != nil {
		return err
	}

	// 同步更新 star_number
	var post database.Post
	if err := global.DB.First(&post, postID).Error; err == nil {
		return global.DB.Model(&post).UpdateColumn("star_number", gorm.Expr("star_number - ?", 1)).Error
	}
	return nil
}

// GetPostDetail 获取帖子详情并更新浏览数
func GetPostDetailWithUser(postID uint, userUUID string) (response.PostDetailResponse, error) {
	var post database.Post
	if err := global.DB.First(&post, postID).Error; err != nil {
		return response.PostDetailResponse{}, errors.New("帖子不存在")
	}

	// 浏览数 +1（不影响逻辑）
	_ = global.DB.Model(&post).UpdateColumn("view_number", gorm.Expr("view_number + ?", 1)).Error

	postInfo := utils.ConvertPostModelWithUser(post, userUUID)

	isLiked := false
	isFavorited := false

	if userUUID != "" {
		var like database.UserPostLike
		if err := global.DB.
			Where("user_id = ? AND post_id = ? AND deleted_at IS NULL", userUUID, postID).
			First(&like).Error; err == nil {
			isLiked = true
		}

		var fav database.UserPostFavorite
		if err := global.DB.
			Where("user_id = ? AND post_id = ? AND deleted_at IS NULL", userUUID, postID).
			First(&fav).Error; err == nil {
			isFavorited = true
		}
	}

	return response.PostDetailResponse{
		PostInfo:    postInfo,
		IsLiked:     isLiked,
		IsFavorited: isFavorited,
	}, nil
}
