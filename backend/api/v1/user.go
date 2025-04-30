package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// GetUserInfo
// @Summary Get user information BY UUID
// @Tags User
// @Accept json
// @Produce json
// @Param uuid path string true "User UUID"
// @Success 200 {object} response.Response{data=service.ProfileResponse}
// @Router /api/v1/user/{uuid} [get]
// @Failure 400 {object} response.Response
func GetUserInfo(c *gin.Context) {
	uuid := c.Param("uuid")
	if uuid == "" {
		response.FailWithMessage("UUID is required", c)
		return
	}

	userInfo, err := service.GetProfile(uuid)
	if err != nil {
		response.FailWithMessage("Failed to retrieve user information", c)
		return
	}
	response.OkWithData(userInfo, c)
}

// GetProfile
// @Summary Get user profile
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
		response.FailWithMessage("Failed to retrieve profile", c)
		return
	}
	response.OkWithData(profile, c)
}

// UpdateProfile
// @Summary Update user profile (partial fields)
// @Security ApiKeyAuth
// @Tags Profile
// @Accept json
// @Produce json
// @Param data body request.UpdateProfileInput true "Fields to update"
// @Success 200 {object} response.Response
// @Router /api/v1/user/profile [post]
func UpdateProfile(c *gin.Context) {
	uuid := c.MustGet("uuid").(string)

	var input request.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.FailWithMessage("Invalid parameters", c)
		return
	}

	if err := service.UpdateProfile(uuid, input); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithMessage("Profile updated successfully", c)
}
