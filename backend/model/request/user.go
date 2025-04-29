package request

type UpdateProfileInput struct {
	Username      *string   `json:"username,omitempty"`
	Email         *string   `json:"email,omitempty"`
	IsVerified    *bool     `json:"is_verified,omitempty"`
	AvatarURL     *string   `json:"avatar_url,omitempty"`
	IntroShort    *string   `json:"intro_short,omitempty"`
	IntroLong     *string   `json:"intro_long,omitempty"`
	Gender        *string   `json:"gender,omitempty"`
	Tags          *[]string `json:"tags,omitempty"`
	ResearchArea  *string   `json:"research_area,omitempty"`
	Coin          *int      `json:"coin,omitempty"`
	IsEmailBound  *bool     `json:"is_email_bound,omitempty"`
	IsGitHubBound *bool     `json:"is_github_bound,omitempty"`
	IsGoogleBound *bool     `json:"is_google_bound,omitempty"`
	MatchStatus   *string   `json:"match_status,omitempty"` // "available" or "matching" or "matched"
}
