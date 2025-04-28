package response

type FollowedUserInfo struct {
	UUID      string `json:"uuid"`
	Username  string `json:"username"`
	AvatarURL string `json:"avatar_url"`
}

type FollowCountResponse struct {
	FollowingCount int64 `json:"following_count"` // 我关注的人
	FollowerCount  int64 `json:"follower_count"`  // 关注我的人
}

// FollowStatusResponse 是否已关注
type FollowStatusResponse struct {
	IsFollowing bool `json:"is_following"`
}
