package database

import (
	"time"
)

// Profile 表结构
type Profile struct {
	UUID            string    `gorm:"type:char(36);primaryKey" json:"uuid"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	IsVerified      bool      `gorm:"default:false" json:"is_verified"`
	DisplayName     string    `gorm:"size:255" json:"display_name"`
	GithubUsername  string    `gorm:"size:255" json:"github_username"`
	IntroShort      string    `gorm:"size:255" json:"intro_short"`
	IntroLong       string    `gorm:"type:text" json:"intro_long"`
	AvatarUrl       string    `gorm:"size:512" json:"avatar_url"`
	Gender          string    `gorm:"size:10" json:"gender"`            // 可选 Male/Female/Other
	ThirdPartyLogin string    `gorm:"size:50" json:"third_party_login"` // github, google, microsoft
	Coin            int       `gorm:"default:0" json:"coin"`
}
