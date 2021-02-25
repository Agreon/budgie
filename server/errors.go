package main

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

func errorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("ErrorMessage", nil)
		c.Set("ErrorCode", "200")
		c.Next()
		errMessage := c.MustGet("ErrorMessage")
		errCodeInterface := c.MustGet("ErrorCode")

		if errMessage == nil {
			return /* everthing was OK */
		}
		errCodeString := errCodeInterface.(string)
		errCode, _ := strconv.Atoi(errCodeString)

		log.Println("This is your error handler. Error Code: ", errCode)
		log.Println(errMessage)
		c.AbortWithStatus(errCode)
	}
}

func saveErrorInfo(c *gin.Context, errMessage error, errCode int) {
	log.Println("Set this error: ", errMessage)
	c.Set("ErrorMessage", errMessage)
	c.Set("ErrorCode", strconv.Itoa(errCode))
}
