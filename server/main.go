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
	corsConfig.AddAllowHeaders("token")

	db := GetDB()

	db.MustExec(expenseTable)
	db.MustExec(userTable)
	db.MustExec(tagTable)
	db.MustExec(expenseTagTable)
	db.MustExec(incomeTable)

	tx := db.MustBegin()
	tx.Commit()

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.Use(cors.New(corsConfig))

	useAuthentication := r.Group("/")

	useAuthentication.Use(authentication())
	{
		useAuthentication.POST("/expense", errorHandler(), insertExpense)

		useAuthentication.GET("/expense", errorHandler(), listExpenses)

		useAuthentication.GET("/expense/:id", validateUUID(), errorHandler(), listSingleExpense)

		useAuthentication.PUT("/expense/:id", validateUUID(), errorHandler(), updateExpense)

		useAuthentication.DELETE("/expense/:id", validateUUID(), errorHandler(), deleteExpense)

		useAuthentication.POST("/income", errorHandler(), insertIncome)

		useAuthentication.GET("/income", errorHandler(), listIncomes)

		useAuthentication.GET("/income/:id", validateUUID(), errorHandler(), listSingleIncome)

		useAuthentication.PUT("/income/:id", validateUUID(), errorHandler(), updateIncome)

		useAuthentication.DELETE("/income/:id", validateUUID(), errorHandler(), deleteIncome)

		useAuthentication.POST("/tag", errorHandler(), insertTag)

		useAuthentication.GET("/tag", errorHandler(), listTags)

		useAuthentication.PUT("/tag/:id", validateUUID(), errorHandler(), updateTag)

		useAuthentication.DELETE("/tag/:id", validateUUID(), errorHandler(), deleteTag)

		useAuthentication.GET("/overview", errorHandler(), getBudgetOverview)
	}

	r.POST("/user", errorHandler(), addUser)

	r.POST("/login", errorHandler(), login)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
