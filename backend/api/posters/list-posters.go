package posters

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ListPosters(c *gin.Context) {
	var posters []models.Poster

	if err := db.DB.Order("updated_at DESC").Find(&posters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching posters"})
		return
	}

	c.JSON(http.StatusOK, posters)
}
