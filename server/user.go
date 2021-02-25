package main

import (
	"errors"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var userTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
	id uuid UNIQUE,
	user_name text UNIQUE,
	password text,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)`

type User struct {
	ID        string    `db:"id" json:"id"`
	UserName  string    `db:"user_name" json:"name"`
	Password  string    `db:"password" json:"password"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type LoginData struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func addUser(c *gin.Context) {
	var newUserData LoginData
	err := c.BindJSON(&newUserData)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	pwHash, err := bcrypt.GenerateFromPassword([]byte(newUserData.Password), 10)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	db := GetDB()
	_, err = db.Exec("INSERT INTO users VALUES (uuid_generate_v4(), $1, $2, now(), now())", strings.ToLower(newUserData.Username), pwHash)

	/* if user already exists */
	if err != nil {
		saveErrorInfo(c, err, 409)
		return
	}

	/* read user data from data base */
	userInDatabase := User{}
	err = db.Get(&userInDatabase, "SELECT * FROM users WHERE user_name=$1", strings.ToLower(newUserData.Username))
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	/* get token and return it */
	token := getToken(userInDatabase.ID)
	c.JSON(200, gin.H{
		"token": token,
	})
}

func login(c *gin.Context) {
	var loginData LoginData
	err := c.BindJSON(&loginData)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	db := GetDB()
	userInDatabase := User{}
	err = db.Get(&userInDatabase, "SELECT * FROM users WHERE user_name=$1", strings.ToLower(loginData.Username))
	if err != nil {
		saveErrorInfo(c, err, 401)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(userInDatabase.Password), []byte(loginData.Password)) == nil {
		/* get token and return it */
		token := getToken(userInDatabase.ID)
		c.JSON(200, gin.H{
			"token": token,
		})
	} else {
		saveErrorInfo(c, errors.New("Wrong password."), 401)
	}
}
