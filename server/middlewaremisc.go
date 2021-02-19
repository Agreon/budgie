package main

import (
	"log"

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
