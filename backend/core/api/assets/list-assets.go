package assets

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func ListAssets(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	var assets []models.PosterAsset

	if err := db.DB.Where("user_uuid = ?", userUUID).Order("id DESC").Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching assets"})
		return
	}

	c.JSON(http.StatusOK, assets)
}
