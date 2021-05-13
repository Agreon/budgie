package main

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var tagTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tag (
	id uuid UNIQUE,
	name text,
	user_id uuid,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
);

ALTER TABLE tag DROP CONSTRAINT IF EXISTS pk_tag_id;
ALTER TABLE tag
	ADD CONSTRAINT pk_tag_id
	PRIMARY KEY (id);
`

type Tag struct {
	ID        string    `db:"tag_id" json:"id"`
	Name      string    `db:"name" json:"name"`
	UserID    string    `db:"user_id" json:"user_id"`
	ExpenseID string    `db:"expense_id" json:"expense_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type TagInput struct {
	Name string `json:"name" binding:"required"`
}
type TagOutput struct {
	Name string `json:"name"`
	ID   string `json:"id"`
}

type TagListOutput struct {
	Data    []Tag `json:"data"`
	Entries int   `json:"number_of_entries"`
}

func insertTag(c *gin.Context) {
	var newTag TagInput
	err := c.BindJSON(&newTag)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	userID := c.MustGet("userID")

	db := GetDB()

	/* check if tag already exists */
	var tag Tag
	err = db.Get(&tag, "SELECT * FROM tag WHERE name=$1 AND user_id=$2", newTag.Name, userID)
	if err == nil {
		saveErrorInfo(c, errors.New("Tag already exists."), 400)
		return
	}

	/* insert new tag */
	rows, err := db.NamedQuery("INSERT INTO tag VALUES (uuid_generate_v4(), :name, :user_id, now(), now()) RETURNING id",
		map[string]interface{}{
			"name":    newTag.Name,
			"user_id": userID.(string)})
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	/* read back generated tag ID */
	var tagID string
	if rows.Next() {
		rows.Scan(&tagID)
	}

	/* return tag */
	var tagOutput TagOutput
	tagOutput.Name = newTag.Name
	tagOutput.ID = tagID
	c.JSON(200, tagOutput)
}

func listTags(c *gin.Context) {
	db := GetDB()
	tags := TagListOutput{}

	userID := c.MustGet("userID")

	//page := c.MustGet("page")
	//err := db.Select(&tags.Data, "SELECT * FROM tag WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", userID, pageSize, page)
	err := db.Select(&tags.Data,
		//	SELECT
		//		tag_info.tag_id AS tag_id,
		//		tag_info.name AS name,
		//		expense.id AS expense_id
		//	FROM (
		`		
	SELECT
		COUNT(tag_name_costs.id) - 1 AS expense_id,
		tag_name_costs.id AS tag_id,
		tag_name_costs.name AS name
	FROM (
		SELECT
			tag.id AS id,
			tag.name AS name
		FROM expense_tag, tag
		WHERE
			expense_tag.tag_id = tag.id
			AND user_id=$1
	) AS tag_name_costs
	GROUP BY tag_name_costs.id, tag_name_costs.name
	ORDER BY tag_name_costs.name `, userID /*, pageSize, page*/)
	//	) AS tag_info, expense
	//	WHERE
	//	 	tag_info.expense_id = expense.id
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&tags.Entries, "SELECT count(*) FROM tag WHERE user_id=$1", userID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	if len(tags.Data) == 0 {
		tags.Data = []Tag{}
	}

	c.JSON(200, tags)
}

func updateTag(c *gin.Context) {
	tagID := c.MustGet("entityID")

	db := GetDB()
	tag := Tag{}
	err := db.Get(&tag, "SELECT * FROM tag WHERE id=$1", tagID)

	/* check if tag exists */
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	userID := c.MustGet("userID")

	/* check if tag belongs to requesting user */
	if tag.UserID != userID {
		saveErrorInfo(c, errors.New("Tag does not belong to this user!"), 403)
		return
	}

	/* get updated data from body */
	var updateTag TagInput
	err = c.BindJSON(&updateTag)
	if err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	_, err = db.Exec("UPDATE tag SET name=$1, updated_at=now() WHERE id=$2", updateTag.Name, tagID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&tag, "SELECT * FROM tag WHERE id=$1", tagID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.JSON(200, tag)
}

func deleteTag(c *gin.Context) {
	tagID := c.MustGet("entityID")
	db := GetDB()
	tag := Tag{}
	err := db.Get(&tag, "SELECT * FROM tag WHERE id=$1", tagID)

	/* check if tag exists */
	if err != nil {
		saveErrorInfo(c, err, 404)
		return
	}

	userID := c.MustGet("userID")

	/* check if tag belongs to requesting user */
	if tag.UserID != userID {
		saveErrorInfo(c, errors.New("Tag does not belong to this user!"), 403)
		return
	}

	_, err = db.Exec("DELETE FROM tag WHERE id=$1", tagID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	c.Status(200)
}
