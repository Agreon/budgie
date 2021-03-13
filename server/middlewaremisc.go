package main

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

func validateUUID() gin.HandlerFunc {
	return func(c *gin.Context) {
		uuID := c.Param("id")

		/* check if input is a UUID */
		_, err := uuid.Parse(uuID)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return
		}
		c.Set("entityID", uuID)

		c.Next()
	}
}

func validatePageInput() gin.HandlerFunc {
	return func(c *gin.Context) {
		page := c.Query("page")
		pageInt, err := strconv.Atoi(page)
		if err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return
		}
		page = strconv.Itoa(pageInt * pageSize)
		c.Set("page", page)

		c.Next()
	}
}
