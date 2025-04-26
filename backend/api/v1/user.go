package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// GetProfile
// @Summary 查询当前用户Profile
// @Tags Profile
// @Produce json
// @Success 200 {object} response.Response{data=database.User}
// @Router /api/v1/user/profile [get]
func GetProfile(c *gin.Context) {
	uuid := c.MustGet("uuid").(string)

	user, err := service.GetProfile(uuid)
	if err != nil {
		response.FailWithMessage("获取用户信息失败", c)
		return
	}
	response.OkWithData(user, c)
}

// UpdateProfile
// @Summary 更新当前用户Profile
// @Tags Profile
// @Accept json
// @Produce json
// @Param data body request.UpdateProfileRequest true "可选字段"
// @Success 200 {object} response.Response
// @Router /api/v1/user/profile [post]
func UpdateProfile(c *gin.Context) {
	uuid := c.MustGet("uuid").(string)

	var req request.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	if err := service.UpdateProfile(uuid, req); err != nil {
		response.FailWithMessage("更新失败", c)
		return
	}
	response.Ok(c)
}

// UploadAvatar
// @Summary 更新头像
// @Tags Profile
// @Accept json
// @Produce json
// @Param data body request.UploadAvatarRequest true "头像链接"
// @Success 200 {object} response.Response
// @Router /api/v1/user/avatar [post]
func UploadAvatar(c *gin.Context) {
	uuid := c.MustGet("uuid").(string)

	var req request.UploadAvatarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误", c)
		return
	}

	if err := service.UpdateAvatar(uuid, req.AvatarURL); err != nil {
		response.FailWithMessage("头像上传失败", c)
		return
	}
	response.Ok(c)
}
