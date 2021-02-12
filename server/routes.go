package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func insertExpense(c *gin.Context) {
	var newExpense ExpenseInput
	err := c.BindJSON(&newExpense)
	if err != nil {
		return
	}

	log.Println("Insert expense!")

	/* get userID from middleware */
	userID := c.MustGet("userID")

	fmt.Printf("token is valid -> data: %v, bla: %v, cost: %v, date: %v, userID: %v\n", newExpense.Name, newExpense.Category, newExpense.Costs, newExpense.Date, userID)
	db := GetDB()
	_, err = db.Exec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), now())", newExpense.Name, newExpense.Category, newExpense.Costs, userID, newExpense.Date)

	/* if there is a database error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	fmt.Printf("URL to store: %v, bla: %v, cost: %v, date: %v\n", newExpense.Name, newExpense.Category, newExpense.Costs, newExpense.Date)

	/* return input */
	c.JSON(200, newExpense)
}

func listExpenses(c *gin.Context) {
	db := GetDB()
	expenses := []Expense{}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	err := db.Select(&expenses, "SELECT * FROM expense WHERE user_id=$1 ORDER BY created_at DESC", userID)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	c.JSON(200, expenses)
}

func listSingleExpense(c *gin.Context) {
	expenseID := c.Param("id")

	/* get userID from middleware */
	userID := c.MustGet("userID")

	db := GetDB()
	expense := Expense{}
	err := db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expenseID)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(400)
		return
	}

	if expense.UserID != userID {
		c.AbortWithStatus(403)
		return
	}

	c.JSON(200, expense)
}

func updateExpense(c *gin.Context) {
	expenseID := c.Param("id")

	db := GetDB()
	expense := Expense{}

	err := db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expenseID)

	/* check if expense exists */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(404)
		return
	}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	/* check if expense belongs to requesting user */
	if expense.UserID != userID {
		c.AbortWithStatus(403)
		return
	}

	var updateExpense ExpenseInput
	err = c.BindJSON(&updateExpense)
	if err != nil {
		return
	}

	_, err = db.Exec("UPDATE expense SET name=$1, category=$2, costs=$3, date=$4, updated_at=now() WHERE id=$5", updateExpense.Name, updateExpense.Category, updateExpense.Costs, updateExpense.Date, expenseID)

	/* if there is a database error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	err = db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expenseID)

	if err != nil {
		log.Println(err)
		return
	}

	c.JSON(200, expense)
}

func deleteExpense(c *gin.Context) {
	expenseID := c.Param("id")

	db := GetDB()
	expense := Expense{}

	err := db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expenseID)

	/* check if expense exists */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(404)
		return
	}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	/* check if expense belongs to requesting user */
	if expense.UserID != userID {
		c.AbortWithStatus(403)
		return
	}

	_, err = db.Exec("DELETE FROM expense WHERE id=$1", expenseID)

	/* if there was any execution error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	c.Status(200)
}

func addUser(c *gin.Context) {
	var newUserData LoginData
	err := c.BindJSON(&newUserData)
	if err != nil {
		return
	}

	pwHash, err := bcrypt.GenerateFromPassword([]byte(newUserData.Password), 10)
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	db := GetDB()
	_, err = db.Exec("INSERT INTO users VALUES (uuid_generate_v4(), $1, $2, now(), now())", strings.ToLower(newUserData.Username), pwHash)

	/* if user already exists */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(409)
		return
	}

	/* read user data from data base */
	userInDatabase := User{}
	err = db.Get(&userInDatabase, "SELECT * FROM users WHERE user_name=$1", strings.ToLower(newUserData.Username))
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
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
		return
	}

	db := GetDB()
	userInDatabase := User{}
	err = db.Get(&userInDatabase, "SELECT * FROM users WHERE user_name=$1", strings.ToLower(loginData.Username))
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(401)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(userInDatabase.Password), []byte(loginData.Password)) == nil {
		/* get token and return it */
		token := getToken(userInDatabase.ID)
		c.JSON(200, gin.H{
			"token": token,
		})
	} else {
		c.AbortWithStatus(401)
	}
}
