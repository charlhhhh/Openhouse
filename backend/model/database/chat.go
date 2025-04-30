package database

import (
	"time"

	"gorm.io/gorm"
)

type ChatMessage struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	SenderUUID   string         `gorm:"type:char(36);index;not null" json:"sender_uuid"`
	ReceiverUUID string         `gorm:"type:char(36);index;not null" json:"receiver_uuid"`
	Content      string         `gorm:"type:text;not null" json:"content"`
	IsRead       bool           `gorm:"default:false" json:"is_read"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
