package database

import (
	"time"

	"gorm.io/datatypes"
)

type User struct {
	UUID          string         `gorm:"primaryKey" json:"uuid"`
	CreatedAt     time.Time      `json:"created_at"`
	IsVerified    bool           `json:"is_verified"`
	Username      string         `json:"username"`
	Gender        string         `json:"gender"`
	AvatarURL     string         `json:"avatar_url"`
	IntroShort    string         `json:"intro_short"`
	IntroLong     string         `json:"intro_long"`
	Coin          int            `json:"coin"`
	Tags          datatypes.JSON `json:"tags"`          // Tags存为JSON类型
	ResearchArea  string         `json:"research_area"` // 研究领域
	IsEmailBound  bool           `gorm:"default:false" json:"is_email_bound"`
	IsGitHubBound bool           `gorm:"default:false" json:"is_github_bound"`
	IsGoogleBound bool           `gorm:"default:false" json:"is_google_bound"`
}

// AuthAccount 表结构
type AuthAccount struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProfileUUID string    `gorm:"type:varchar(36);index" json:"profile_uuid"`
	Provider    string    `gorm:"type:varchar(50)" json:"provider"`     // github/google/email
	ProviderID  string    `gorm:"type:varchar(100)" json:"provider_id"` // 第三方 user id 或邮箱
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}
