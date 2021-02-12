package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	loadDataFromEnv()

	db := GetDB()

	db.MustExec(schema)

	tx := db.MustBegin()
	//tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($2, $1, $3)", "Jason", "Moiron", "jmoiron@jmoiron.net")
	//tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($1, $2, $3)", "John", "Doe", "johndoeDNE@gmail.net")
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), $6)", "Snäckies", "Food", "14.56", "12ca8358-756a-43e2-bc47-1eb515f224d5", "'1997-01-31 09:26:56.66 +02:00'", "'2020-01-16 8:00:00 US/Pacific'")
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), $6)", "Unterhosen", "Clothes", "2.00", "1428601f-3bb4-4c51-b9e3-fef560eee979", "'1999-01-15 8:00:00 US/Pacific'", "'2020-01-16 8:00:00 US/Pacific'")

	// pwHash1, _ := bcrypt.GenerateFromPassword([]byte("1234"), 10)
	//pwHash2, _ := bcrypt.GenerateFromPassword([]byte("asdf"), 10)
	//
	// tx.MustExec("INSERT INTO users VALUES (uuid_generate_v4(), $1, $2, now(), now())", "Daniel", pwHash1)
	//tx.MustExec("INSERT INTO users VALUES (uuid_generate_v4(), $1, $2, now(), now())", "Bex", pwHash2)

	// Named queries can use structs, so if you have an existing struct (i.e. person := &Person{}) that you have populated, you can pass it in as &person
	//tx.NamedExec("INSERT INTO person (first_name, last_name, email) VALUES (:first_name, :last_name, :email)", &Person{"Jane", "Citizen", "jane.citzen@example.com"})
	tx.Commit()

	// jason := Person{}
	// err := db.Get(&jason, "SELECT * FROM person WHERE first_name=$1", "Jason")

	// if err != nil {
	// 	log.Fatalln(err)
	// }

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AddAllowHeaders("token")

	r.Use(cors.New(corsConfig))

	useAuthentification := r.Group("/")

	useAuthentification.Use(authentification())
	{
		useAuthentification.POST("/expense", insertExpense)

		useAuthentification.GET("/expense", listExpenses)

		useAuthentification.GET("/expense/:id", listSingleExpense)

		useAuthentification.PUT("/expense/:id", updateExpense)

		useAuthentification.DELETE("/expense/:id", deleteExpense)
	}

	r.POST("/user", addUser)

	r.POST("/login", login)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
