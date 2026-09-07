package posters

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func CreatePoster(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

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

	poster.UserUUID = userUUID.(string)

	if err := db.DB.Create(&poster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating poster"})
		return
	}

	c.JSON(http.StatusCreated, poster)
}
