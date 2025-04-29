package response

type MatchUserInfo struct {
	UUID         string   `json:"uuid"`
	Username     string   `json:"username"`
	AvatarURL    string   `json:"avatar_url"`
	IntroShort   string   `json:"intro_short"`
	ResearchArea string   `json:"research_area"`
	Tags         []string `json:"tags"`
	IsFollowing  bool     `json:"is_following"` // 当前用户是否已关注
	LLMComment   string   `json:"llm_comment"`  // LLM 推荐理由
	MatchScore   int      `json:"match_score"`  // 匹配分数
}

// MatchHistoryItem 匹配历史记录, 包含日期和匹配用户信息MatchUserInfo
type MatchHistory struct {
	MatchDate string        `json:"match_date"` // 匹配日期
	MatchUser MatchUserInfo `json:"match_user"` // 匹配用户信息
}
