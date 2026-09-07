package templates

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func CloneTemplate(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

	id := c.Param("id")

	var template models.PosterTemplate
	if err := db.DB.First(&template, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	poster := models.Poster{
		UserUUID: userUUID.(string),
		Name:     template.Name + " (copy)",
		Format:   template.Format,
		Scene:    template.Scene,
		Width:    794,
		Height:   1123,
	}

	if err := db.DB.Create(&poster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while cloning template"})
		return
	}

	c.JSON(http.StatusCreated, poster)
}
