package models

import "time"

type User struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UUID       string    `gorm:"type:uuid;default:gen_random_uuid();uniqueIndex" json:"uuid"`
	Name       string    `json:"name" gorm:"not null"`
	Email      *string   `json:"email" gorm:"uniqueIndex"`
	Password   *string   `json:"-"`
	IsActive   bool      `json:"is_active" gorm:"default:true"`
	CreatedAt  time.Time `json:"created_at" gorm:"not null"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"not null"`
}
