package v1

import (
	"OpenHouse/model/response"
	"strings"

	swot "github.com/Mathpix/swot"
	"github.com/gin-gonic/gin"
)

// CheckEmailDomain Check if the email domain belongs to an academic institution
// @Summary     Check if the email domain belongs to an academic institution
// @Description Check if the email domain belongs to an academic institution
// @Tags        Auth
// @Param       email query string true "Email address"
// @Accept      json
// @Produce     json
// @Success     200 {object} response.CheckEmailDomainResponse
// @Failure     400 {string} json "{"msg": "Invalid email format", "status": 400}"
// @Failure     500 {string} json "{"msg": "Email does not belong to an academic institution", "status": 500}"
// @Failure     500 {string} json "{"msg": "Email cannot be empty", "status": 500}"
// @Router      /api/v1/auth/email/academic_check [GET]
func CheckEmailDomain(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.FailWithMessage("Email cannot be empty", c)
		return
	}
	domain := strings.Split(email, "@")
	if len(domain) != 2 {
		response.FailWithMessage("Invalid email format", c)
		return
	}
	domain = strings.Split(domain[1], ".")
	if len(domain) < 2 {
		response.FailWithMessage("Invalid email format", c)
		return
	}
	isAcademic := swot.IsAcademic(email)
	if isAcademic {
		// Return the school name
		school := swot.GetSchoolName(email)
		if school == "" {
			response.FailWithMessage("Email does not belong to an academic institution", c)
			return
		}
		response.OkWithData(response.CheckEmailDomainResponse{
			School: school,
		}, c)
		return
	}
	response.FailWithMessage("Email does not belong to an academic institution", c)
}
