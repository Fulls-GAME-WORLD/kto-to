package auth

import (
	"github.com/gin-gonic/gin"
	"kak-to/utils/passwords"
	"kak-to/utils/jwt"
	"kak-to/models"
	"kak-to/db"
	"net/http"
)

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	var user models.User
	if err := db.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "account_inactive"})
		return
	}

	passwordStr := ""
	if user.Password != nil {
		passwordStr = *user.Password
	}

	match, err := passwords.CheckPassword(input.Password, passwordStr)
	if err != nil || !match {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	email := ""
	if user.Email != nil {
		email = *user.Email
	}

	token, err := jwt.GenerateToken(user.UUID, email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"uuid":  user.UUID,
		"name":  user.Name,
	})
}
