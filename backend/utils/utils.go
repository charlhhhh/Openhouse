package utils

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/response"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

func BindJsonAndValid(c *gin.Context, model interface{}) interface{} {
	if err := c.ShouldBindJSON(&model); err != nil {
		//_, file, line, _ := runtime.Caller(1)
		//global.LOG.Panic(file + "(line " + strconv.Itoa(line) + "): bind model error")
		panic(err)
	}
	return model
}

func ShouldBindAndValid(c *gin.Context, model interface{}) error {
	if err := c.ShouldBind(&model); err != nil {
		return err
	}
	return nil
}

func GetMd5(str string) string {
	h := md5.New()
	h.Write([]byte(str))
	return hex.EncodeToString(h.Sum(nil))
}

func CloseFile(file *os.File) {
	err := file.Close()
	if err != nil {
		return
	}
}

func ConvertPostModelWithUser(post database.Post, currentUserUUID string) response.PostInfo {
	var imageURLs []string
	_ = json.Unmarshal(post.ImageURLs, &imageURLs)

	// 查作者信息
	var author database.User
	_ = global.DB.First(&author, "uuid = ?", post.AuthorUUID)

	// 是否关注
	isFollow := false
	if currentUserUUID != "" && currentUserUUID != post.AuthorUUID {
		var relation database.UserFollow
		if err := global.DB.
			Where("user_id = ? AND follow_id = ? AND deleted_at IS NULL", currentUserUUID, post.AuthorUUID).
			First(&relation).Error; err == nil {
			isFollow = true
		}
	}

	return response.PostInfo{
		PostID:         post.ID,
		AuthorUUID:     post.AuthorUUID,
		Title:          post.Title,
		Content:        post.Content,
		ImageURLs:      imageURLs,
		CreateDate:     post.CreateDate,
		StarNumber:     post.StarNumber,
		FavoriteNumber: post.FavoriteNumber,
		ViewNumber:     post.ViewNumber,
		CommentNumber:  post.CommentNumber,

		// 用户信息字段
		Username:    author.Username,
		IntroLong:   author.IntroLong,
		AvatarURL:   author.AvatarURL,
		IsFollowing: isFollow,
	}
}

func ParseUint(s string) (uint64, error) {
	return strconv.ParseUint(s, 10, 64)
}

func StringToInt(s string, defaultValue int) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		return defaultValue
	}
	return i
}
