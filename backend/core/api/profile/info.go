package profile

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func ProfileInfo(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	var user models.User
	if err := db.DB.Where("uuid = ?", userUUID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name": user.Name,
		"email": user.Email,
		"uuid": user.UUID,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
	})
}
