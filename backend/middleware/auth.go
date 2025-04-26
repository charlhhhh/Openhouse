package middleware

import (
	"OpenHouse/global"
	"strings"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt"
)

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
