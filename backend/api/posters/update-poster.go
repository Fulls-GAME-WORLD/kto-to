package posters

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func UpdatePoster(c *gin.Context) {
	id := c.Param("id")

	var poster models.Poster
	if err := db.DB.First(&poster, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poster not found"})
		return
	}

	if err := c.ShouldBindJSON(&poster); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error while parsing request"})
		return
	}

	if err := db.DB.Save(&poster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating poster"})
		return
	}

	c.JSON(http.StatusOK, poster)
}
