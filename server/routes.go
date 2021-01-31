package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func insertExpense(c *gin.Context) {
	var newExpense ExpenseInput
	c.BindJSON(&newExpense)

	db := GetDB()
	tx := db.MustBegin()
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, now(), now())", newExpense.Name, newExpense.Category, newExpense.Cost, newExpense.Date)
	tx.Commit()
	fmt.Printf("URL to store: %v, bla: %v, cost: %v, date: %v\n", newExpense.Name, newExpense.Category, newExpense.Cost, newExpense.Date)
}

func listExpenses(c *gin.Context) {

	userID := c.Query("user_id") // TODO use jwt

	db := GetDB()
	expenses := []Expense{}
	err := db.Select(&expenses, "SELECT * FROM expense WHERE user_id=$1 ORDER BY created_at DESC", userID)

	if err != nil {
		log.Fatalln(err)
	}

	c.JSON(200, expenses)
	//c.JSON(200, gin.H{
	//	"message": jason.Email,
	//	"bla":     jason.FirstName,
	//})rintf("URL to store: %v, bla: %v, cost: %v, date: %v\n", newExpanse.Name, newExpanse.Type, newExpanse.Cost, newExpanse.Date)
}

func login(c *gin.Context) {

	userNameIn := c.Query("name")

	// TODO authentification with jwt
	db := GetDB()
	userOut := User{}
	err := db.Get(&userOut, "SELECT * FROM users WHERE user_name=$1", userNameIn)
	if err != nil {
		log.Fatalln(err)
	}
	c.JSON(200, userOut)
}
