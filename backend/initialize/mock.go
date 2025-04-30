package initialize

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type UserImportItem struct {
	Username     string   `json:"username"`
	IntroShort   string   `json:"intro_short"`
	ResearchArea string   `json:"research_area"`
	Tags         []string `json:"tags"`
	PostTitle    string   `json:"post_title"`
	PostContent  string   `json:"post_content"`
}

// MockData 初始化模拟数据
func MockUserData() {
	// 读取文件
	data, err := os.ReadFile("data/users.json")
	if err != nil {
		panic("❌ 读取 users.json 失败：" + err.Error())
	}

	// 解析 JSON
	var users []UserImportItem
	if err := json.Unmarshal(data, &users); err != nil {
		panic("❌ JSON 解析失败：" + err.Error())
	}

	// 写入数据库
	for _, item := range users {
		uid := uuid.New().String()
		tagJSON, _ := json.Marshal(item.Tags)

		user := database.User{
			UUID:         uid,
			Username:     item.Username,
			IntroShort:   item.IntroShort,
			ResearchArea: item.ResearchArea,
			Tags:         datatypes.JSON(tagJSON),
			AvatarURL:    "https://oss.openhouse.cn/avatar/default.png",
			Gender:       "Other",
			IsVerified:   true,
			CreatedAt:    time.Now(),
		}
		if err := global.DB.Create(&user).Error; err != nil {
			fmt.Println("❌ 插入用户失败:", item.Username, err)
			continue
		}

		post := database.Post{
			AuthorUUID: uid,
			Title:      item.PostTitle,
			Content:    item.PostContent,
			ImageURLs:  datatypes.JSON([]byte("[]")),
			CreateDate: time.Now(),
		}
		global.DB.Create(&post)

		fmt.Println("✅ 成功插入用户:", item.Username)
	}

	fmt.Println("🎉 所有用户导入完成！")
}

func MockMessageData() {
	// 读取文件
	data, err := os.ReadFile("data/messages.json")
	if err != nil {
		panic("❌ 读取 messages.json 失败：" + err.Error())
	}

	// 解析 JSON
	var messages []database.ChatMessage
	if err := json.Unmarshal(data, &messages); err != nil {
		panic("❌ JSON 解析失败：" + err.Error())
	}

	// 写入数据库
	for _, msg := range messages {
		msg.CreatedAt = time.Now()
		if err := global.DB.Create(&msg).Error; err != nil {
			fmt.Println("❌ 插入消息失败:", msg, err)
			continue
		}
	}

	fmt.Println("🎉 所有消息导入完成！")
}
