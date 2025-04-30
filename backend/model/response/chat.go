package response

import "time"

// ChatMessageVO 聊天消息展示结构体（前端展示）
type ChatMessageVO struct {
	ID           uint      `json:"id"`
	SenderUUID   string    `json:"sender_uuid"`
	ReceiverUUID string    `json:"receiver_uuid"`
	Content      string    `json:"content"`
	CreatedAt    time.Time `json:"created_at"`
	IsMine       bool      `json:"is_mine"` // 是否是当前用户发出的
}

// ChatHistoryPage 聊天记录分页结构体
type ChatHistoryPage struct {
	Total int             `json:"total"`
	List  []ChatMessageVO `json:"list"`
}
