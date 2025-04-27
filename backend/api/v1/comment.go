package v1

import (
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/service"

	"github.com/gin-gonic/gin"
)

// CreateComment 创建评论
// @Summary 创建评论
// @Description 创建一级评论或子评论
// @Tags 评论 Comments
// @Accept json
// @Produce json
// @Param data body request.CreateCommentRequest true "评论请求体"
// @Success 200 {object} response.Response "评论成功"
// @Failure 400 {object} response.Response "请求参数错误"
// @Failure 401 {object} response.Response "未登录"
// @Security ApiKeyAuth
// @Router /api/v1/comments/create [post]
func CreateComment(c *gin.Context) {
	var req request.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	if err := service.CreateComment(userUUID, req.PostID, req.CommentID, req.Content); err != nil {
		response.FailWithMessage("评论失败："+err.Error(), c)
		return
	}
	response.OkWithMessage("评论成功", c)

}

// LikeComment 点赞评论
// @Summary 点赞评论
// @Tags 评论 Comments
// @Accept json
// @Produce json
// @Param data body request.LikeCommentRequest true "点赞请求体"
// @Success 200 {object} response.Response "点赞成功"
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/comments/like [post]
func LikeComment(c *gin.Context) {
	var req request.LikeCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	if err := service.LikeComment(userUUID, req.CommentID); err != nil {
		response.FailWithMessage("点赞失败："+err.Error(), c)
		return
	}
	response.OkWithMessage("点赞成功", c)
}

// UnlikeComment 取消点赞
// @Summary 取消点赞评论
// @Tags 评论 Comments
// @Accept json
// @Produce json
// @Param data body request.LikeCommentRequest true "取消点赞请求体"
// @Success 200 {object} response.Response "取消点赞成功"
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/comments/unlike [post]
func UnlikeComment(c *gin.Context) {
	var req request.LikeCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("参数错误："+err.Error(), c)
		return
	}
	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}
	if err := service.UnlikeComment(userUUID, req.CommentID); err != nil {
		response.FailWithMessage("取消失败："+err.Error(), c)
		return
	}
	response.OkWithMessage("取消点赞成功", c)
}

// ListComments 获取某个帖子的一级评论列表（含默认3条子评论）
// @Summary 获取评论列表（一级）
// @Description 获取某个帖子的一级评论（分页、排序）并返回每条评论的前三条子评论（按时间升序）
// @Tags 评论 Comments
// @Accept json
// @Produce json
// @Param data body request.ListCommentRequest true "帖子ID + 分页参数 + 排序"
// @Success 200 {object} response.Response{data=[]response.CommentInfo}
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/comments/list [post]
func ListComments(c *gin.Context) {
	var req request.ListCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("请求参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	list, total, err := service.ListComments(req.PostID, req.PageNum, req.PageSize, req.SortBy, userUUID)
	if err != nil {
		response.FailWithMessage("获取评论失败："+err.Error(), c)
		return
	}

	response.OkWithData(gin.H{
		"total": total,
		"list":  list,
	}, c)
}

// ListReplies 获取某条评论的子评论（分页）
// @Summary 获取子评论
// @Description 分页加载某条评论下的子评论（按时间升序）
// @Tags 评论 Comments
// @Accept json
// @Produce json
// @Param data body request.ListReplyRequest true "comment_id + 分页参数"
// @Success 200 {object} response.Response{data=[]response.CommentInfo}
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Security ApiKeyAuth
// @Router /api/v1/comments/replies [post]
func ListReplies(c *gin.Context) {
	var req request.ListReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.FailWithMessage("请求参数错误："+err.Error(), c)
		return
	}

	userUUID := c.MustGet("uuid").(string)

	if userUUID == "" {
		response.FailWithMessage("未登录或者未授权", c)
		return
	}

	list, total, err := service.ListChildComments(req.CommentID, req.PageNum, req.PageSize, userUUID)
	if err != nil {
		response.FailWithMessage("获取子评论失败："+err.Error(), c)
		return
	}

	response.OkWithData(gin.H{
		"total": total,
		"list":  list,
	}, c)
}
