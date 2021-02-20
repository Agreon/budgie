package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

	/* get userID from middleware */
	userID := c.MustGet("userID")

	db := GetDB()
	/* check if tags exist and belong to user */
	for _, tagID := range *tagIDs {

		err = db.Get(&tags, "SELECT * FROM tag WHERE id=$1 AND user_id=$2", tagID, userID)

		if err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return err
		}
	}

	/* only start inserting data if tags exist */
	for _, tagID := range *tagIDs {
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

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return tags, err
	}

	return tags, err
}

func updateTagsOfExpense(c *gin.Context, tagIDs *[]string, expenseID string) error {
	tags := Tag{}
	var err error

	/* get userID from middleware */
	userID := c.MustGet("userID")

	log.Println("This are the update tags: ", *tagIDs)
	db := GetDB()
	/* check if tags exist and belong to user */
	for _, tagID := range *tagIDs {
		/* check if tag ID is a uuid */
		if _, err = uuid.Parse(tagID); err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return err
		}

		err = db.Get(&tags, "SELECT * FROM tag WHERE id=$1 AND user_id=$2", tagID, userID)

		if err != nil {
			log.Println("Tag does not exist or does not belong to this user.")
			c.AbortWithStatus(400)
			return err
		}
	}

	/* get tag IDs connected to this expense */
	expenseTag := []ExpenseTag{}
	/* only start inserting data if tags exist */
	for _, tagID := range *tagIDs {
		/* check if this expense tag already exists */
		err = db.Select(&expenseTag, "SELECT * FROM expense_tag WHERE expense_id=$1 AND tag_id=$2", expenseID, tagID)

		if len(expenseTag) == 0 {
			_, err = db.Exec("INSERT INTO expense_tag VALUES ($1, $2, now(), now())", expenseID, tagID)

			/* if there is a database error */
			if err != nil {
				log.Println(err)
				c.AbortWithStatus(500)
				return err
			}
		}
	}

	err = db.Select(&expenseTag, "SELECT * FROM expense_tag WHERE expense_id=$1", expenseID)
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return err
	}
	var deleteExpenseTag bool

	log.Println("This tag IDs are in expenseTag database: ", expenseTag)
	log.Println("This are the update tags: ", *tagIDs)
	/* delete tags */
	for _, tagIDInExpense := range expenseTag {
		deleteExpenseTag = true
		for _, tagID := range *tagIDs {
			if tagID == tagIDInExpense.TagID {
				deleteExpenseTag = false
				log.Println("This tag ID shall be deleted: ", tagIDInExpense.TagID)
			}
		}
		if deleteExpenseTag {
			_, err = db.Exec("DELETE FROM expense_tag WHERE expense_id=$1 AND tag_id=$2", expenseID, tagIDInExpense.TagID)

			/* if there is a database error */
			if err != nil {
				log.Println(err)
				c.AbortWithStatus(500)
				return err
			}
		}
	}

	return err
}
