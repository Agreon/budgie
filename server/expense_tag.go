package main

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var expenseTagTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS expense_tag (
	expense_id uuid,
	tag_id uuid,
	created_at timestamp with time zone
)`

type ExpenseTag struct {
	ExpenseID string    `db:"expense_id" json:"expense_id"`
	TagID     string    `db:"tag_id" json:"tag_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type ExpenseTagOutput struct {
	TagID   string `db:"id" json:"tag_id"`
	TagName string `db:"name" json:"tag_name"`
}

func insertTagsOfExpense(c *gin.Context, tagIDs *[]string, expenseID string) (error, int) {
	err, errCode := checkIfTagsExist(c, tagIDs)
	if err != nil {
		return err, errCode
	}

	db := GetDB()
	for _, tagID := range *tagIDs {
		_, err = db.Exec("INSERT INTO expense_tag VALUES ($1, $2, now())", expenseID, tagID)
		if err != nil {
			return err, 500
		}
	}

	return nil, 200
}

func checkIfTagsExist(c *gin.Context, tagIDs *[]string) (error, int) {
	tags := []Tag{}
	userID := c.MustGet("userID")
	var err error

	/* check if tag IDs are a uuid */
	for _, tagID := range *tagIDs {
		if _, err = uuid.Parse(tagID); err != nil {
			return err, 400
		}
	}

	db := GetDB()

	query, args, err := sqlx.In("SELECT * FROM tag WHERE user_id=(?) AND id IN (?) ", userID, *tagIDs)
	if err != nil {
		return err, 500
	}

	query = db.Rebind(query)

	err = db.Select(&tags, query, args...)
	if err != nil {
		return err, 500
	}

	if len(tags) != len(*tagIDs) {
		return errors.New("Tag does not exist or does not belong to this user"), 400
	}

	return nil, 200
}

func getTagsOfExpense(c *gin.Context, expenseID string) ([]ExpenseTagOutput, error, int) {
	tags := []ExpenseTagOutput{}

	db := GetDB()
	err := db.Select(&tags, "SELECT id, name FROM tag LEFT JOIN expense_tag ON expense_tag.tag_id = tag.id WHERE expense_tag.expense_id=$1", expenseID)
	if err != nil {
		return tags, err, 500
	}

	return tags, err, 200
}

func updateTagsOfExpense(c *gin.Context, tagIDs *[]string, expenseID string) (error, int) {
	err, errCode := checkIfTagsExist(c, tagIDs)
	if err != nil {
		return err, errCode
	}

	err, errCode = deleteTagsOfExpense(c, expenseID)
	if err != nil {
		return err, errCode
	}

	db := GetDB()
	for _, tagID := range *tagIDs {
		_, err = db.Exec("INSERT INTO expense_tag VALUES ($1, $2, now())", expenseID, tagID)
		if err != nil {
			return err, 500
		}
	}

	return err, 200
}

func deleteTagsOfExpense(c *gin.Context, expenseID string) (error, int) {
	db := GetDB()
	_, err := db.Exec("DELETE FROM expense_tag WHERE expense_id=$1", expenseID)
	if err != nil {
		return err, 500
	}

	return err, 200
}
