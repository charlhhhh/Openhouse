package v1

import (
	"OpenHouse/model/response"
	"OpenHouse/utils"

	"github.com/gin-gonic/gin"
)

// UploadFile 上传文件到阿里云 OSS
// @Summary 上传文件
// @Description 上传图片文件至 OSS，返回可访问地址
// @Tags Media 文件
// @Security ApiKeyAuth
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "文件"
// @Success 200 {object} response.Response{data=string} "返回 OSS 文件 URL"
// @Failure 400 {object} response.Response
// @Router /api/v1/media/upload [post]
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.FailWithMessage("无法读取上传文件", c)
		return
	}

	src, err := file.Open()
	if err != nil {
		response.FailWithMessage("打开文件失败", c)
		return
	}
	defer src.Close()

	url, err := utils.UploadToOSS(src, file.Filename)
	if err != nil {
		response.FailWithMessage("上传失败: "+err.Error(), c)
		return
	}

	response.OkWithData(url, c)
}
