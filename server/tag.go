package main

import (
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func insertTag(c *gin.Context) {
	var newTag TagInput
	err := c.BindJSON(&newTag)
	if err != nil {
		return
	}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	db := GetDB()

	/* check if tag already exists */
	var tag Tag
	err = db.Get(&tag, "SELECT * FROM tag WHERE name=$1 AND user_id=$2", newTag.Name, userID)
	if err == nil {
		log.Println("Tag already exists.")
		c.AbortWithStatus(400)
		return
	}

	/* insert new tag */
	_, err = db.Exec("INSERT INTO tag VALUES (uuid_generate_v4(), $1, $2, now(), now())", newTag.Name, userID)

	/* if there is a database error */
	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	/* TODO: return new tag entity? */

	/* return input */
	c.JSON(200, newTag)
}

func listTags(c *gin.Context) {
	db := GetDB()
	tags := []Tag{}

	/* get userID from middleware */
	userID := c.MustGet("userID")

	err := db.Select(&tags, "SELECT * FROM tag WHERE user_id=$1 ORDER BY created_at DESC", userID)

	if err != nil {
		log.Println(err)
		c.AbortWithStatus(500)
		return
	}

	c.JSON(200, tags)
}
