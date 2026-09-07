package assets

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func DeleteAsset(c *gin.Context) {
	id := c.Param("id")

	var asset models.PosterAsset
	if err := db.DB.First(&asset, id).Error; err != nil {
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
