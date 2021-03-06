package main

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
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
);

ALTER TABLE expense DROP CONSTRAINT IF EXISTS pk_expense_id;
ALTER TABLE expense
    ADD CONSTRAINT pk_expense_id
	PRIMARY KEY (id);`

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
	TagIDs   []string        `json:"tag_ids"`
}

type ExpenseWithTags struct {
	Expense
	Tags []ExpenseTagOutput `json:"tags"`
}

type ExpenseListOutput struct {
	Data    []ExpenseWithTags `json:"data"`
	Entries int               `json:"number_of_entries"`
}

func insertExpense(c *gin.Context) {
	var newExpense ExpenseInput
	var err error
	if err = c.ShouldBindBodyWith(&newExpense, binding.JSON); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	var errCode int
	err, errCode = checkIfTagsExist(c, &newExpense.TagIDs)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	userID := c.MustGet("userID")

	db := GetDB()
	rows, err := db.NamedQuery("INSERT INTO expense VALUES (uuid_generate_v4(), :name, :category, :costs, :user_id, :date, now(), now()) RETURNING id",
		map[string]interface{}{
			"name":     newExpense.Name,
			"category": newExpense.Category,
			"costs":    newExpense.Costs,
			"user_id":  userID.(string),
			"date":     newExpense.Date})
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	/* read back generated expense ID */
	var expenseID string
	if rows.Next() {
		rows.Scan(&expenseID)
	}
	err, errCode = insertTagsOfExpense(c, &newExpense.TagIDs, expenseID)
	/* if tags could not be inserted */
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	c.JSON(200, newExpense)
}

func extractFilterOptions(c *gin.Context) (filter map[string]string, err error) {
	filter = make(map[string]string)

	filter["date>"] = c.Query("startDate")
	filter["date<"] = c.Query("endDate")
	filter["category"] = c.Query("category")

	for key, value := range filter {
		if value == "" {
			delete(filter, key)
		} else if key == "date<" || key == "date>" {
			_, err = time.Parse(time.RFC3339, value)
		} else {
			/* nothing else */
		}
	}

	return
}

func listExpenses(c *gin.Context) {
	db := GetDB()
	dbExtended := DBExtended{db}
	var dataOutput ExpenseListOutput

	filterOptions, err := extractFilterOptions(c)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	userID := c.MustGet("userID")
	page := c.MustGet("page")
	err = dbExtended.SelectWithFilterOptions(&dataOutput.Data, "SELECT * FROM expense WHERE user_id=$1 ORDER BY date DESC LIMIT $2 OFFSET $3", filterOptions, userID, pageSize, page)

	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = dbExtended.GetWithFilterOptions(&dataOutput.Entries, "SELECT count(*) FROM expense WHERE user_id=$1", filterOptions, userID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	var errCode int
	for i, expense := range dataOutput.Data {
		dataOutput.Data[i].Tags, err, errCode = getTagsOfExpense(c, expense.ID)
		if err != nil {
			saveErrorInfo(c, err, errCode)
			return
		}
	}
	if len(dataOutput.Data) == 0 {
		dataOutput.Data = []ExpenseWithTags{}
	}

	c.JSON(200, dataOutput)
}

func listSingleExpense(c *gin.Context) {
	expenseWithTags := ExpenseWithTags{}

	var err error
	var errCode int
	expenseWithTags.Expense, err, errCode = getSingleExpenseFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	expenseWithTags.Tags, err, errCode = getTagsOfExpense(c, expenseWithTags.ID)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	c.JSON(200, expenseWithTags)
}

func updateExpense(c *gin.Context) {
	/* get updated data from body */
	var updateExpense ExpenseInput
	var err error
	if err = c.ShouldBindBodyWith(&updateExpense, binding.JSON); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	var expense Expense
	var errCode int
	expense, err, errCode = getSingleExpenseFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	/* updating tags here will prevent data being written if there
	was any error in tags or expenses */
	err, errCode = updateTagsOfExpense(c, &updateExpense.TagIDs, expense.ID)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	_, err = db.Exec("UPDATE expense SET name=$1, category=$2, costs=$3, date=$4, updated_at=now() WHERE id=$5", updateExpense.Name, updateExpense.Category, updateExpense.Costs, updateExpense.Date, expense.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expense.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.JSON(200, expense)
}

func deleteExpense(c *gin.Context) {
	expense, err, errCode := getSingleExpenseFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	_, err = db.Exec("DELETE FROM expense WHERE id=$1", expense.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.Status(200)
}

func getSingleExpenseFromDB(c *gin.Context) (Expense, error, int) {
	expenseID := c.MustGet("entityID")
	expense := Expense{}

	db := GetDB()
	err := db.Get(&expense, "SELECT * FROM expense WHERE id=$1", expenseID)

	/* check if expense exists */
	if err != nil {
		return expense, err, 404
	}

	userID := c.MustGet("userID")

	/* check if expense belongs to requesting user */
	if expense.UserID != userID {
		return expense, errors.New("Expense does not belong to this user!"), 403
	}

	return expense, nil, 200
}
