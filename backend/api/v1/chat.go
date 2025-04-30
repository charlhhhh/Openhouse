package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"
	"OpenHouse/utils"
	"time"

	"github.com/gin-gonic/gin"
)

// SendChatMessage 发送聊天消息
// @Summary 发送聊天消息
// @Tags Chat
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param data body request.SendChatMessageRequest true "receiver_uuid, content"
// @Success 200 {object} response.Response{}
// @Router /api/v1/chat/send [post]
func SendChatMessage(c *gin.Context) {
	var req request.SendChatMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数格式错误", c)
		return
	}
	currentUUID := c.MustGet("uuid").(string)
	if currentUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}
	err := service.SendMessage(currentUUID, req.ReceiverUUID, req.Content)
	if err != nil {
		response.FailWithMessage("发送失败："+err.Error(), c)
		return
	}
	response.Ok(c)
}

// GetRecentMessages 获取最近20条消息（首次加载）
// @Summary 获取最近聊天记录 获取最近20条消息（首次加载）
// @Tags Chat
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param peer_uuid query string true "对话对象 UUID"
// @Success 200 {object} response.Response{data=[]response.ChatMessageVO}
// @Router /api/v1/chat/recent [get]
func GetRecentMessages(c *gin.Context) {
	currentUUID := c.MustGet("uuid").(string)
	if currentUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}
	peerUUID := c.Query("peer_uuid")
	if peerUUID == "" {
		response.FailWithMessage("缺少参数 peer_uuid", c)
		return
	}

	result, err := service.GetRecentChatHistory(currentUUID, peerUUID, 20)
	if err != nil {
		response.FailWithMessage("获取聊天记录失败："+err.Error(), c)
		return
	}
	response.OkWithData(result, c)
}

// GetMoreMessages 上滑查看更多历史消息（按时间分页）
// @Summary 上滑查看更多历史消息
// @Tags Chat
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param peer_uuid query string true "对话对象 UUID"
// @Param last_time query string true "最后一条消息的时间戳，如 2024-05-01T15:04:05Z"
// @Param last_id query int true "最后一条消息的 ID"
// @Success 200 {object} response.Response{data=[]response.ChatMessageVO}
// @Router /api/v1/chat/more [get]
func GetMoreMessages(c *gin.Context) {

	currentUUID := c.MustGet("uuid").(string)

	if currentUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	peerUUID := c.Query("peer_uuid")
	lastTimeStr := c.Query("last_time")
	lastIDStr := c.Query("last_id")

	if peerUUID == "" || lastTimeStr == "" || lastIDStr == "" {
		response.FailWithMessage("缺少参数", c)
		return
	}

	lastTime, err := time.Parse(time.RFC3339, lastTimeStr)
	if err != nil {
		response.FailWithMessage("时间格式错误，应为 RFC3339", c)
		return
	}

	lastID, err := utils.ParseUint(lastIDStr)
	if err != nil {
		response.FailWithMessage("ID 格式错误", c)
		return
	}

	result, err := service.GetMoreChatHistory(currentUUID, peerUUID, lastTime, uint(lastID), 20)
	if err != nil {
		response.FailWithMessage("获取聊天记录失败："+err.Error(), c)
		return
	}
	response.OkWithData(result, c)
}

// PollNewMessages 拉取用户收到的所有新消息（自某时间戳）
// @Summary 轮询新消息（拉取当前用户自指定时间之后的所有新消息）
// @Tags Chat
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param since query string true "起始时间 (RFC3339)"
// @Success 200 {object} response.Response{data=[]response.ChatMessageVO}
// @Router /api/v1/chat/poll [get]
func PollNewMessages(c *gin.Context) {

	currentUUID := c.MustGet("uuid").(string)

	if currentUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	sinceStr := c.Query("since")

	since, err := time.Parse(time.RFC3339, sinceStr)
	if err != nil {
		response.FailWithMessage("时间格式错误，应为 RFC3339", c)
		return
	}

	result, err := service.PollNewMessages(currentUUID, since)
	if err != nil {
		response.FailWithMessage("轮询失败："+err.Error(), c)
		return
	}
	response.OkWithData(result, c)
}

// GetChatHistoryPaged 聊天历史分页查询
// @Summary 获取聊天历史（分页）
// @Tags Chat
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param peer_uuid query string true "对方 UUID"
// @Param page query int true "页码，从 1 开始"
// @Param page_size query int true "每页条数"
// @Success 200 {object} response.Response{data=response.ChatHistoryPage}
// @Router /api/v1/chat/history [get]
func GetChatHistoryPaged(c *gin.Context) {
	currentUUID := c.MustGet("uuid").(string)
	if currentUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}
	peerUUID := c.Query("peer_uuid")
	page := utils.StringToInt(c.Query("page"), 1)
	pageSize := utils.StringToInt(c.Query("page_size"), 20)

	if peerUUID == "" {
		response.FailWithMessage("缺少参数 peer_uuid", c)
		return
	}

	total, list, err := service.GetChatHistoryPaged(currentUUID, peerUUID, page, pageSize)
	if err != nil {
		response.FailWithMessage("获取历史消息失败："+err.Error(), c)
		return
	}

	res := response.ChatHistoryPage{
		Total: int(total),
		List:  list,
	}
	response.OkWithData(res, c)
}
