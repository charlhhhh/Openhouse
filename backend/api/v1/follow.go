package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// FollowUser Follow a user
// @Summary Follow a user
// @Tags User
// @Accept json
// @Produce json
// @Param data body request.FollowRequest true "Target user UUID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/follow [post]
func FollowUser(c *gin.Context) {
	var req request.FollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	if userUUID == req.FollowedUUID {
		response.FailWithMessage("Cannot follow yourself", c)
		return
	}

	if err := service.FollowUser(userUUID, req.FollowedUUID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithMessage("Followed successfully", c)
}

// UnfollowUser Unfollow a user
// @Summary Unfollow a user
// @Tags User
// @Accept json
// @Produce json
// @Param data body request.FollowRequest true "Target user UUID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/user/unfollow [post]
func UnfollowUser(c *gin.Context) {
	var req request.FollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	if err := service.UnfollowUser(userUUID, req.FollowedUUID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithMessage("Unfollowed successfully", c)
}

// FollowedList Get the list of users I follow
// @Summary Get following list
// @Tags User
// @Accept json
// @Produce json
// @Param data body request.FollowListRequest true "Pagination"
// @Success 200 {object} response.Response{data=[]response.FollowedUserInfo}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/user/following [post]
func FollowedList(c *gin.Context) {
	var req request.FollowListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}
	list, _, err := service.ListFollowedUsers(userUUID, req.PageNum, req.PageSize)
	if err != nil {
		response.FailWithMessage("Failed to retrieve list: "+err.Error(), c)
		return
	}
	response.OkWithData(list, c)
}

// FollowersList Get my followers list
// @Summary Get followers list
// @Tags User
// @Accept json
// @Produce json
// @Param data body request.FollowListRequest true "Pagination"
// @Success 200 {object} response.Response{data=[]response.FollowedUserInfo}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/user/followers [post]
func FollowersList(c *gin.Context) {
	var req request.FollowListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}
	list, _, err := service.ListFollowers(userUUID, req.PageNum, req.PageSize)
	if err != nil {
		response.FailWithMessage("Failed to retrieve followers: "+err.Error(), c)
		return
	}
	response.OkWithData(list, c)
}

// FollowCount Get the count of my following and followers
// @Summary Get follow/follower statistics
// @Tags User
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=response.FollowCountResponse}
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/user/follow/count [post]
func FollowCount(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}
	following, follower, err := service.GetFollowCount(userUUID)
	if err != nil {
		response.FailWithMessage("Failed to retrieve follow statistics: "+err.Error(), c)
		return
	}
	response.OkWithData(response.FollowCountResponse{
		FollowingCount: following,
		FollowerCount:  follower,
	}, c)
}

// FollowStatus Check if following a user
// @Summary Check follow status
// @Tags User
// @Accept json
// @Produce json
// @Param data body request.FollowStatusRequest true "Target user UUID"
// @Success 200 {object} response.Response{data=response.FollowStatusResponse}
// @Failure 400 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/user/follow/status [post]
func FollowStatus(c *gin.Context) {
	var req request.FollowStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	isFollow, err := service.IsFollowing(userUUID, req.TargetUUID)
	if err != nil {
		response.FailWithMessage("Failed to check follow status: "+err.Error(), c)
		return
	}
	response.OkWithData(response.FollowStatusResponse{IsFollowing: isFollow}, c)
}

// FollowedPosts Get posts from users I follow
// @Summary Get followed users' posts
// @Tags User
// @Accept json
// @Produce json
// @Param data body request.ListPostRequest true "Pagination parameters"
// @Success 200 {object} response.Response{data=response.PostListResponse}
// @Failure 400 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/user/following/posts [post]
func FollowedPosts(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	list, total, err := service.ListFollowedPosts(userUUID, req.PageNum, req.PageSize, req.SortOrder)
	if err != nil {
		response.FailWithMessage("Failed to retrieve posts: "+err.Error(), c)
		return
	}
	response.OkWithData(response.PostListResponse{
		Total: int(total),
		List:  list,
	}, c)
}
