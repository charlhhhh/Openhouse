package v1

import (
	"OpenHouse/model/response"
	"OpenHouse/utils"

	"github.com/gin-gonic/gin"
)

// UploadFile Upload file to Aliyun OSS
// @Summary Upload file
// @Description Upload image file to OSS and return an accessible URL
// @Tags Media File
// @Security ApiKeyAuth
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File"
// @Success 200 {object} response.Response{data=string} "Return OSS file URL"
// @Failure 400 {object} response.Response
// @Router /api/v1/media/upload [post]
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.FailWithMessage("Failed to read uploaded file", c)
		return
	}

	src, err := file.Open()
	if err != nil {
		response.FailWithMessage("Failed to open file", c)
		return
	}
	defer src.Close()

	url, err := utils.UploadToOSS(src, file.Filename)
	if err != nil {
		response.FailWithMessage("Upload failed: "+err.Error(), c)
		return
	}

	response.OkWithData(url, c)
}
