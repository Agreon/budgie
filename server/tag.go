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
	ID        string    `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	UserID    string    `db:"user_id" json:"user_id"`
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

type TagOutputWithFrequency struct {
	Name      string `db:"name" json:"name"`
	ID        string `db:"id" json:"id"`
	Frequency int    `db:"frequency" json:"frequency"`
}

type TagListOutput struct {
	Data    []TagOutputWithFrequency `json:"data"`
	Entries int                      `json:"numberOfEntries"`
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

	page := c.MustGet("page")
	err := db.Select(&tags.Data, `		
		SELECT
			COUNT(tag_frequency.expense_id) AS frequency,
			tag_frequency.id AS id,
			tag_frequency.name AS name
		FROM (
			SELECT 
				tag.id,
				tag.name,
				expense_tag.expense_id
			FROM tag
			FULL JOIN expense_tag
			ON expense_tag.tag_id = tag.id
			WHERE user_id=$1
		) AS tag_frequency
		GROUP BY tag_frequency.id, tag_frequency.name
		ORDER BY frequency DESC
		LIMIT $2 OFFSET $3
	`, userID, pageSize, page)
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
		tags.Data = []TagOutputWithFrequency{}
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
