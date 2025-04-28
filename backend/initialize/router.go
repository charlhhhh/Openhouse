package initialize

import (
	v1 "OpenHouse/api/v1"
	"OpenHouse/docs"
	"OpenHouse/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func SetupRouter(r *gin.Engine) {
	r.Use(middleware.Cors())         // 跨域
	r.Use(middleware.LoggerToFile()) // 日志

	docs.SwaggerInfo.Title = "Openhouse backend doc"
	docs.SwaggerInfo.Version = "v1"
	// docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.Schemes = []string{"http", "https"}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	r.GET("/api/v1/test", testGin)

	apiV1 := r.Group("/api/v1/")
	{
		auth := apiV1.Group("/auth").Use(middleware.JWTAuthMiddlewareOptional())
		{
			auth.POST("/email/verify", v1.EmailLogin)
			auth.POST("/email/send", v1.SendVerifyEmail)
			auth.GET("/github/callback", v1.GitHubCallback)
			auth.GET("/google/callback", v1.GoogleCallback)
		}

		user := apiV1.Group("/user").Use(middleware.JWTAuthMiddleware())
		{
			user.GET("/profile", v1.GetProfile)
			user.POST("/profile", v1.UpdateProfile)
			// user.POST("/bind/github", v1.BindGitHub)
			// user.POST("/bind/google", v1.BindGoogle)
			// user.POST("/bind/email", v1.BindEmail)
			user.POST("/follow", v1.FollowUser)
			user.POST("/unfollow", v1.UnfollowUser)
			user.POST("/following", v1.FollowedList)
			user.POST("/followers", v1.FollowersList)
			user.POST("/follow/count", v1.FollowCount)
			user.POST("/follow/status", v1.FollowStatus)
			user.POST("/following/posts", v1.FollowedPosts)
		}

		postsAuth := apiV1.Group("/posts").Use(middleware.JWTAuthMiddleware())
		{
			postsAuth.POST("/create", v1.CreatePost)
			postsAuth.POST("/update", v1.UpdatePost)
			postsAuth.POST("/mypostlist", v1.ListMyPosts)
			postsAuth.POST("/delete", v1.DeletePost)
			postsAuth.POST("/favorite", v1.FavoritePost)
			postsAuth.POST("/unfavorite", v1.UnfavoritePost)
			postsAuth.POST("/favorites_list", v1.FavoriteList)
			postsAuth.POST("/star", v1.StarPost)
			postsAuth.POST("/unstar", v1.UnstarPost)
			postsAuth.POST("/list", v1.ListPosts)
			postsAuth.POST("/detail", v1.PostDetail)
		}

		commentsAuth := apiV1.Group("/comments").Use(middleware.JWTAuthMiddleware())
		{
			commentsAuth.POST("/list", v1.ListComments)    // 一级评论列表
			commentsAuth.POST("/replies", v1.ListReplies)  // 子评论分页加载
			commentsAuth.POST("/create", v1.CreateComment) // 创建评论
			commentsAuth.POST("/like", v1.LikeComment)     // 点赞评论
			commentsAuth.POST("/unlike", v1.UnlikeComment) // 取消点赞
		}
	}
}

// TestGin 测试API
// @Summary     测试前后端联通性
// @Description 测试前后端联通性
// @Tags        测试
// @Param       data query string true "ping"
// @Accept      json
// @Produce     json
// @Success     200 {string} json "{"message": "pong", "success": true}"
// @Router      /test [GET]
func testGin(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "pong",
		"success": true,
	})
}
