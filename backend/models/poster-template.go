package models

import "time"

type PosterTemplate struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Format    string    `gorm:"size:64;not null" json:"format"`
	Scene     string    `gorm:"type:jsonb;default:'{}'" json:"scene"`
	Preview   string    `gorm:"size:512" json:"previewUrl"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
}
