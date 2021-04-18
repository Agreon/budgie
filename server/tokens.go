package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func getToken(UserID string) string {
	secret := []byte(config.JWTSecret)
	expirationTime := time.Duration(config.JWTExpirationTimeInS)

	claims := &jwt.StandardClaims{
		ExpiresAt: time.Now().Add(time.Second * expirationTime).Unix(),
		Subject:   UserID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(secret)

	return tokenString
}

func checkTokenIsValid(tokenString string) (string, bool) {
	secret := []byte(config.JWTSecret)

	token, err := jwt.ParseWithClaims(tokenString, &jwt.StandardClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if claims, ok := token.Claims.(*jwt.StandardClaims); ok && token.Valid {
		fmt.Printf("%v\n", claims.Subject)
		return claims.Subject, true
	} else {
		fmt.Println(err)
		return "", false
	}
}

func authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenInput := c.GetHeader("token")

		/* check if input is valid (required format: x.x.x) */
		if strings.Count(tokenInput, ".") != 2 {
			c.AbortWithStatus(401)
			return
		}

		userID, tokenIsValid := checkTokenIsValid(tokenInput)

		if !tokenIsValid {
			c.AbortWithStatus(401)
		} else {
			c.Set("userID", userID)
		}

		c.Next()
	}
}
