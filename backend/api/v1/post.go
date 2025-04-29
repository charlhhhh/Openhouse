package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"
	"fmt"

	"OpenHouse/utils"

	"github.com/gin-gonic/gin"
)

// CreatePost Create a new post
func CreatePost(c *gin.Context) {
	var req request.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid request parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	post, err := service.CreatePost(userUUID, req.Title, req.Content, req.ImageURLs)
	if err != nil {
		response.FailWithMessage("Failed to create post: "+err.Error(), c)
		return
	}

	postInfo := utils.ConvertPostModelWithUser(post, userUUID)
	response.OkWithData(postInfo, c)
}

// UpdatePost Update a post
func UpdatePost(c *gin.Context) {
	var req request.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)
	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	if err := service.UpdatePost(userUUID, req); err != nil {
		response.FailWithMessage("Failed to update post: "+err.Error(), c)
		return
	}

	response.OkWithMessage("Post updated successfully", c)
}

// ListPosts Get a list of posts
func ListPosts(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid request parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	list, total, err := service.ListPosts(req.PageNum, req.PageSize, req.SortOrder, userUUID)
	if err != nil {
		response.FailWithMessage("Failed to retrieve posts: "+err.Error(), c)
		return
	}

	resp := response.PostListResponse{
		Total: int(total),
		List:  list,
	}
	response.OkWithData(resp, c)
}

// ListMyPosts Get the current user's posts
func ListMyPosts(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid request parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	list, total, err := service.ListUserPosts(userUUID, req.PageNum, req.PageSize, req.SortOrder, userUUID)
	if err != nil {
		response.FailWithMessage("Failed to retrieve posts: "+err.Error(), c)
		return
	}

	response.OkWithData(response.PostListResponse{
		Total: int(total),
		List:  list,
	}, c)
}

// DeletePost Delete a post
func DeletePost(c *gin.Context) {
	var req request.DeletePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	if err := service.DeletePost(userUUID, req.PostID); err != nil {
		if err.Error() == "No permission to delete this post" {
			response.FailWithDetailed(nil, "You can only delete your own posts", c)
		} else {
			response.FailWithMessage(err.Error(), c)
		}
		return
	}

	response.OkWithMessage("Post deleted successfully", c)
}

// FavoritePost Favorite a post
func FavoritePost(c *gin.Context) {
	var req request.FavoritePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}
	fmt.Println("req PostID:", req.PostID)

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	if err := service.FavoritePost(userUUID, req.PostID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("Post favorited successfully", c)
}

// UnfavoritePost Unfavorite a post
func UnfavoritePost(c *gin.Context) {
	var req request.FavoritePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
		return
	}

	if err := service.UnfavoritePost(userUUID, req.PostID); err != nil {
		response.FailWithMessage(err.Error(), c)
		return
	}

	response.OkWithMessage("Post unfavorited successfully", c)
}

// FavoriteList Get the list of favorited posts
func FavoriteList(c *gin.Context) {
	var req request.ListPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("Invalid request parameters: "+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("Not logged in or unauthorized", c)
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
// @Security ApiKeyAuth
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
