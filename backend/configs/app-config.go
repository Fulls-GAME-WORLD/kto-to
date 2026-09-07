package configs

import (
	"os"
)

func GetAppPort() string {
	SERVER_PORT := "8889"
	return ":" + SERVER_PORT
}

func GetDBUrl() string {
	DB_URL := os.Getenv("DB_URL")
	if DB_URL == "" {
		return DevGetDBUrl()
	}
	return DB_URL
}

func GetJWTSecret() string {
	JWT_SECRET := os.Getenv("JWT_SECRET")
	if JWT_SECRET == "" {
		return DevGetJWTSecret()
	}
	return JWT_SECRET
}
