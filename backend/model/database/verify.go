package database

import "time"

type VerifyCode struct {
	Code    string    `gorm:"not null" json:"code"`
	Email   string    `gorm:"size:32;" json:"email"` //邮箱
	GenTime time.Time `gorm:"type:datetime" json:"create_time"`
}
