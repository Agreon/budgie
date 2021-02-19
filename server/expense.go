package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var expenseTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS expense (
	id uuid UNIQUE,
	name text,
	category text,
	costs numeric,
	user_id uuid,
	date timestamp with time zone,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)`

type ExpenseCategory string

const (
	Food            ExpenseCategory = "Food"
	Clothes                         = "Clothes"
	DinnerOutside                   = "DinnerOutside"
	Rent                            = "Rent"
	Electricity                     = "Electricity"
	GEZ                             = "GEZ"
	Insurance                       = "Insurance"
	Cellphone                       = "Cellphone"
	PublicTransport                 = "PublicTransport"
	Internet                        = "Internet"
	HygieneMedicine                 = "HygieneMedicine"
	LeisureTime                     = "LeisureTime"
	Education                       = "Education"
	Travel                          = "Travel"
	Other                           = "Other"
)

type Expense struct {
	ID        string          `db:"id" json:"id"`
	Name      string          `db:"name" json:"name"`
	Category  ExpenseCategory `db:"category" json:"category"`
	Costs     string          `db:"costs" json:"costs"`
	UserID    string          `db:"user_id" json:"user_id"`
	Date      time.Time       `db:"date" json:"date"`
	CreatedAt time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt time.Time       `db:"updated_at" json:"updated_at"`
}

type ExpenseInput struct {
	Name     string          `json:"name"`
	Category ExpenseCategory `json:"category" binding:"required"`
	Costs    string          `json:"costs" binding:"required"`
	Date     string          `json:"date" binding:"required"`
}

func insertExpense(c *gin.Context) {
	var newExpense ExpenseInput
	err := c.BindJSON(&newExpense)
	if err != nil {
		return
	}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	db := GetDB()
	_, err = db.Exec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), now())", newExpense.Name, newExpense.Category, newExpense.Costs, userID, newExpense.Date)

	/* if there is a database error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

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
	expense, expenseID := getSingleExpenseFromDB(c)

	if expenseID == "" {
		return
	}

	c.JSON(200, expense)
}

func updateExpense(c *gin.Context) {
	expense, expenseID := getSingleExpenseFromDB(c)

	if expenseID == "" {
		return
	}

	/* get updated data from body */
	var updateExpense ExpenseInput
	err := c.BindJSON(&updateExpense)
	if err != nil {
		return
	}

	db := GetDB()
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
		c.AbortWithStatus(500)
		return
	}

	c.JSON(200, expense)
}

func deleteExpense(c *gin.Context) {
	_, expenseID := getSingleExpenseFromDB(c)

	if expenseID == "" {
		return
	}

	db := GetDB()
	_, err := db.Exec("DELETE FROM expense WHERE id=$1", expenseID)

	/* if there was any execution error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	c.Status(200)
}

func getSingleExpenseFromDB(c *gin.Context) (Expense, string) {
	expenseID := c.MustGet("entityID")
	expense := Expense{}

	db := GetDB()
	err := db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expenseID)

	/* check if expense exists */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(400)
		return expense, ""
	}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	/* check if expense belongs to requesting user */
	if expense.UserID != userID {
		c.AbortWithStatus(403)
		return expense, ""
	}

	return expense, expenseID.(string)
}
