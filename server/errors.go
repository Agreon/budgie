package main

import (
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

//type appError struct {
//	Error   error
//	Message string // TODO: do we need both error and message?
//	Code    int
//}
//
//type errorHandler func(c *gin.Context) (*gin.Context, *appError)
//
//func (fn errorHandler) EvalRouteErrors() {
//	if c, e := fn(); e != nil { // e is *appError, not os.Error.
//		log.Println(e.Error)
//		c.AbortWithStatus(e.Code)
//	}
//}

type appError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func errorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("Before next")
		c.Next()
		errMessage := c.MustGet("ErrorMessage")
		errCodeInterface := c.MustGet("ErrorCode")

		errCodeString := errCodeInterface.(string)
		errCode, _ := strconv.Atoi(errCodeString)

		log.Println("This is your error handler. Error Code: ", errCode)
		log.Println(errMessage)
		c.AbortWithStatus(errCode)
	}
}

func saveErrorInfo(c *gin.Context, errMessage error, errCode int) {
	c.Set("ErrorMessage", errMessage)
	c.Set("ErrorCode", strconv.Itoa(errCode))
}
