package assets

import (
	"github.com/gin-gonic/gin"
	"kak-to/models"
	"path/filepath"
	"encoding/hex"
	"crypto/rand"
	"kak-to/db"
	"net/http"
	"strings"
	"os"
)

const (
	maxFileSize = 10 * 1024 * 1024
	uploadDir   = "uploads/posters"
	allowedExts = ".jpg,.jpeg,.png,.gif,.webp"
)

func UploadAsset(c *gin.Context) {
	userUUID, exists := c.Get("userUUID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
		return
	}

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
		UserUUID: userUUID.(string),
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
