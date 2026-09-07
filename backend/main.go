package main

import (
	"github.com/gin-gonic/gin"
	"kak-to/api/templates"
	"kak-to/api/routers"
	"kak-to/configs"
	"kak-to/db"
	"fmt"
	"log"
	"io"
	"os"
)

func main() {
	if err := db.InitDB(configs.GetDBUrl()); err != nil {
		panic("Failed to connect to database: " + err.Error())
	}

	templates.SeedTemplates()

	gin.DisableConsoleColor()
	os.MkdirAll("logs", 0755)
	f, _ := os.OpenFile("logs/backend-service.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	log.SetOutput(f)
	gin.DefaultWriter = io.MultiWriter(f)
	app := gin.Default()

	routers.PosterRouters(app)
	fmt.Println("Poster Service is running on port", "http://localhost"+configs.GetAppPort())
	app.Run(configs.GetAppPort())
}
