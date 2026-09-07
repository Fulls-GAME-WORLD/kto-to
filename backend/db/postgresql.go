package db

import (
	"gorm.io/driver/postgres"
	"kak-to/models"
	"gorm.io/gorm"
	"log"
)

var DB *gorm.DB

func InitDB(dsn string) error {
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.Poster{},
		&models.PosterAsset{},
		&models.PosterTemplate{},
	)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	return nil
}
