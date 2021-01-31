package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func insertExpense(c *gin.Context) {
	var newExpanse IncomingExpense
	c.BindJSON(&newExpanse)

	db := GetDB()
	tx := db.MustBegin()
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, now(), now())", newExpanse.Name, newExpanse.Category, newExpanse.Cost, newExpanse.Date)
	tx.Commit()
	fmt.Printf("URL to store: %v, bla: %v, cost: %v, date: %v\n", newExpanse.Name, newExpanse.Category, newExpanse.Cost, newExpanse.Date)
}

func listExpenses(c *gin.Context) {
	db := GetDB()
	expenses := []Expense{}
	err := db.Select(&expenses, "SELECT * FROM expense ORDER BY created_at DESC")

	if err != nil {
		log.Fatalln(err)
	}

	c.JSON(200, expenses)
	//c.JSON(200, gin.H{
	//	"message": jason.Email,
	//	"bla":     jason.FirstName,
	//})rintf("URL to store: %v, bla: %v, cost: %v, date: %v\n", newExpanse.Name, newExpanse.Type, newExpanse.Cost, newExpanse.Date)
}
