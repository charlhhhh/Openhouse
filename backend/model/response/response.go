package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	SUCCESS = 0
	ERROR   = 7
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Ok 成功但无数据
func Ok(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    SUCCESS,
		Message: "操作成功",
	})
}

// OkWithMessage 成功返回信息
func OkWithMessage(message string, c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    SUCCESS,
		Message: message,
	})
}

// OkWithData 成功返回数据
func OkWithData(data interface{}, c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    SUCCESS,
		Message: "操作成功",
		Data:    data,
	})
}

// OkWithDetailed 成功返回详细数据和自定义提示
func OkWithDetailed(data interface{}, message string, c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    SUCCESS,
		Message: message,
		Data:    data,
	})
}

// Fail 错误但无额外信息
func Fail(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    ERROR,
		Message: "操作失败",
	})
}

// FailWithMessage 错误并带信息
func FailWithMessage(message string, c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    ERROR,
		Message: message,
	})
}

// FailWithDetailed 错误返回详细数据和提示
func FailWithDetailed(data interface{}, message string, c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    ERROR,
		Message: message,
		Data:    data,
	})
}
