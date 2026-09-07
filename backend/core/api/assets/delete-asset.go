package assets

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
	"strings"
	"os"
)

func DeleteAsset(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	id := c.Param("id")

	var asset models.PosterAsset
	if err := db.DB.Where("id = ? AND user_uuid = ?", id, userUUID).First(&asset).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}

	if strings.HasPrefix(asset.URL, "/uploads/") {
		os.Remove(strings.TrimPrefix(asset.URL, "/"))
	}

	if err := db.DB.Delete(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting asset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Asset deleted successfully"})
}
