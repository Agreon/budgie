package main

import (
	"fmt"
	"log"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	db, err := sqlx.Connect("postgres", "user=postgres dbname=budgie password=postgres sslmode=disable")
	if err != nil {
		log.Fatalln(err)
	}

	db.MustExec(schema)

	tx := db.MustBegin()
	tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($2, $1, $3)", "Jason", "Moiron", "jmoiron@jmoiron.net")
	tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($1, $2, $3)", "John", "Doe", "johndoeDNE@gmail.net")
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, now(), $5)", "Snäckies", "Food", "14.56", "'1997-01-31 09:26:56.66 +02:00'", "'2020-01-16 8:00:00 US/Pacific'")
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, now(), $5)", "Unterhosen", "Clothes", "2.00", "'1999-01-15 8:00:00 US/Pacific'", "'2020-01-16 8:00:00 US/Pacific'")
	tx.MustExec("INSERT INTO place (country, city, telcode) VALUES ($1, $2, $3)", "United States", "New York", "1")
	tx.MustExec("INSERT INTO place (country, telcode) VALUES ($1, $2)", "Hong Kong", "852")
	tx.MustExec("INSERT INTO place (country, telcode) VALUES ($1, $2)", "Singapore", "65")
	// Named queries can use structs, so if you have an existing struct (i.e. person := &Person{}) that you have populated, you can pass it in as &person
	tx.NamedExec("INSERT INTO person (first_name, last_name, email) VALUES (:first_name, :last_name, :email)", &Person{"Jane", "Citizen", "jane.citzen@example.com"})
	tx.Commit()

	jason := Person{}
	err = db.Get(&jason, "SELECT * FROM person WHERE first_name=$1", "Jason")

	expenses := []Expense{}
	err = db.Select(&expenses, "SELECT * FROM expense ORDER BY created_at DESC")

	//test := []string{}
	//err = db.Select(&test, "SELECT costs FROM expense ")
	//fmt.Println(test[0])
	fmt.Println(expenses[0].ID)
	//food := Expense{}
	//err = db.Get(&food, "SELECT * FROM expense WHERE type=$1", "Food")

	r := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AddAllowMethods("GET")

	r.Use(cors.New(corsConfig))

	r.GET("/expense", func(c *gin.Context) {

		c.JSON(200, expenses)
		//c.JSON(200, gin.H{
		//	"message": jason.Email,
		//	"bla":     jason.FirstName,
		//})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
