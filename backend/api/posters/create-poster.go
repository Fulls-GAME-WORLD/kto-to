package posters

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreatePoster(c *gin.Context) {
	var poster models.Poster

	if err := c.ShouldBindJSON(&poster); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error while parsing request"})
		return
	}

	if poster.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	if poster.Width <= 0 {
		poster.Width = 794
	}

	if poster.Height <= 0 {
		poster.Height = 1123
	}

	if err := db.DB.Create(&poster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating poster"})
		return
	}

	c.JSON(http.StatusCreated, poster)
}
