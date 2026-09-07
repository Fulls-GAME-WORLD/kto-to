package posters

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func DeletePoster(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	id := c.Param("id")

	if err := db.DB.Where("id = ? AND user_uuid = ?", id, userUUID).Delete(&models.Poster{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting poster"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poster deleted successfully"})
}
