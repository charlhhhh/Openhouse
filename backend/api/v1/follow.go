package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// FollowUser 关注用户
// @Summary 关注用户
// @Tags 用户 User
// @Accept json
// @Produce json
// @Param data body request.FollowRequest true "关注对象UUID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/follow [post]
func FollowUser(c *gin.Context) {
	var req request.FollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	if err := service.FollowUser(userUUID, req.FollowedUUID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithMessage("关注成功", c)
}

// UnfollowUser 取消关注
// @Summary 取消关注
// @Tags 用户 User
// @Accept json
// @Produce json
// @Param data body request.FollowRequest true "取消关注对象UUID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/unfollow [post]
func UnfollowUser(c *gin.Context) {
	var req request.FollowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	if err := service.UnfollowUser(userUUID, req.FollowedUUID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}
	response.OkWithMessage("取消关注成功", c)
}

// FollowedList 获取我关注的人
// @Summary 获取关注列表
// @Tags 用户 User
// @Accept json
// @Produce json
// @Param data body request.FollowListRequest true "分页"
// @Success 200 {object} response.Response{data=[]response.FollowedUserInfo}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/following [post]
func FollowedList(c *gin.Context) {
	var req request.FollowListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	list, _, err := service.ListFollowedUsers(userUUID, req.PageNum, req.PageSize)
	if err != nil {
		response.FailWithMessage("获取失败："+err.Error(), c)
		return
	}
	response.OkWithData(list, c)
}

// FollowersList 获取我的粉丝列表
// @Summary 获取粉丝列表
// @Tags 用户 User
// @Accept json
// @Produce json
// @Param data body request.FollowListRequest true "分页"
// @Success 200 {object} response.Response{data=[]response.FollowedUserInfo}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/followers [post]
func FollowersList(c *gin.Context) {
	var req request.FollowListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	list, _, err := service.ListFollowers(userUUID, req.PageNum, req.PageSize)
	if err != nil {
		response.FailWithMessage("获取粉丝失败："+err.Error(), c)
		return
	}
	response.OkWithData(list, c)
}

// FollowCount 获取我的关注和粉丝数量
// @Summary 获取关注/粉丝统计
// @Tags 用户 User
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=response.FollowCountResponse}
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/follow/count [post]
func FollowCount(c *gin.Context) {
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	following, follower, err := service.GetFollowCount(userUUID)
	if err != nil {
		response.FailWithMessage("获取关注统计失败："+err.Error(), c)
		return
	}
	response.OkWithData(response.FollowCountResponse{
		FollowingCount: following,
		FollowerCount:  follower,
	}, c)
}

// FollowStatus 判断是否关注某用户
// @Summary 是否关注某用户
// @Tags 用户 User
// @Accept json
// @Produce json
// @Param data body request.FollowStatusRequest true "目标用户UUID"
// @Success 200 {object} response.Response{data=response.FollowStatusResponse}
// @Failure 400 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/follow/status [post]
func FollowStatus(c *gin.Context) {
	var req request.FollowStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	isFollow, err := service.IsFollowing(userUUID, req.TargetUUID)
	if err != nil {
		response.FailWithMessage("查询失败："+err.Error(), c)
		return
	}
	response.OkWithData(response.FollowStatusResponse{IsFollowing: isFollow}, c)
}

// FollowedPosts 获取我关注的人的帖子流
// @Summary 获取关注用户的动态流
// @Tags 用户 User
// @Accept json
// @Produce json
// @Param data body request.ListPostRequest true "分页参数"
// @Success 200 {object} response.Response{data=response.PostListResponse}
// @Failure 400 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/users/following/posts [post]
func FollowedPosts(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	list, total, err := service.ListFollowedPosts(userUUID, req.PageNum, req.PageSize, req.SortOrder)
	if err != nil {
		response.FailWithMessage("获取失败："+err.Error(), c)
		return
	}
	response.OkWithData(response.PostListResponse{
		Total: int(total),
		List:  list,
	}, c)
}
