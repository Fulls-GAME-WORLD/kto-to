package templates

import (
	"kak-to/models"
	"kak-to/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ListTemplates(c *gin.Context) {
	var templates []models.PosterTemplate

	if err := db.DB.Order("id ASC").Find(&templates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while fetching templates"})
		return
	}

	c.JSON(http.StatusOK, templates)
}
