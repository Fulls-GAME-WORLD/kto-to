package models

import "time"

type PosterAsset struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Filename  string    `gorm:"size:255;not null" json:"filename"`
	URL       string    `gorm:"size:512;not null" json:"url"`
	Mime      string    `gorm:"size:128" json:"mime"`
	Size      int64     `gorm:"not null" json:"size"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
}
