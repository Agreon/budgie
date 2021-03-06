package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var pageSize int = 20

func main() {
	loadDataFromEnv()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AddAllowHeaders("Authorization")

	db := GetDB()

	db.MustExec(expenseTable)
	db.MustExec(userTable)
	db.MustExec(tagTable)
	db.MustExec(expenseTagTable)
	db.MustExec(incomeTable)
	db.MustExec(recurringTable)

	tx := db.MustBegin()
	tx.Commit()

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.Use(cors.New(corsConfig))

	useAuthentication := r.Group("/")

	useAuthentication.Use(authentication())
	{
		useAuthentication.POST("/expense", validateCosts(), errorHandler(), insertExpense)

		useAuthentication.GET("/expense", validatePageInput(), errorHandler(), listExpenses)

		useAuthentication.GET("/expense/:id", validateUUID(), errorHandler(), listSingleExpense)

		useAuthentication.PUT("/expense/:id", validateUUID(), validateCosts(), errorHandler(), updateExpense)

		useAuthentication.DELETE("/expense/:id", validateUUID(), errorHandler(), deleteExpense)

		useAuthentication.POST("/income", validateCosts(), errorHandler(), insertIncome)

		useAuthentication.GET("/income", validatePageInput(), errorHandler(), listIncomes)

		useAuthentication.GET("/income/:id", validateUUID(), errorHandler(), listSingleIncome)

		useAuthentication.PUT("/income/:id", validateUUID(), validateCosts(), errorHandler(), updateIncome)

		useAuthentication.DELETE("/income/:id", validateUUID(), errorHandler(), deleteIncome)

		useAuthentication.POST("/tag", errorHandler(), insertTag)

		useAuthentication.GET("/tag", validatePageInput(), errorHandler(), listTags)

		useAuthentication.PUT("/tag/:id", validateUUID(), errorHandler(), updateTag)

		useAuthentication.DELETE("/tag/:id", validateUUID(), errorHandler(), deleteTag)

		useAuthentication.GET("/overview", errorHandler(), getBudgetOverview)

		useAuthentication.GET("/recurring", validatePageInput(), errorHandler(), listRecurring)

		useAuthentication.POST("/recurring", validateCosts(), errorHandler(), insertRecurring)

		useAuthentication.GET("/recurring/:id", validateUUID(), errorHandler(), listSingleRecurring)

		useAuthentication.PUT("/recurring/:id", validateUUID(), validateCosts(), errorHandler(), updateRecurring)

		useAuthentication.POST("/recurring-item/:id", validateUUID(), validateCosts(), errorHandler(), addRecurringHistoryItem)

		useAuthentication.DELETE("/recurring/:id", validateUUID(), errorHandler(), deleteRecurring)
	}

	r.POST("/user", errorHandler(), addUser)

	r.POST("/login", errorHandler(), login)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
