package middleware

import (
	"github.com/gin-gonic/gin"
	"kak-to/utils/jwt"
	"kak-to/models"
	"kak-to/db"
	"net/http"
	"strings"
	"log"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Printf("Error getting Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not Authorized"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("Error splitting Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not Authorized"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := jwt.ValidateToken(tokenString)
		if err != nil {
			log.Printf("Error validating token: %v", err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not Authorized"})
			c.Abort()
			return
		}

		var user models.User
		if err := db.DB.Select("uuid", "is_active").Where("uuid = ?", claims.UUID).First(&user).Error; err != nil || !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"error": "account_inactive"})
			c.Abort()
			return
		}

		c.Set("userUUID", claims.UUID)
		c.Set("userEmail", claims.Email)

		c.Next()
	}
}
