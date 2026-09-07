package assets

import (
	"kak-to/models"
	"kak-to/db"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	maxFileSize = 10 * 1024 * 1024
	uploadDir   = "uploads/posters"
	allowedExts = ".jpg,.jpeg,.png,.gif,.webp"
)

func UploadAsset(c *gin.Context) {
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error preparing upload dir"})
		return
	}

	file, err := c.FormFile("asset")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File not found. Use multipart/form-data with 'asset' field"})
		return
	}

	if file.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum size: 10MB"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	isAllowed := false
	for _, allowedExt := range strings.Split(allowedExts, ",") {
		if ext == strings.TrimSpace(allowedExt) {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file format. Allowed: .jpg, .jpeg, .png, .gif, .webp"})
		return
	}

	tokenBytes := make([]byte, 16)
	rand.Read(tokenBytes)
	token := hex.EncodeToString(tokenBytes)
	newFilename := token + ext
	filePath := filepath.Join(uploadDir, newFilename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving file"})
		return
	}

	asset := models.PosterAsset{
		Filename: file.Filename,
		URL:      "/" + filePath,
		Mime:     file.Header.Get("Content-Type"),
		Size:     file.Size,
	}

	if err := db.DB.Create(&asset).Error; err != nil {
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving asset"})
		return
	}

	c.JSON(http.StatusCreated, asset)
}
