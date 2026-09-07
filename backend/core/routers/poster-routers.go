package routers

import (
	"kak-to/core/api/templates"
	"github.com/gin-gonic/gin"
	"kak-to/utils/middleware"
	"kak-to/core/api/posters"
	"kak-to/core/api/assets"
	"kak-to/core/api/auth"
)

func PosterRouters(app *gin.Engine) {
	app.Static("/uploads", "./uploads")

	v1 := app.Group("/api/v1/poster")
	{
		v1.GET("/hello", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Poster API is working"})
		})

		v1.POST("/start/register", auth.Register)
		v1.POST("/start/login", auth.Login)
		v1.GET("/templates", templates.ListTemplates)
	}

	protected := app.Group("/api/v1/poster")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/get/my/profile", auth.My)
		protected.POST("/posters", posters.CreatePoster)
		protected.GET("/posters", posters.ListPosters)
		protected.GET("/posters/:id", posters.GetPoster)
		protected.PUT("/posters/:id", posters.UpdatePoster)
		protected.DELETE("/posters/:id", posters.DeletePoster)
		protected.POST("/assets", assets.UploadAsset)
		protected.GET("/assets", assets.ListAssets)
		protected.DELETE("/assets/:id", assets.DeleteAsset)
		protected.POST("/templates/:id/clone", templates.CloneTemplate)
	}
}
