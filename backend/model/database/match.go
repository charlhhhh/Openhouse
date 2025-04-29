package database

import (
	"time"

	"gorm.io/gorm"
)

// MatchResult 用户每日匹配结果
type MatchResult struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserUUID   string         `gorm:"type:char(36);index;not null" json:"user_uuid"`      // 本人 UUID
	MatchUUID  string         `gorm:"type:char(36);not null" json:"match_uuid"`           // 推荐匹配的 UUID
	MatchRound string         `gorm:"type:varchar(20);index;not null" json:"match_round"` // 匹配轮次（格式：YYYYMMDD）
	MatchScore int            `gorm:"type:int;default:0" json:"match_score"`              // 匹配分数
	LLMComment string         `gorm:"type:text" json:"llm_comment"`                       // LLM 推荐理由
	CreatedAt  time.Time      `gorm:"autoCreateTime" json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
