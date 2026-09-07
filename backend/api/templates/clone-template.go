package templates

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CloneTemplate(c *gin.Context) {
	id := c.Param("id")

	var template models.PosterTemplate
	if err := db.DB.First(&template, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	poster := models.Poster{
		Name:   template.Name + " (copy)",
		Format: template.Format,
		Scene:  template.Scene,
		Width:  794,
		Height: 1123,
	}

	if err := db.DB.Create(&poster).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while cloning template"})
		return
	}

	c.JSON(http.StatusCreated, poster)
}
