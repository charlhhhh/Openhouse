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
	docs.SwaggerInfo.BasePath = "/api/v1"
	docs.SwaggerInfo.Schemes = []string{"http", "https"}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	r.GET("/api/v1/test", testGin)

	apiV1 := r.Group("/api/v1/")
	{
		auth := apiV1.Group("/auth")
		{
			auth.POST("/email", v1.EmailLogin)
			auth.GET("/github/callback", v1.GitHubCallback)
		}

		user := apiV1.Group("/user").Use(middleware.JWTAuthMiddleware())
		{
			user.GET("/profile", v1.GetProfile)
			user.PUT("/profile", v1.UpdateProfile)
			// user.POST("/bind/getbindinfo", v1.GetBindInfo)
			// user.POST("/bind/github", v1.BindGitHub)
			// user.POST("/bind/google", v1.BindGoogle)
			// user.POST("/bind/email", v1.BindEmail)
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
