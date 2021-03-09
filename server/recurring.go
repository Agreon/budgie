package main

import (
	"errors"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

var recurringTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS recurring (
	id uuid UNIQUE,
	recurring_id uuid,
	name text,
	costs numeric,
	user_id uuid,
	category text,
	active boolean,
	is_expense boolean,
	start_date timestamp with time zone,
	end_date timestamp with time zone,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)`

type Recurring struct {
	ID          string    `db:"id" json:"id"`
	RecurringID string    `db:"recurring_id" json:"recurring_id"`
	Name        string    `db:"name" json:"name"`
	Costs       string    `db:"costs" json:"costs"`
	UserID      string    `db:"user_id" json:"user_id"`
	Category    string    `db:"category" json:"category"`
	Active      bool      `db:"active" json:"active"`
	IsExpense   bool      `db:"is_expense" json:"is_expense"`
	StartDate   time.Time `db:"start_date" json:"start_date"`
	EndDate     time.Time `db:"end_date" json:"end_date"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

func listRecurring(c *gin.Context) {
	db := GetDB()
	recurring := []Recurring{}

	userID := c.MustGet("userID")

	entityType := c.Query("type")
	var isExpense bool
	if entityType == "expense" {
		isExpense = true
	} else if entityType == "income" {
		isExpense = false
	} else {
		saveErrorInfo(c, errors.New("Invalid type in query"), 400)
		return
	}
	page := c.Query("page")
	pageInt, err := strconv.Atoi(page)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}
	page = strconv.Itoa(pageInt * pageSize)
	err = db.Select(&recurring, "SELECT * FROM recurring WHERE user_id=$1 AND active=$2 AND is_expense=$3 ORDER BY created_at DESC LIMIT $4 OFFSET $5", userID, true, isExpense, pageSize, page)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.JSON(200, recurring)
}
