package posters

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func GetPoster(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	id := c.Param("id")

	var poster models.Poster
	if err := db.DB.Where("id = ? AND user_uuid = ?", id, userUUID).First(&poster).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poster not found"})
		return
	}

	c.JSON(http.StatusOK, poster)
}
