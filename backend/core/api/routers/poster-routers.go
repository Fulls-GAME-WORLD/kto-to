package routers

import (
	"github.com/gin-gonic/gin"
	"kak-to/api/templates"
	"kak-to/api/posters"
	"kak-to/api/assets"
)

func PosterRouters(app *gin.Engine) {
	app.Static("/uploads", "./uploads")

	v1 := app.Group("/api/v1/poster")
	{
		v1.GET("/hello", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Poster API is working"})
		})

		v1.POST("/posters", posters.CreatePoster)
		v1.GET("/posters", posters.ListPosters)
		v1.GET("/posters/:id", posters.GetPoster)
		v1.PUT("/posters/:id", posters.UpdatePoster)
		v1.DELETE("/posters/:id", posters.DeletePoster)

		v1.POST("/assets", assets.UploadAsset)
		v1.GET("/assets", assets.ListAssets)
		v1.DELETE("/assets/:id", assets.DeleteAsset)

		v1.GET("/templates", templates.ListTemplates)
		v1.POST("/templates/:id/clone", templates.CloneTemplate)
	}
}
