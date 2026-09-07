package posters

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DeletePoster(c *gin.Context) {
	id := c.Param("id")

	if err := db.DB.Delete(&models.Poster{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while deleting poster"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Poster deleted successfully"})
}
