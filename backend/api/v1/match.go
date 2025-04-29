package v1

import (
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// MatchTrigger 后台管理触发每日匹配（测试使用，强制立刻执行匹配）
// @Summary 触发每日匹配（测试使用API）
// @Tags 匹配 Match
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/match/trigger [post]
func MatchTrigger(c *gin.Context) {
	err := service.TriggerDailyMatch()
	if err != nil {
		response.FailWithMessage("触发失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("匹配任务已执行", c)
}

// MatchTriggerUser 触发当前用户的匹配计算
// @Summary 触发当前用户的匹配计算
// @Tags 匹配 Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/match/trigger [Get]
func MatchTriggerUser(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	err := service.TriggerUserMatch(userUUID)
	if err != nil {
		response.FailWithMessage("触发失败: "+err.Error(), c)
		return
	}
	response.OkWithMessage("匹配任务已执行", c)
}

// MatchToday 查询今日神秘嘉宾
// @Summary 获取今日匹配结果
// @Tags 匹配 Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=response.MatchUserInfo}
// @Router /api/v1/match/today [get]
func MatchToday(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	info, waitMsg, err := service.GetTodayMatch(userUUID)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	if waitMsg != "" {
		response.OkWithMessage(waitMsg, c)
		return
	}

	response.OkWithData(info, c)
}

// MatchConfirm 确认匹配
// @Summary 确认匹配
// @Tags 匹配 Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/match/confirm [get]
func MatchConfirm(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	err := service.ConfirmMatch(userUUID)

	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("匹配确认成功", c)
}

// MatchHistory 查询历史匹配记录
// @Summary 查询历史匹配记录
// @Tags 匹配 Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=[]response.MatchHistory}
// @Router /api/v1/match/history [get]
func MatchHistory(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	history, err := service.GetMatchHistory(userUUID)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithData(history, c)
}
