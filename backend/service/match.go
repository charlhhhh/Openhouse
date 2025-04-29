package service

import (
	"OpenHouse/global"
	"OpenHouse/model/database"
	"OpenHouse/model/request"
	"OpenHouse/model/response"
	"OpenHouse/utils"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

func markUserMatchStatus(userUUID string, status string) error {
	var input request.UpdateProfileInput
	jsoninfo := `{"match_status": "` + status + `"}`
	if err := json.Unmarshal([]byte(jsoninfo), &input); err != nil {
		return errors.New("解析用户信息失败")
	}
	if err := UpdateProfile(userUUID, input); err != nil {
		return errors.New("更新用户信息失败")
	}
	return nil
}

// TriggerDailyMatch 每日批量匹配执行
func TriggerDailyMatch() error {
	// Step 1：拉取所有符合条件的用户，match_status = "matching"
	var users []database.User
	if err := global.DB.Where("match_status = ?", "matching").Find(&users).Error; err != nil {
		return errors.New("拉取用户失败")
	}
	fmt.Println("匹配用户数量:", len(users))
	fmt.Println("匹配用户列表:", users)

	// 将所有用户的匹配状态更新为 "matched"
	for i := range users {
		// call markUserMatchStatus
		if err := markUserMatchStatus(users[i].UUID, "matched"); err != nil {
			return errors.New("更新用户状态失败")
		}
	}

	// Step 2：根据完成度评分分组（TODO：可以优化，目前暂不评分，直接处理）
	if len(users) == 0 {
		return errors.New("暂无用户参与匹配")
	}

	// Step 3：聚类 / 简单随机组建小组（TODO：目前暂时进行两两匹配计算）

	// Step 4：LLM 进行两两评分
	for _, userA := range users {
		bestMatch := database.MatchResult{
			UserUUID:   userA.UUID,
			LLMComment: "",
			CreatedAt:  time.Now(),
		}
		bestScore := -1

		for _, userB := range users {
			if userA.UUID == userB.UUID {
				continue
			}
			// 模拟 LLM 匹配分数
			// score, comment := mockLLMMacthScore(userA, userB)

			// 使用 LLM 评分
			infoA := BuildUserMatchInfo(userA)
			infoB := BuildUserMatchInfo(userB)

			prompt := BuildMatchPrompt(infoA, infoB)
			fmt.Println("Prompt:", prompt)

			score, comment, err := LLMMatchScoreFromPrompt(prompt)
			if err != nil {
				fmt.Printf("用户 %s 和 %s LLM匹配失败: %v\n", userA.UUID, userB.UUID, err)
				continue
			}
			fmt.Printf("用户 %s 和 %s 匹配分数: %d, 理由: %s\n", userA.UUID, userB.UUID, score, comment)

			if score > bestScore {
				bestScore = score
				bestMatch.MatchScore = score
				bestMatch.MatchUUID = userB.UUID
				bestMatch.LLMComment = comment
			}
		}

		// 记录该用户最佳匹配, 保存匹配结果到数据库
		if bestScore > 0 {
			bestMatch.MatchRound = time.Now().Format("20060102")
			global.DB.Create(&bestMatch)
		}
	}

	return nil
}

// TriggerUserMatch 触发当前用户的匹配计算
func TriggerUserMatch(userUUID string) error {
	// Step 1：拉取当前用户信息
	var user database.User
	if err := global.DB.Where("uuid = ?", userUUID).First(&user).Error; err != nil {
		return errors.New("拉取用户信息失败")
	}

	// 直接触发匹配并返回，更新当前用户的匹配状态为 "matched"
	if err := markUserMatchStatus(user.UUID, "matched"); err != nil {
		return errors.New("更新用户状态失败")
	}

	// 查询今日是否已经做过match
	var rec database.MatchResult
	if err := global.DB.Where("user_uuid = ? AND match_round = ?", user.UUID, time.Now().Format("20060102")).First(&rec).Error; err == nil {
		return errors.New("今日已完成匹配，请明天再试")
	}

	// Step 2：拉取所有符合条件的用户
	var users []database.User
	if err := global.DB.Find(&users).Error; err != nil {
		return errors.New("拉取用户失败")
	}

	// Step 3：根据完成度评分分组（TODO：可以优化，目前暂不评分，直接处理）
	if len(users) == 0 {
		return errors.New("暂无用户参与匹配")
	}

	// Step 4：LLM 进行两两评分
	bestMatch := database.MatchResult{
		UserUUID:   user.UUID,
		LLMComment: "",
		CreatedAt:  time.Now(),
	}
	bestScore := -1

	for _, userB := range users {
		if user.UUID == userB.UUID {
			continue
		}
		infoA := BuildUserMatchInfo(user)
		infoB := BuildUserMatchInfo(userB)

		prompt := BuildMatchPrompt(infoA, infoB)
		fmt.Println("Prompt:", prompt)

		score, comment, err := LLMMatchScoreFromPrompt(prompt)
		if err != nil {
			fmt.Printf("用户 %s 和 %s LLM匹配失败: %v\n", user.UUID, userB.UUID, err)
			continue
		}
		fmt.Printf("用户 %s 和 %s 匹配分数: %d, 理由: %s\n", user.UUID, userB.UUID, score, comment)

		if score > bestScore {
			bestScore = score
			bestMatch.MatchScore = score
			bestMatch.MatchUUID = userB.UUID
			bestMatch.LLMComment = comment
		}
	}

	if bestScore > 0 {
		bestMatch.MatchRound = time.Now().Format("20060102")
		global.DB.Create(&bestMatch)
	} else {
		return errors.New("未找到合适的匹配对象")
	}

	return nil
}

// mockLLMMacthScore 用于模拟 LLM 返回评分，后续换成真实调模型
func mockLLMMacthScore(userA, userB database.User) (int, string) {
	// 这里简单做法，未来用 Tags + ResearchArea 构造 Prompt
	commonTags := utils.CommonTags(userA.Tags, userB.Tags)
	score := len(commonTags) * 20 // 每个共同标签加20分
	comment := fmt.Sprintf("你们在 %v 等领域有共同兴趣，值得交流。", commonTags)

	if score > 100 {
		score = 100
	}
	if score == 0 {
		score = 10 // 至少给点分
	}
	return score, comment
}

// GetTodayMatch 查询今日匹配结果
func GetTodayMatch(currentUUID string) (response.MatchUserInfo, string, error) {

	var user database.User
	if err := global.DB.Where("uuid = ?", currentUUID).First(&user).Error; err != nil {
		return response.MatchUserInfo{}, "用户信息查询失败", nil
	}

	now := time.Now()
	revealHour := 12 // 中午12点揭晓，可配置

	// 如果还没到揭晓时间, 同时用户的状态不是 "matched"，则返回提示
	if user.MatchStatus != "matched" {
		if now.Hour() < revealHour {
			remaining := time.Duration((revealHour-now.Hour())*3600-now.Minute()*60-now.Second()) * time.Second
			hours := int(remaining.Hours())
			minutes := int(remaining.Minutes()) % 60
			return response.MatchUserInfo{}, fmt.Sprintf("今日匹配结果将在 %02d:%02d 后揭晓", hours, minutes), nil
		}
	}

	// 到了揭晓时间，查数据库
	matchRound := now.Format("20060102")

	var rec database.MatchResult
	if err := global.DB.Where("user_uuid = ? AND match_round = ?", currentUUID, matchRound).First(&rec).Error; err != nil {
		return response.MatchUserInfo{}, "今日匹配结果未生成", nil
	}

	// 查匹配到的用户详细信息
	var matched_user database.User
	if err := global.DB.Where("uuid = ?", rec.MatchUUID).First(&matched_user).Error; err != nil {
		return response.MatchUserInfo{}, "匹配用户信息查询失败", nil
	}

	// 是否已关注
	isFollowing := CheckIsFollowing(currentUUID, matched_user.UUID)

	return response.MatchUserInfo{
		UUID:         matched_user.UUID,
		Username:     matched_user.Username,
		AvatarURL:    matched_user.AvatarURL,
		IntroShort:   matched_user.IntroShort,
		ResearchArea: matched_user.ResearchArea,
		Tags:         utils.ParseTags(matched_user.Tags),
		IsFollowing:  isFollowing,
		LLMComment:   rec.LLMComment,
		MatchScore:   rec.MatchScore,
	}, "", nil
}

// BuildUserMatchInfo 查询用户最新帖子并组装Match信息
func BuildUserMatchInfo(user database.User) request.MatchUserInfoForLLM {
	info := request.MatchUserInfoForLLM{
		ResearchArea: user.ResearchArea,
		IntroShort:   user.IntroShort,
		Tags:         utils.ParseTags(user.Tags),
	}

	// 查询用户最新的一条帖子
	var post database.Post
	err := global.DB.
		Where("author_uuid = ?", user.UUID).
		Order("create_date desc").
		First(&post).Error

	if err == nil {
		info.PostTitle = post.Title
		info.PostContent = post.Content
	} else {
		info.PostTitle = "暂无发帖"
		info.PostContent = "用户尚未发布任何内容。"
	}

	return info
}

// BuildMatchPrompt 构建两位用户的匹配打分Prompt
func BuildMatchPrompt(userA, userB request.MatchUserInfoForLLM) string {
	return fmt.Sprintf(`
你是一个学术配对助手，任务是评估两位科研人员之间的合作潜力。

请综合以下方面打分：
- 研究领域（Research Area）是否相近或互补
- 研究兴趣标签（Tags）是否有交集或相关性
- 简介（Intro Short）是否体现合作动机
- 最近发帖内容（Post）是否有协同方向

请根据上述维度，输出：

- 匹配评分 rating（0-100分）
- 推荐理由 comment（自然简洁）

返回标准 JSON，例如：
{
  "rating": 数字,
  "comment": "推荐理由"
}

以下是两位用户信息：

【用户A】
- 研究领域：%s
- 简介：%s
- 标签：%s
- 最近发帖标题：%s
- 最近发帖内容：%s

【用户B】
- 研究领域：%s
- 简介：%s
- 标签：%s
- 最近发帖标题：%s
- 最近发帖内容：%s
`,
		userA.ResearchArea, userA.IntroShort, strings.Join(userA.Tags, ", "), userA.PostTitle, userA.PostContent,
		userB.ResearchArea, userB.IntroShort, strings.Join(userB.Tags, ", "), userB.PostTitle, userB.PostContent)
}

// LLMMatchScoreFromPrompt 调用 LLM 返回匹配评分
func LLMMatchScoreFromPrompt(prompt string) (int, string, error) {
	output, err := utils.CallLLM(utils.LLMRequest{
		Model:  "gpt-4", // 或 gpt-3.5-turbo
		Prompt: prompt,
	})
	if err != nil {
		return 0, "", err
	}

	var result struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		return 0, "", errors.New("解析LLM返回失败: " + err.Error() + "，返回内容：" + output)
	}

	return result.Rating, result.Comment, nil
}

// ConfirmMatch 确认匹配
func ConfirmMatch(userUUID string) error {
	// 调用 UpdateProfile 更新用户信息
	if err := markUserMatchStatus(userUUID, "matched"); err != nil {
		return errors.New("更新用户状态失败")
	}
	return nil
}

// // GetMatchHistory 查询历史匹配记录
func GetMatchHistory(userUUID string) ([]response.MatchHistory, error) {
	// 1. 从MatchResult表中查询当前用户的匹配记录
	var matchResults []database.MatchResult
	if err := global.DB.Where("user_uuid = ?", userUUID).Order("created_at desc").Find(&matchResults).Error; err != nil {
		return nil, errors.New("查询匹配记录失败")
	}
	// 2. 遍历匹配记录，构造匹配用户信息
	var matchHistory []response.MatchHistory
	for _, result := range matchResults {
		var matchedUser database.User
		if err := global.DB.Where("uuid = ?", result.MatchUUID).First(&matchedUser).Error; err != nil {
			return nil, errors.New("查询匹配用户信息失败")
		}

		matchInfo := response.MatchUserInfo{
			UUID:         matchedUser.UUID,
			Username:     matchedUser.Username,
			AvatarURL:    matchedUser.AvatarURL,
			IntroShort:   matchedUser.IntroShort,
			ResearchArea: matchedUser.ResearchArea,
			Tags:         utils.ParseTags(matchedUser.Tags),
			IsFollowing:  CheckIsFollowing(userUUID, matchedUser.UUID),
			LLMComment:   result.LLMComment,
			MatchScore:   result.MatchScore,
		}

		matchHistory = append(matchHistory, response.MatchHistory{
			MatchDate: time.Time(result.CreatedAt).Format("2006-01-02"),
			MatchUser: matchInfo,
		})
	}
	// 3. 返回匹配历史记录
	return matchHistory, nil
}
