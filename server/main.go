package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	loadDataFromEnv()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AddAllowHeaders("token")

	db := GetDB()

	db.MustExec(expenseTable)
	db.MustExec(userTable)
	db.MustExec(tagTable)

	tx := db.MustBegin()
	tx.Commit()

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.Use(cors.New(corsConfig))

	useAuthentication := r.Group("/")

	useAuthentication.Use(authentication())
	{
		useAuthentication.POST("/expense", insertExpense)

		useAuthentication.GET("/expense", listExpenses)

		useAuthentication.GET("/expense/:id", validateUUID(), listSingleExpense)

		useAuthentication.PUT("/expense/:id", validateUUID(), updateExpense)

		useAuthentication.DELETE("/expense/:id", validateUUID(), deleteExpense)

		useAuthentication.POST("/tag", insertTag)

		useAuthentication.GET("/tag", listTags)

		useAuthentication.PUT("/tag/:id", validateUUID(), updateTag)
	}

	r.POST("/user", addUser)

	r.POST("/login", login)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
