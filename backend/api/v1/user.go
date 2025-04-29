package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// GetProfile
// @Summary 获取用户Profile
// @Security ApiKeyAuth
// @Tags Profile
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=service.ProfileResponse}
// @Router /api/v1/user/profile [get]
func GetProfile(c *gin.Context) {
	uuid := c.MustGet("uuid").(string)

	profile, err := service.GetProfile(uuid)
	if err != nil {
		response.FailWithMessage("查询失败", c)
		return
	}
	response.OkWithData(profile, c)
}

// UpdateProfile
// @Summary 更新用户Profile（部分字段）
// @Security ApiKeyAuth
// @Tags Profile
// @Accept json
// @Produce json
// @Param data body service.UpdateProfileInput true "需要更新的字段"
// @Success 200 {object} response.Response
// @Router /api/v1/user/profile [post]
func UpdateProfile(c *gin.Context) {
	uuid := c.MustGet("uuid").(string)

	var input request.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	if err := service.UpdateProfile(uuid, input); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.Ok(c)
}
