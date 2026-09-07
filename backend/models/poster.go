package models

import "time"

type Poster struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	UserUUID  string    `gorm:"index;not null" json:"-"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Format    string    `gorm:"size:64;not null;default:'A4'" json:"format"`
	Width     int       `gorm:"not null" json:"width"`
	Height    int       `gorm:"not null" json:"height"`
	Scene     string    `gorm:"type:jsonb;default:'{}'" json:"scene"`
	Preview   string    `gorm:"size:512" json:"previewUrl"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}
