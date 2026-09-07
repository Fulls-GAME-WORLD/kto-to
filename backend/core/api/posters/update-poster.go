package posters

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func UpdatePoster(c *gin.Context) {
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

	if err := c.ShouldBindJSON(&poster); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error while parsing request"})
		return
	}

	poster.UserUUID = userUUID.(string)

	if err := db.DB.Save(&poster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while updating poster"})
		return
	}

	c.JSON(http.StatusOK, poster)
}
