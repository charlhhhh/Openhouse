package middleware

import (
	"OpenHouse/global"
	"strings"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt"
)

// JWTAuthMiddleware JWT认证中间件, 用于验证用户的JWT token
// 如果token有效, 则将用户的uuid放入上下文中
// 如果token无效, 则返回401状态码
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(401, gin.H{"message": "未提供token"})
			return
		}

		// 去掉 Bearer 前缀
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(global.VP.GetString("jwt.secret")), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"message": "无效token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"message": "token claims错误"})
			return
		}

		// 提取uuid放到上下文
		uuid := claims["uuid"].(string)
		c.Set("uuid", uuid)

		c.Next()
	}
}

// JWTAuthMiddlewareOptional JWT认证中间件, 用于验证用户的JWT token
// 这种token是可选的, 用户在url中传入token, 例如：http://localhost:8080/api/v1/user?state=xxx
func JWTAuthMiddlewareOptional() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Query("state")
		if tokenString == "" {
			c.Next()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(global.VP.GetString("jwt.secret")), nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(401, gin.H{"message": "无效token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"message": "token claims错误"})
			return
		}

		uuid := claims["uuid"].(string)
		c.Set("uuid", uuid)

		c.Next()
	}
}
