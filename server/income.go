package main

import (
	"errors"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

var incomeTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS income (
	id uuid UNIQUE,
	name text,
	costs numeric,
	user_id uuid,
	active boolean,
	date timestamp with time zone,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)`

type Income struct {
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Costs     string    `db:"costs" json:"costs"`
	UserID    string    `db:"user_id" json:"user_id"`
	Active    bool      `db:"active" json:"active"`
	Date      time.Time `db:"date" json:"date"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type IncomeInput struct {
	Name  string    `json:"name" binding:"required"`
	Costs string    ` json:"costs" binding:"required"`
	Date  time.Time ` json:"date" binding:"required"`
}

func listIncomes(c *gin.Context) {
	db := GetDB()
	income := []Income{}

	userID := c.MustGet("userID")

	page := c.Query("page")
	pageInt, err := strconv.Atoi(page)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}
	page = strconv.Itoa(pageInt * pageSize)
	err = db.Select(&income, "SELECT * FROM income WHERE user_id=$1 AND active=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4", userID, true, pageSize, page)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.JSON(200, income)
}

func insertIncome(c *gin.Context) {
	var newIncome IncomeInput
	var err error
	if err = c.BindJSON(&newIncome); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	userID := c.MustGet("userID")

	db := GetDB()
	_, err = db.Exec("INSERT INTO income VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), now())", newIncome.Name, newIncome.Costs, userID, true, newIncome.Date)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	/* return input */
	c.JSON(200, newIncome)
}

func listSingleIncome(c *gin.Context) {
	income, err, errCode := getSingleIncomeFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	c.JSON(200, income)
}

func updateIncome(c *gin.Context) {
	/* get updated data from body */
	var updateIncome IncomeInput
	var err error
	if err = c.BindJSON(&updateIncome); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	var income Income
	var errCode int
	income, err, errCode = getSingleIncomeFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	_, err = db.Exec("UPDATE income SET name=$1, costs=$2, date=$3, updated_at=now() WHERE id=$4", updateIncome.Name, updateIncome.Costs, updateIncome.Date, income.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&income, "SELECT * FROM income WHERE id=$1", income.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.JSON(200, income)
}

func deleteIncome(c *gin.Context) {
	income, err, errCode := getSingleIncomeFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	_, err = db.Exec("DELETE FROM income WHERE id=$1", income.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.Status(200)
}

func getSingleIncomeFromDB(c *gin.Context) (Income, error, int) {
	incomeID := c.MustGet("entityID")
	income := Income{}

	db := GetDB()
	err := db.Get(&income, "SELECT * FROM income WHERE id=$1", incomeID)

	/* check if expense exists */
	if err != nil {
		return income, err, 400
	}

	userID := c.MustGet("userID")

	/* check if expense belongs to requesting user */
	if income.UserID != userID {
		return income, errors.New("Income does not belong to this user!"), 403
	}

	return income, nil, 200
}
