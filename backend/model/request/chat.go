package request

// SendChatMessageRequest 发送聊天消息的请求体
type SendChatMessageRequest struct {
	ReceiverUUID string `json:"receiver_uuid" binding:"required"` // 接收方用户UUID
	Content      string `json:"content" binding:"required"`       // 聊天文本内容
}
