package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/response"
	"errors"
	"time"
)

// SendMessage 插入一条聊天消息（需校验匹配关系, 暂时不校验了）
func SendMessage(senderUUID, receiverUUID, content string) error {
	if senderUUID == receiverUUID {
		return errors.New("不能给自己发消息")
	}

	// 检查是否已匹配关系（单向）
	// var count int64
	// today := time.Now().Format("20060102")
	// global.DB.Model(&database.MatchResult{}).
	// 	Where("match_round = ? AND user_uuid = ? AND match_uuid = ?", today, senderUUID, receiverUUID).
	// 	Or("match_round = ? AND user_uuid = ? AND match_uuid = ?", today, receiverUUID, senderUUID).
	// 	Count(&count)

	// if count == 0 {
	// 	return errors.New("您与对方尚未建立匹配关系")
	// }

	msg := database.ChatMessage{
		SenderUUID:   senderUUID,
		ReceiverUUID: receiverUUID,
		Content:      content,
		CreatedAt:    time.Now(),
	}

	return global.DB.Create(&msg).Error
}

// GetChatHistory 获取历史消息记录（双向查询 + 分页）
func GetChatHistory(currentUUID, peerUUID string, page, pageSize int) ([]response.ChatMessageVO, error) {
	var messages []database.ChatMessage

	offset := (page - 1) * pageSize

	err := global.DB.
		Where("(sender_uuid = ? AND receiver_uuid = ?) OR (sender_uuid = ? AND receiver_uuid = ?)",
			currentUUID, peerUUID, peerUUID, currentUUID).
		Order("created_at asc").
		Limit(pageSize).
		Offset(offset).
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	var result []response.ChatMessageVO
	for _, msg := range messages {
		result = append(result, response.ChatMessageVO{
			ID:           msg.ID,
			SenderUUID:   msg.SenderUUID,
			ReceiverUUID: msg.ReceiverUUID,
			Content:      msg.Content,
			CreatedAt:    msg.CreatedAt,
			IsMine:       msg.SenderUUID == currentUUID,
		})
	}

	return result, nil
}

// PollNewMessages 拉取当前用户收到的未读消息（支持 since 时间戳）
func PollNewMessages(currentUUID string, since time.Time) ([]response.ChatMessageVO, error) {
	var messages []database.ChatMessage

	err := global.DB.
		Where("receiver_uuid = ? AND created_at > ?", currentUUID, since).
		Order("created_at asc").
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	var result []response.ChatMessageVO
	for _, msg := range messages {
		result = append(result, response.ChatMessageVO{
			ID:           msg.ID,
			SenderUUID:   msg.SenderUUID,
			ReceiverUUID: msg.ReceiverUUID,
			Content:      msg.Content,
			CreatedAt:    msg.CreatedAt,
			IsMine:       false,
		})
	}

	return result, nil
}

// GetRecentChatHistory 获取最新的 N 条聊天记录（时间倒序返回）
func GetRecentChatHistory(currentUUID, peerUUID string, limit int) ([]response.ChatMessageVO, error) {
	var messages []database.ChatMessage

	err := global.DB.
		Where("(sender_uuid = ? AND receiver_uuid = ?) OR (sender_uuid = ? AND receiver_uuid = ?)",
			currentUUID, peerUUID, peerUUID, currentUUID).
		Order("created_at desc, id desc").
		Limit(limit).
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	// 翻转为时间正序
	result := make([]response.ChatMessageVO, 0, len(messages))
	for i := len(messages) - 1; i >= 0; i-- {
		msg := messages[i]
		result = append(result, response.ChatMessageVO{
			ID:           msg.ID,
			SenderUUID:   msg.SenderUUID,
			ReceiverUUID: msg.ReceiverUUID,
			Content:      msg.Content,
			CreatedAt:    msg.CreatedAt,
			IsMine:       msg.SenderUUID == currentUUID,
		})
	}

	return result, nil
}

// GetMoreChatHistory 上滑加载更多历史消息（基于 lastTime 向前翻页）
func GetMoreChatHistory(currentUUID, peerUUID string, lastTime time.Time, lastID uint, pageSize int) ([]response.ChatMessageVO, error) {
	var messages []database.ChatMessage

	// 注意：联合过滤时间和ID，防止 created_at 相同时出错
	err := global.DB.
		Where("((sender_uuid = ? AND receiver_uuid = ?) OR (sender_uuid = ? AND receiver_uuid = ?)) AND (created_at < ? OR (created_at = ? AND id < ?))",
			currentUUID, peerUUID, peerUUID, currentUUID, lastTime, lastTime, lastID).
		Order("created_at desc, id desc").
		Limit(pageSize).
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	// 翻转结果
	result := make([]response.ChatMessageVO, 0, len(messages))
	for i := len(messages) - 1; i >= 0; i-- {
		msg := messages[i]
		result = append(result, response.ChatMessageVO{
			ID:           msg.ID,
			SenderUUID:   msg.SenderUUID,
			ReceiverUUID: msg.ReceiverUUID,
			Content:      msg.Content,
			CreatedAt:    msg.CreatedAt,
			IsMine:       msg.SenderUUID == currentUUID,
		})
	}

	return result, nil
}

// GetChatHistoryPaged 获取分页聊天记录 + 总数
func GetChatHistoryPaged(currentUUID, peerUUID string, page, pageSize int) (total int64, messages []response.ChatMessageVO, err error) {
	var rawMessages []database.ChatMessage

	db := global.DB.Model(&database.ChatMessage{}).
		Where("(sender_uuid = ? AND receiver_uuid = ?) OR (sender_uuid = ? AND receiver_uuid = ?)",
			currentUUID, peerUUID, peerUUID, currentUUID)

	// 统计总数
	if err := db.Count(&total).Error; err != nil {
		return 0, nil, err
	}

	offset := (page - 1) * pageSize
	if err := db.Order("created_at desc, id desc").
		Limit(pageSize).
		Offset(offset).
		Find(&rawMessages).Error; err != nil {
		return 0, nil, err
	}

	for _, msg := range rawMessages {
		messages = append(messages, response.ChatMessageVO{
			ID:           msg.ID,
			SenderUUID:   msg.SenderUUID,
			ReceiverUUID: msg.ReceiverUUID,
			Content:      msg.Content,
			CreatedAt:    msg.CreatedAt,
			IsMine:       msg.SenderUUID == currentUUID,
		})
	}

	return total, messages, nil
}
