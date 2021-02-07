package main

import (
	"fmt"

	"github.com/dgrijalva/jwt-go"
)

func getToken(UserID string) string {
	secret := []byte("HalloTestTest")

	claims := &jwt.StandardClaims{
		//ExpiresAt: 3600, // TODO add refresh token
		Subject: UserID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString(secret)

	return tokenString
}

func checkTokenIsValid(tokenString string) (string, bool) {
	secret := []byte("HalloTestTest")

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
