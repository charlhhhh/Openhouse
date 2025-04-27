package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/response"
	"errors"
	"time"

	"gorm.io/gorm"
)

func CreateComment(userUUID string, postID uint, commentID *uint, content string) error {
	comment := database.PostComment{
		PostID:     postID,
		CommentID:  commentID,
		AuthorUUID: userUUID,
		Content:    content,
		CreateTime: time.Now(),
	}
	if err := global.DB.Create(&comment).Error; err != nil {
		return err
	}
	return nil
}

func LikeComment(userUUID string, commentID uint) error {
	var like database.CommentLike
	err := global.DB.
		Where("user_id = ? AND comment_id = ?", userUUID, commentID).
		First(&like).Error
	if err == nil {
		if like.DeletedAt.Valid {
			return global.DB.Model(&like).Update("deleted_at", nil).Error
		}
		return errors.New("请勿重复点赞")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	// 新增点赞
	like = database.CommentLike{UserID: userUUID, CommentID: commentID}
	if err := global.DB.Create(&like).Error; err != nil {
		return err
	}
	return global.DB.Model(&database.PostComment{}).
		Where("id = ?", commentID).
		UpdateColumn("like_number", gorm.Expr("like_number + 1")).Error
}

func UnlikeComment(userUUID string, commentID uint) error {
	var like database.CommentLike
	err := global.DB.
		Where("user_id = ? AND comment_id = ? AND deleted_at IS NULL", userUUID, commentID).
		First(&like).Error
	if err != nil {
		return errors.New("尚未点赞该评论")
	}
	if err := global.DB.Delete(&like).Error; err != nil {
		return err
	}
	return global.DB.Model(&database.PostComment{}).
		Where("id = ?", commentID).
		UpdateColumn("like_number", gorm.Expr("like_number - 1")).Error
}

// ListComments 查询某个帖子的一级评论 + 默认前 3 条子评论
func ListComments(postID uint, pageNum, pageSize int, sortBy string, currentUserUUID string) ([]response.CommentInfo, int64, error) {
	var comments []database.PostComment
	var total int64

	// 查询一级评论总数
	db := global.DB.Model(&database.PostComment{}).Where("post_id = ? AND comment_id IS NULL", postID)
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	// 排序方式
	order := "create_time desc"
	if sortBy == "likes" {
		order = "like_number desc"
	}

	// 查询一级评论分页数据
	if err := db.Order(order).
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	// 收集一级评论 ID + 用户 UUID
	commentIDs := make([]uint, 0, len(comments))
	userUUIDs := make([]string, 0, len(comments))
	for _, c := range comments {
		commentIDs = append(commentIDs, c.ID)
		userUUIDs = append(userUUIDs, c.AuthorUUID)
	}

	// 查询用户信息
	var users []database.User
	userMap := make(map[string]database.User)
	if len(userUUIDs) > 0 {
		_ = global.DB.Where("uuid IN (?)", userUUIDs).Find(&users)
		for _, u := range users {
			userMap[u.UUID] = u
		}
	}

	// 查询当前用户对一级评论的点赞
	likedMap := make(map[uint]bool)
	if currentUserUUID != "" {
		var likes []database.CommentLike
		if len(commentIDs) > 0 {
			_ = global.DB.
				Where("user_id = (?) AND comment_id IN (?) AND deleted_at IS NULL", currentUserUUID, commentIDs).
				Find(&likes)
		}
		for _, l := range likes {
			likedMap[l.CommentID] = true
		}
	}

	// 构建结果
	result := make([]response.CommentInfo, 0, len(comments))
	for _, c := range comments {
		u := userMap[c.AuthorUUID]

		// 查询该一级评论的前 3 条子评论
		var children []database.PostComment
		_ = global.DB.Where("comment_id = ?", c.ID).Order("create_time asc").Limit(3).Find(&children)

		// 子评论用户 ID 收集
		childUUIDs := make([]string, 0, len(children))
		childIDs := make([]uint, 0, len(children))
		for _, child := range children {
			childUUIDs = append(childUUIDs, child.AuthorUUID)
			childIDs = append(childIDs, child.ID)
		}

		// 查询子评论作者信息
		var subUsers []database.User
		subUserMap := make(map[string]database.User)
		if len(childUUIDs) > 0 {
			_ = global.DB.Where("uuid IN (?)", childUUIDs).Find(&subUsers)
			for _, su := range subUsers {
				subUserMap[su.UUID] = su
			}
		}

		// 查询子评论点赞状态
		subLikedMap := make(map[uint]bool)
		if currentUserUUID != "" && len(childIDs) > 0 {
			var likes []database.CommentLike
			_ = global.DB.Where("user_id = (?) AND comment_id IN (?) AND deleted_at IS NULL", currentUserUUID, childIDs).Find(&likes)
			for _, l := range likes {
				subLikedMap[l.CommentID] = true
			}
		}

		// 构造子评论响应
		subComments := make([]response.CommentInfo, 0)
		for _, child := range children {
			author := subUserMap[child.AuthorUUID]
			subComments = append(subComments, response.CommentInfo{
				ID:         child.ID,
				PostID:     child.PostID,
				CommentID:  child.CommentID,
				Content:    child.Content,
				CreateTime: child.CreateTime,
				LikeNumber: child.LikeNumber,
				AuthorUUID: child.AuthorUUID,
				Username:   author.Username,
				AvatarURL:  author.AvatarURL,
				IsLiked:    subLikedMap[child.ID],
			})
		}

		// 计算剩余子评论数量
		var count int64
		_ = global.DB.Model(&database.PostComment{}).
			Where("comment_id = ?", c.ID).
			Count(&count)

		result = append(result, response.CommentInfo{
			ID:               c.ID,
			PostID:           c.PostID,
			CommentID:        nil,
			Content:          c.Content,
			CreateTime:       c.CreateTime,
			LikeNumber:       c.LikeNumber,
			AuthorUUID:       c.AuthorUUID,
			Username:         u.Username,
			AvatarURL:        u.AvatarURL,
			IsLiked:          likedMap[c.ID],
			Replies:          subComments,
			RepliesMoreCount: int(count) - len(subComments),
		})
	}

	return result, total, nil
}

// ListChildComments 返回某条评论下的子评论（分页 + 按时间升序）
func ListChildComments(parentCommentID uint, pageNum, pageSize int, currentUserUUID string) ([]response.CommentInfo, int64, error) {
	var children []database.PostComment
	var total int64

	// 查询总数量
	db := global.DB.Model(&database.PostComment{}).Where("comment_id = ?", parentCommentID)
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询分页数据
	if err := db.Order("create_time asc").
		Limit(pageSize).
		Offset((pageNum - 1) * pageSize).
		Find(&children).Error; err != nil {
		return nil, 0, err
	}

	// 批量获取作者用户
	userIDs := make([]string, 0, len(children))
	commentIDs := make([]uint, 0, len(children))
	for _, c := range children {
		userIDs = append(userIDs, c.AuthorUUID)
		commentIDs = append(commentIDs, c.ID)
	}

	var users []database.User
	userMap := make(map[string]database.User)
	if err := global.DB.Where("uuid IN (?)", userIDs).Find(&users).Error; err == nil {
		for _, u := range users {
			userMap[u.UUID] = u
		}
	}

	// 当前用户点赞状态
	likedMap := make(map[uint]bool)
	if currentUserUUID != "" {
		var likes []database.CommentLike
		_ = global.DB.Where("user_id = ? AND comment_id IN (?) AND deleted_at IS NULL", currentUserUUID, commentIDs).Find(&likes)
		for _, l := range likes {
			likedMap[l.CommentID] = true
		}
	}

	// 拼装返回结构
	result := make([]response.CommentInfo, 0, len(children))
	for _, c := range children {
		u := userMap[c.AuthorUUID]
		result = append(result, response.CommentInfo{
			ID:         c.ID,
			PostID:     c.PostID,
			CommentID:  c.CommentID,
			Content:    c.Content,
			CreateTime: c.CreateTime,
			LikeNumber: c.LikeNumber,
			AuthorUUID: c.AuthorUUID,
			Username:   u.Username,
			AvatarURL:  u.AvatarURL,
			IsLiked:    likedMap[c.ID],
		})
	}

	return result, total, nil
}
