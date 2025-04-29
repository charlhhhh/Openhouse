package v1

import (
	"OpenHouse/model/response"
	"strings"

	swot "github.com/Mathpix/swot"
	"github.com/gin-gonic/gin"
)

// CheckEmailDomain 检查邮箱域名是否属于高校
// @Summary     检查邮箱域名是否属于高校
// @Description 检查邮箱域名是否属于高校
// @Tags        Auth
// @Param       email query string true "邮箱地址"
// @Accept      json
// @Produce     json
// @Success     200 {object} response.CheckEmailDomainResponse
// @Failure     400 {string} json "{"msg": "邮箱地址格式错误", "status": 400}"
// @Failure     500 {string} json "{"msg": "邮箱地址不属于高校", "status": 500}"
// @Failure     500 {string} json "{"msg": "邮箱地址不能为空", "status": 500}"
// @Router      /api/v1/auth/email/academic_check [GET]
func CheckEmailDomain(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.FailWithMessage("邮箱地址不能为空", c)
		return
	}
	domain := strings.Split(email, "@")
	if len(domain) != 2 {
		response.FailWithMessage("邮箱地址格式错误", c)
		return
	}
	domain = strings.Split(domain[1], ".")
	if len(domain) < 2 {
		response.FailWithMessage("邮箱地址格式错误", c)
		return
	}
	is_academic := swot.IsAcademic(email)
	if is_academic {
		// 返回学校名称
		school := swot.GetSchoolName(email)
		if school == "" {
			response.FailWithMessage("邮箱地址不属于高校", c)
			return
		}
		response.OkWithData(response.CheckEmailDomainResponse{
			School: school,
		}, c)
		return
	}
	response.FailWithMessage("邮箱地址不属于高校", c)
	return
}
