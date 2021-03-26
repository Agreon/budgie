package main

import (
	"errors"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
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

type CostsInput struct {
	Costs string `json:"costs" binding:"required"`
}

func validateCosts() gin.HandlerFunc {
	return func(c *gin.Context) {
		var Costs CostsInput
		if err := c.ShouldBindBodyWith(&Costs, binding.JSON); err != nil {
			log.Println(err)
			c.AbortWithStatus(400)
			return
		}
		costs, err := strconv.ParseFloat(Costs.Costs, 64)
		if err != nil && err.Error() != "EOF" {
			log.Println(err)
			c.AbortWithStatus(400)
			return
		}

		if costs < 0. {
			log.Println(errors.New("Costs can't be negative!"))
			c.AbortWithStatus(400)
			return
		}
		c.Next()
	}
}
