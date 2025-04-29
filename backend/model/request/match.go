package request

// MatchUserInfoForLLM 提供给 LLM的用户信息结构
type MatchUserInfoForLLM struct {
	ResearchArea string
	IntroShort   string
	Tags         []string
	PostTitle    string
	PostContent  string
}
