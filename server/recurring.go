package main

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

var recurringTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS recurring (
	id uuid UNIQUE,
	parent_id uuid,
	name text,
	costs numeric,
	user_id uuid,
	category text,
	is_expense boolean,
	start_date timestamp with time zone,
	end_date timestamp with time zone,
	created_at timestamp with time zone,
	updated_at timestamp with time zone,
	PRIMARY KEY(id),
	FOREIGN KEY(parent_id)
		REFERENCES recurring(id)
			ON DELETE CASCADE
)`

type Recurring struct {
	RecurringWOutEndDate
	RecurringEndDate
}

type RecurringWOutEndDate struct {
	ID        string    `db:"id" json:"id"`
	ParentID  string    `db:"parent_id" json:"parent_id"`
	Name      string    `db:"name" json:"name"`
	Costs     string    `db:"costs" json:"costs"`
	UserID    string    `db:"user_id" json:"user_id"`
	Category  string    `db:"category" json:"category"`
	IsExpense bool      `db:"is_expense" json:"is_expense"`
	StartDate time.Time `db:"start_date" json:"start_date"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type RecurringEndDate struct {
	EndDate time.Time `db:"end_date" json:"end_date"`
}

type RecurringInput struct {
	RecurringInputWOutEndDate
	RecurringEndDate
}

type RecurringInputWOutEndDate struct {
	Name      string    `json:"name" binding:"required"`
	Costs     string    `json:"costs" binding:"required"`
	Category  string    `json:"category"`
	Type      string    `json:"type" binding:"required"`
	StartDate time.Time `json:"start_date" binding:"required"`
}

type UpdateRecurringInput struct {
	Name      string    `json:"name" binding:"required"`
	Costs     string    `json:"costs" binding:"required"`
	Category  string    `json:"category"`
	StartDate time.Time `json:"start_date" binding:"required"`
	EndDate   time.Time `json:"end_date" `
}

type RecurringOutputHistory struct {
	Recurring interface{} `json:"recurring"`
	History   []Recurring `json:"history"`
}

type RecurringListOutput struct {
	Data    []interface{} `json:"data"`
	Entries int           `json:"number_of_entries"`
}

func extractRecFilterOptions(c *gin.Context) (filter map[string]string, err error) {
	filter = make(map[string]string)

	filter["start_date>"] = c.Query("startDate")
	filter["end_date<"] = c.Query("endDate")
	filter["category"] = c.Query("category")

	for key, value := range filter {
		if value == "" {
			delete(filter, key)
		} else if key == "start_date>" || key == "end_date<" {
			_, err = time.Parse(time.RFC3339, value)
		} else {
			/* nothing else */
		}
	}

	return
}

func listRecurring(c *gin.Context) {
	db := GetDB()
	dbExtended := DBExtended{db}
	recurring := RecurringListOutput{}
	recurring.Data = []interface{}{}
	recurringData := []Recurring{}

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

	filterOptions, err := extractRecFilterOptions(c)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	page := c.MustGet("page")
	endDate, existingEndDate := filterOptions["end_date<"]
	startDate, existingStartDate := filterOptions["start_date>"]
	if existingEndDate && existingStartDate {
		var nullTime time.Time
		delete(filterOptions, "end_date<")
		delete(filterOptions, "start_date>")
		err = dbExtended.SelectWithFilterOptions(&recurringData, `
			SELECT
				relevant_recurring.id,
				relevant_recurring.name,
				relevant_recurring.user_id,
				relevant_recurring.category,
				relevant_recurring.is_expense,
				relevant_recurring.costs AS costs,
				relevant_recurring.start_date_return_value AS start_date,
				relevant_recurring.end_date_return_value AS end_date,
				relevant_recurring.created_at,
				relevant_recurring.updated_at
			FROM (
				SELECT
					id,	name, costs, user_id, category, is_expense, 
					start_date AS start_date_return_value, 
					end_date AS end_date_return_value, 
					created_at, updated_at, 
					CASE WHEN start_date<$4 THEN $4
						ELSE start_date
					END AS start_date_calc,
					CASE WHEN end_date>$3 THEN $3
						WHEN end_date=$5 THEN $3
						ELSE end_date
					END AS end_date_calc
				FROM recurring
				WHERE
					user_id=$1 AND is_expense=$2 AND start_date<$3 AND (end_date>$4 OR end_date=$5)
			) AS relevant_recurring
			ORDER BY relevant_recurring.start_date_return_value DESC LIMIT $6 OFFSET $7
		`, filterOptions, userID, isExpense, endDate, startDate, nullTime, pageSize, page)
		if err != nil {
			saveErrorInfo(c, err, 500)
			return
		}
		err = dbExtended.GetWithFilterOptions(&recurring.Entries, `
			SELECT count(*)  
			FROM (
				SELECT
					id
				FROM recurring
				WHERE
					user_id=$1 AND is_expense=$2 AND start_date<$3 AND (end_date>$4 OR end_date=$5)
			) AS relevant_recurring
		`, filterOptions, userID, isExpense, endDate, startDate, nullTime)
		if err != nil {
			saveErrorInfo(c, err, 500)
			return
		}
	} else {
		err = dbExtended.SelectWithFilterOptions(&recurringData, "SELECT id, name, costs, user_id, category, is_expense, start_date, end_date, created_at, updated_at FROM recurring WHERE user_id=$1 AND parent_id IS NULL AND is_expense=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4", filterOptions, userID, isExpense, pageSize, page)
		if err != nil {
			saveErrorInfo(c, err, 500)
			return
		}

		err = dbExtended.GetWithFilterOptions(&recurring.Entries, "SELECT count(*) FROM recurring WHERE user_id=$1 AND parent_id IS NULL AND is_expense=$2", filterOptions, userID, isExpense)
		if err != nil {
			saveErrorInfo(c, err, 500)
			return
		}
	}

	/* workaround for dealing with optional enddate */
	for i, data := range recurringData {
		if data.EndDate.IsZero() {
			recurring.Data = append(recurring.Data, recurringData[i].RecurringWOutEndDate)
		} else {
			recurring.Data = append(recurring.Data, recurringData[i])
		}
	}

	c.JSON(200, recurring)
}

func insertRecurring(c *gin.Context) {
	var newRecurring RecurringInput
	var err error
	if err = c.ShouldBindBodyWith(&newRecurring, binding.JSON); err != nil {
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

	/* check if end date is after start date if end date provided */
	if !newRecurring.EndDate.IsZero() && newRecurring.EndDate.Before(newRecurring.StartDate) {
		saveErrorInfo(c, errors.New("End date before start date."), 400)
		return
	}

	userID := c.MustGet("userID")

	db := GetDB()
	_, err = db.Exec("INSERT INTO recurring VALUES (uuid_generate_v4(), null, $1, $2, $3, $4, $5, $6, $7, now(), now())", newRecurring.Name, newRecurring.Costs, userID, newRecurring.Category, isExpense, newRecurring.StartDate, newRecurring.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	/* workaround for dealing with optional enddate */
	if newRecurring.EndDate.IsZero() {
		c.JSON(200, newRecurring.RecurringInputWOutEndDate)
	} else {
		c.JSON(200, newRecurring)
	}
}

func listSingleRecurring(c *gin.Context) {
	var recurringOutput RecurringOutputHistory
	var err error
	var errCode int
	var recurring Recurring
	recurring, err, errCode = getSingleRecurringFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	err = db.Select(&recurringOutput.History, "SELECT id, name, costs, user_id, category, is_expense, start_date, end_date, created_at, updated_at FROM recurring WHERE parent_id=$1 ORDER BY start_date DESC", recurring.ID)

	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	if len(recurringOutput.History) == 0 {
		recurringOutput.History = []Recurring{}
	}

	/* work around for dealing with optional enddate */
	if recurring.EndDate.IsZero() {
		recurringOutput.Recurring = recurring.RecurringWOutEndDate
	} else {
		recurringOutput.Recurring = recurring
	}
	c.JSON(200, recurringOutput)
}

func getSingleRecurringFromDB(c *gin.Context) (Recurring, error, int) {
	recurringID := c.MustGet("entityID")
	recurring := Recurring{}

	db := GetDB()
	err := db.Get(&recurring, "SELECT id, name, costs, user_id, category, is_expense, start_date, end_date, created_at, updated_at FROM recurring WHERE id=$1", recurringID)

	/* check if recurring exists */
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

func updateRecurring(c *gin.Context) {
	/* get updated data from body */
	var updateRecurring UpdateRecurringInput
	var err error
	if err = c.ShouldBindBodyWith(&updateRecurring, binding.JSON); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	/* check if end date is after start date if end date provided */
	if !updateRecurring.EndDate.IsZero() && updateRecurring.EndDate.Before(updateRecurring.StartDate) {
		saveErrorInfo(c, errors.New("End date before start date."), 400)
		return
	}

	var recurring Recurring
	var errCode int
	recurring, err, errCode = getSingleRecurringFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	_, err = db.Exec("UPDATE recurring SET name=$1, costs=$2, category=$3, start_date=$4, end_date=$5, updated_at=now() WHERE id=$6", updateRecurring.Name, updateRecurring.Costs, updateRecurring.Category, updateRecurring.StartDate, updateRecurring.EndDate, recurring.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&recurring, "SELECT id, name, costs, user_id, category, is_expense, start_date, end_date, created_at, updated_at FROM recurring WHERE id=$1", recurring.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	/* work around for dealing with optional enddate */
	if recurring.EndDate.IsZero() {
		c.JSON(200, recurring.RecurringWOutEndDate)
	} else {
		c.JSON(200, recurring)
	}
}

func addRecurringHistoryItem(c *gin.Context) {
	/* get updated data from body */
	var updateRecurring UpdateRecurringInput
	var err error
	if err = c.ShouldBindBodyWith(&updateRecurring, binding.JSON); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	/* check if end date is after start date if end date provided */
	if !updateRecurring.EndDate.IsZero() && updateRecurring.EndDate.Before(updateRecurring.StartDate) {
		saveErrorInfo(c, errors.New("End date before start date."), 400)
		return
	}

	/* check if id is valid (exists/belongs to this user) */
	recurringID := c.MustGet("entityID")
	recurring := Recurring{}

	db := GetDB()
	err = db.Get(&recurring, "SELECT id, name, costs, user_id, category, is_expense, start_date, end_date, created_at, updated_at FROM recurring WHERE id=$1 AND parent_id IS NULL", recurringID)

	/* check if recurring exists or is not a child item */
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	userID := c.MustGet("userID")

	/* check if recurring belongs to requesting user */
	if recurring.UserID != userID {
		saveErrorInfo(c, errors.New("Recurring does not belong to this user!"), 403)
		return
	}

	/* add end date to old main item if necessary */
	if recurring.EndDate.IsZero() {
		_, err = db.Exec("UPDATE recurring SET end_date=$1 WHERE id=$2", updateRecurring.StartDate, recurring.ID)
		if err != nil {
			saveErrorInfo(c, err, 500)
			return
		}
	} else if updateRecurring.StartDate.Before(recurring.EndDate) {
		saveErrorInfo(c, errors.New("New start date is before old end date"), 400)
		return
	}

	rows, err := db.NamedQuery("INSERT INTO recurring VALUES (uuid_generate_v4(), null, :name, :costs, :user_id, :category, :is_expense, :start_date, :end_date, now(), now()) RETURNING id",
		map[string]interface{}{
			"name":       updateRecurring.Name,
			"costs":      updateRecurring.Costs,
			"user_id":    recurring.UserID,
			"category":   updateRecurring.Category,
			"is_expense": recurring.IsExpense,
			"start_date": updateRecurring.StartDate,
			"end_date":   updateRecurring.EndDate})
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	/* read back generated recurring ID */
	var newParentID string
	if rows.Next() {
		rows.Scan(&newParentID)
	}

	/* update parent ID in previous and current item */
	_, err = db.Exec("UPDATE recurring SET parent_id=$1, updated_at=now() WHERE id=$2 OR parent_id=$2", newParentID, recurring.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&recurring, "SELECT id, name, costs, user_id, category, is_expense, start_date, end_date, created_at, updated_at FROM recurring WHERE id=$1", newParentID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	/* work around for dealing with optional enddate */
	if recurring.EndDate.IsZero() {
		c.JSON(200, recurring.RecurringWOutEndDate)
	} else {
		c.JSON(200, recurring)
	}
}

func deleteRecurring(c *gin.Context) {
	recurring, err, errCode := getSingleRecurringFromDB(c)
	if err != nil {
		saveErrorInfo(c, err, errCode)
		return
	}

	db := GetDB()
	_, err = db.Exec("DELETE FROM recurring WHERE id=$1", recurring.ID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.Status(200)
}
