package main

import (
	"fmt"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func getToken(UserID string) string {
	secret := []byte(config.JWTSecret)

	claims := &jwt.StandardClaims{
		//ExpiresAt: 3600, // TODO add refresh token
		Subject: UserID,
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
		fmt.Println(err)
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

		fmt.Println("This is your token: ", tokenInput)

		userID, tokenIsValid := checkTokenIsValid(tokenInput)

		if !tokenIsValid {
			c.AbortWithStatus(401)
		} else {
			c.Set("userID", userID)
		}

		c.Next()
	}
}
