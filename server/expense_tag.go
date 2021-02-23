package main

import (
	"errors"
	"log"
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

func insertTagsOfExpense(c *gin.Context, tagIDs *[]string, expenseID string) error {
	err := checkIfTagsExist(c, tagIDs)
	if err != nil {
		// TODO add error handler
		return err
	}

	db := GetDB()
	/* only start inserting data if tags exist */
	for _, tagID := range *tagIDs {
		_, err = db.Exec("INSERT INTO expense_tag VALUES ($1, $2, now())", expenseID, tagID)

		/* if there is a database error */
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(500)
			return err
		}
	}

	return err
}

func checkIfTagsExist(c *gin.Context, tagIDs *[]string) error {
	tags := []Tag{}
	userID := c.MustGet("userID")
	var err error

	for _, tagID := range *tagIDs {
		/* check if tag ID is a uuid */
		if _, err = uuid.Parse(tagID); err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return err
		}
	}

	db := GetDB()

	query, args, err := sqlx.In("SELECT * FROM tag WHERE user_id=(?) and id IN (?) ", userID, *tagIDs)
	if err != nil {
		//log.Println(err)
		//c.AbortWithStatus(500)
		return err
	}

	query = db.Rebind(query)

	err = db.Select(&tags, query, args...)
	if err != nil {
		//log.Println(err)
		return err
	}

	if len(tags) != len(*tagIDs) {
		//log.Println(errors.New("Tag does not exist or does not belong to this user"))
		//c.AbortWithStatus(400)
		return errors.New("Tag does not exist or does not belong to this user")
	}

	return nil
}

func getTagsOfExpense(c *gin.Context, expenseID string) ([]ExpenseTagOutput, error) {
	tags := []ExpenseTagOutput{}

	db := GetDB()
	err := db.Select(&tags, "SELECT id, name FROM tag LEFT JOIN expense_tag ON expense_tag.tag_id = tag.id WHERE expense_tag.expense_id=$1", expenseID)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return tags, err
	}

	return tags, err
}

func updateTagsOfExpense(c *gin.Context, tagIDs *[]string, expenseID string) error {
	err := checkIfTagsExist(c, tagIDs)
	if err != nil {
		// TODO add error handler
		return err
	}

	err = deleteTagsOfExpense(c, expenseID)
	if err != nil {
		return err // TODO error handling
	}

	db := GetDB()
	/* only start inserting data if tags exist */
	for _, tagID := range *tagIDs {
		_, err = db.Exec("INSERT INTO expense_tag VALUES ($1, $2, now())", expenseID, tagID)

		/* if there is a database error */
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(500)
			return err
		}
	}

	return err
}

func deleteTagsOfExpense(c *gin.Context, expenseID string) error {
	db := GetDB()
	_, err := db.Exec("DELETE FROM expense_tag WHERE expense_id=$1", expenseID)

	/* if there is a database error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
	}

	return err
}
