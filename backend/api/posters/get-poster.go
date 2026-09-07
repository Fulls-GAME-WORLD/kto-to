package posters

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetPoster(c *gin.Context) {
	id := c.Param("id")

	var poster models.Poster
	if err := db.DB.First(&poster, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poster not found"})
		return
	}

	c.JSON(http.StatusOK, poster)
}
