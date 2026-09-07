package routers

import (
	"kak-to/core/api/templates"
	"github.com/gin-gonic/gin"
	"kak-to/utils/middleware"
	"kak-to/core/api/posters"
	"kak-to/core/api/assets"
	"kak-to/core/api/auth"
)

func testrouters(app *gin.RouterGroup) {
	app.GET("/api/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "API is working"})
	})
	app.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "API is working"})
	})
}

func PosterRouters(app *gin.Engine) {
	app.Static("/uploads", "./uploads")

	v1 := app.Group("/api/v1/poster")
	{
		testrouters(v1)

		v1.POST("/start/register", auth.Register)
		v1.POST("/start/login", auth.Login)
		v1.GET("/get/templates", templates.ListTemplates)
	}

	protected := app.Group("/api/v1/poster")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/get/my/profile", auth.My)
		protected.POST("/create/poster", posters.CreatePoster)
		protected.GET("/get/posters", posters.ListPosters)
		protected.GET("/get/poster/:id", posters.GetPoster)
		protected.PUT("/update/poster/:id", posters.UpdatePoster)
		protected.DELETE("/delete/poster/:id", posters.DeletePoster)
		protected.POST("/upload/asset", assets.UploadAsset)
		protected.GET("/get/assets", assets.ListAssets)
		protected.DELETE("/delete/asset/:id", assets.DeleteAsset)
		protected.POST("/clone/template/:id", templates.CloneTemplate)
	}
}
