package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"OpenHouse/utils"

	"github.com/gin-gonic/gin"
)

// CreatePost 创建帖子
// @Summary 创建帖子
// @Description 用户创建一条新的帖子（可附带最多3张图）
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.CreatePostRequest true "帖子内容与图片"
// @Success 200 {object} response.Response{data=response.PostInfo}
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未授权"
// @Failure 500 {object} response.Response "服务器内部错误"
// @Security ApiKeyAuth
// @Router /api/v1/posts/create [post]
func CreatePost(c *gin.Context) {
	var req request.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("请求参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	post, err := service.CreatePost(userUUID, req.Title, req.Content, req.ImageURLs)
	if err != nil {
		response.FailWithMessage("创建帖子失败："+err.Error(), c)
		return
	}

	postInfo := utils.ConvertPostModelWithUser(post, userUUID)
	response.OkWithData(postInfo, c)
}

// ListPosts 获取帖子列表
// @Summary 获取帖子列表（分页、排序）
// @Description 按时间排序获取帖子列表，支持分页
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.ListPostRequest true "分页请求参数"
// @Success 200 {object} response.Response{data=response.PostListResponse}
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/list [post]
func ListPosts(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("请求参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	list, total, err := service.ListPosts(req.PageNum, req.PageSize, req.SortOrder, userUUID)
	if err != nil {
		response.FailWithMessage("获取帖子失败："+err.Error(), c)
		return
	}

	resp := response.PostListResponse{
		Total: int(total),
		List:  list,
	}
	response.OkWithData(resp, c)
}

// ListMyPosts 获取当前用户的帖子
// @Summary 获取我的帖子列表
// @Description 获取当前登录用户发布的帖子（分页 + 时间排序）
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.ListPostRequest true "分页请求参数"
// @Success 200 {object} response.Response{data=response.PostListResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/mypostlist [post]
func ListMyPosts(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("请求参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	list, total, err := service.ListUserPosts(userUUID, req.PageNum, req.PageSize, req.SortOrder, userUUID)
	if err != nil {
		response.FailWithMessage("获取帖子失败："+err.Error(), c)
		return
	}

	response.OkWithData(response.PostListResponse{
		Total: int(total),
		List:  list,
	}, c)
}

// DeletePost 删除帖子
// @Summary 删除帖子
// @Description 当前用户删除自己发布的帖子
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.DeletePostRequest true "要删除的帖子ID"
// @Success 200 {object} response.Response "删除成功"
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 403 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/delete [post]
func DeletePost(c *gin.Context) {
	var req request.DeletePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	if err := service.DeletePost(userUUID, req.PostID); err != nil {
		if err.Error() == "无权限删除该帖子" {
			response.FailWithDetailed(nil, "你只能删除自己的帖子", c)
		} else {
			response.FailWithMessage(err.Error(), c)
		}
		return
	}

	response.OkWithMessage("删除成功", c)
}

// FavoritePost 收藏帖子
// @Summary 收藏帖子
// @Description 当前用户收藏某个帖子（不能重复）
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.FavoritePostRequest true "帖子ID"
// @Success 200 {object} response.Response "收藏成功"
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/favorite [post]
func FavoritePost(c *gin.Context) {
	var req request.FavoritePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	if err := service.FavoritePost(userUUID, req.PostID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("收藏成功", c)
}

// UnfavoritePost 取消收藏帖子
// @Summary 取消收藏
// @Description 当前用户取消对某帖的收藏
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.FavoritePostRequest true "帖子ID"
// @Success 200 {object} response.Response "取消成功"
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/unfavorite [post]
func UnfavoritePost(c *gin.Context) {
	var req request.FavoritePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	if err := service.UnfavoritePost(userUUID, req.PostID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("取消收藏成功", c)
}

// FavoriteList 获取收藏列表
// @Summary 获取收藏的帖子
// @Description 获取当前用户收藏的帖子（分页、时间排序）
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.ListPostRequest true "分页参数"
// @Success 200 {object} response.Response{data=response.PostListResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/favorites_list [post]
func FavoriteList(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("请求参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	list, total, err := service.ListFavoritePosts(userUUID, req.PageNum, req.PageSize, req.SortOrder)
	if err != nil {
		response.FailWithMessage("获取收藏失败："+err.Error(), c)
		return
	}

	response.OkWithData(response.PostListResponse{
		Total: int(total),
		List:  list,
	}, c)
}

// StarPost 点赞帖子
// @Summary 点赞帖子
// @Description 用户点赞帖子（不能重复）
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.LikePostRequest true "帖子ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/star [post]
func StarPost(c *gin.Context) {
	var req request.LikePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	if err := service.LikePost(userUUID, req.PostID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("点赞成功", c)
}

// UnstarPost 取消点赞
// @Summary 取消点赞
// @Description 用户取消点赞帖子
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.LikePostRequest true "帖子ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/posts/unstar [post]
func UnstarPost(c *gin.Context) {
	var req request.LikePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	if err := service.UnLikePost(userUUID, req.PostID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("取消点赞成功", c)
}

// PostDetail 获取帖子详情
// @Summary 获取帖子详情
// @Description 根据 post_id 获取一条帖子详情 + 是否点赞/收藏
// @Tags 帖子 Posts
// @Accept json
// @Produce json
// @Param data body request.PostDetailRequest true "帖子ID"
// @Success 200 {object} response.Response{data=response.PostDetailResponse}
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Router /api/v1/posts/detail [post]
func PostDetail(c *gin.Context) {
	var req request.PostDetailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}

	// 如果未登录则传空UUID
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	detail, err := service.GetPostDetailWithUser(req.PostID, userUUID)
	if err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithData(detail, c)
}
