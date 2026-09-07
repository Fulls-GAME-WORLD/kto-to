package assets

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ListAssets(c *gin.Context) {
	var assets []models.PosterAsset

	if err := db.DB.Order("id DESC").Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching assets"})
		return
	}

	c.JSON(http.StatusOK, assets)
}
