package jwt

import (
	"github.com/golang-jwt/jwt/v5"
	"kak-to/configs"
	"time"
)

type Claims struct {
	UUID  string `json:"uuid"`
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func GenerateToken(uuid string, email string) (string, error) {
	expirationTime := time.Now().Add(60 * 24 * time.Hour)

	claims := &Claims{
		UUID:  uuid,
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   uuid,
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(configs.GetJWTSecret()))
}
