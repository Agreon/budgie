package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

var expenseTagTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS expense_tag (
	expense_id uuid,
	tag_id uuid,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)`

type ExpenseTag struct {
	ExpenseID string    `db:"expense_id" json:"expense_id"`
	TagID     string    `db:"tag_id" json:"tag_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type ExpenseTagOutput struct {
	TagID   string `db:"id" json:"tag_id"`
	TagName string `db:"name" json:"tag_name"`
}

func insertTagsOfExpense(c *gin.Context, tagIDs *[]string, expenseID string) error {
	tags := Tag{}
	var err error

	db := GetDB()
	/* check if tags exist */
	for _, tagID := range *tagIDs {

		log.Println("Current tag ID: ", tagID)
		err = db.Get(&tags, "SELECT * FROM tag WHERE id=$1", tagID)

		if err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return err
		}
		// err = db.Select(&tags, "SELECT * FROM expense_tag WHERE expense_id=$1 AND tag_id=$2", expenseID, tagID)
		//
		// if err == nil {
		// log.Println(err)
		// c.AbortWithStatus(400)
		// return err
		// }
	}

	/* only start inserting data if tags exist */
	for _, tagID := range *tagIDs {
		log.Println("Insert - Current tag ID: ", tagID)
		_, err = db.Exec("INSERT INTO expense_tag VALUES ($1, $2, now(), now())", expenseID, tagID)

		/* if there is a database error */
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(500)
			return err
		}
	}

	return err
}

func getTagsOfExpense(c *gin.Context, expenseID string) ([]ExpenseTagOutput, error) {
	tags := []ExpenseTagOutput{}

	db := GetDB()
	err := db.Select(&tags, "SELECT id, name FROM tag LEFT JOIN expense_tag ON expense_tag.tag_id = tag.id WHERE expense_tag.expense_id=$1", expenseID)

	log.Println("Number of tags found: ", len(tags))
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return tags, err
	}

	return tags, err
}
