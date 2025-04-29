package v1

import (
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// MatchTrigger Trigger daily match (for testing purposes)
// @Summary Trigger daily match (testing API)
// @Tags Match
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/match/trigger [post]
func MatchTrigger(c *gin.Context) {
	err := service.TriggerDailyMatch()
	if err != nil {
		response.FailWithMessage("Failed to trigger: "+err.Error(), c)
		return
	}
	response.OkWithMessage("Match task executed successfully", c)
}

// MatchTriggerUser Trigger match calculation for the current user
// @Summary Trigger match calculation for the current user
// @Tags Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/match/trigger [Get]
func MatchTriggerUser(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	err := service.TriggerUserMatch(userUUID)
	if err != nil {
		response.FailWithMessage("Failed to trigger: "+err.Error(), c)
		return
	}
	response.OkWithMessage("Match task executed successfully", c)
}

// MatchToday Get today's match result
// @Summary Get today's match result
// @Tags Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=response.MatchUserInfo}
// @Router /api/v1/match/today [get]
func MatchToday(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
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

// MatchConfirm Confirm match
// @Summary Confirm match
// @Tags Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response
// @Router /api/v1/match/confirm [get]
func MatchConfirm(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	err := service.ConfirmMatch(userUUID)

	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("Match confirmed successfully", c)
}

// MatchHistory Get match history
// @Summary Get match history
// @Tags Match
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=[]response.MatchHistory}
// @Router /api/v1/match/history [get]
func MatchHistory(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	history, err := service.GetMatchHistory(userUUID)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithData(history, c)
}
