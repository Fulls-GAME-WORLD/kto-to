package auth

import (
	"github.com/gin-gonic/gin"
	"kak-to/utils/passwords"
	"kak-to/utils/jwt"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func AuthRegisters(c *gin.Context) {
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	var existingCount int64
	db.DB.Model(&models.User{}).Where("email = ?", input.Email).Count(&existingCount)
	if existingCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	hashedPassword, err := passwords.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while hashing password"})
		return
	}

	user := models.User{
		Name:     input.Name,
		Email:    &input.Email,
		Password: &hashedPassword,
	}

	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while creating user"})
		return
	}

	token, err := jwt.GenerateToken(user.UUID, input.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"uuid":  user.UUID,
		"name":  user.Name,
	})
}
