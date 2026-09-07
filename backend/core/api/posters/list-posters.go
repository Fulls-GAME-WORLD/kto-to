package posters

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func ListPosters(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	var posters []models.Poster

	if err := db.DB.Where("user_uuid = ?", userUUID).Order("updated_at DESC").Find(&posters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching posters"})
		return
	}

	c.JSON(http.StatusOK, posters)
}
