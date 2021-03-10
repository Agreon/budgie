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

type RecurringInput struct {
	Name      string    `json:"name" binding:"required"`
	Costs     string    `json:"costs" binding:"required"`
	Category  string    `json:"category"`
	Type      string    `json:"type" binding:"required"`
	StartDate time.Time `json:"start_date" binding:"required"`
	EndDate   time.Time `json:"end_date" `
}

type RecurringOutput struct {
	Recurring
	History []Recurring `json:"history"`
}
type RecurringListOutput struct {
	Data    []Recurring `json:"data"`
	Entries int         `json:"number_of_entries"`
}

func listRecurring(c *gin.Context) {
	db := GetDB()
	recurring := RecurringListOutput{}

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
	err = db.Select(&recurring.Data, "SELECT * FROM recurring WHERE user_id=$1 AND active=$2 AND is_expense=$3 ORDER BY created_at DESC LIMIT $4 OFFSET $5", userID, true, isExpense, pageSize, page)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&recurring.Entries, "SELECT count(*) FROM recurring WHERE user_id=$1 AND active=$2 AND is_expense=$3", userID, true, isExpense)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	if len(recurring.Data) == 0 {
		recurring.Data = []Recurring{}
	}

	c.JSON(200, recurring)
}

func insertRecurring(c *gin.Context) {
	var newRecurring RecurringInput
	var err error
	if err = c.BindJSON(&newRecurring); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}
	var isExpense bool
	if newRecurring.Type == "expense" {
		isExpense = true
	} else if newRecurring.Type == "income" {
		isExpense = false
	} else {
		saveErrorInfo(c, errors.New("Invalid type"), 400)
		return
	}

	userID := c.MustGet("userID")

	db := GetDB()
	_, err = db.Exec("INSERT INTO recurring VALUES (uuid_generate_v4(), uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, now(), now())", newRecurring.Name, newRecurring.Costs, userID, newRecurring.Category, true, isExpense, newRecurring.StartDate, newRecurring.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	/* return input */
	c.JSON(200, newRecurring)
}

func listSingleRecurring(c *gin.Context) {
	var recurringOutput RecurringOutput
	var err error
	var errCode int
	recurringOutput.Recurring, err, errCode = getSingleRecurringFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	err = db.Select(&recurringOutput.History, "SELECT * FROM recurring WHERE recurring_id=$1 AND NOT id=$2 ORDER BY start_date DESC", recurringOutput.RecurringID, recurringOutput.ID)

	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	if len(recurringOutput.History) == 0 {
		recurringOutput.History = []Recurring{}
	}
	c.JSON(200, recurringOutput)
}

func getSingleRecurringFromDB(c *gin.Context) (Recurring, error, int) {
	recurringID := c.MustGet("entityID")
	recurring := Recurring{}

	db := GetDB()
	err := db.Get(&recurring, "SELECT * FROM recurring WHERE id=$1", recurringID)

	/* check if expense exists */
	if err != nil {
		return recurring, err, 400
	}

	userID := c.MustGet("userID")

	/* check if recurring belongs to requesting user */
	if recurring.UserID != userID {
		return recurring, errors.New("Recurring does not belong to this user!"), 403
	}

	return recurring, nil, 200
}
