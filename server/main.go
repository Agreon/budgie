package main

import (
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	db := GetDB()

	db.MustExec(schema)

	tx := db.MustBegin()
	tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($2, $1, $3)", "Jason", "Moiron", "jmoiron@jmoiron.net")
	tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($1, $2, $3)", "John", "Doe", "johndoeDNE@gmail.net")
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), $6)", "Snäckies", "Food", "14.56", "576c37f5-f37e-4e3c-9132-06289a0d4834", "'1997-01-31 09:26:56.66 +02:00'", "'2020-01-16 8:00:00 US/Pacific'")
	tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), $6)", "Unterhosen", "Clothes", "2.00", "576c37f5-f37e-4e3c-9132-06289a0d4834", "'1999-01-15 8:00:00 US/Pacific'", "'2020-01-16 8:00:00 US/Pacific'")

	//pwHash1, _ := bcrypt.GenerateFromPassword([]byte("1234"), 14)
	//pwHash2, _ := bcrypt.GenerateFromPassword([]byte("asdf"), 14)
	//
	//tx.MustExec("INSERT INTO users VALUES (uuid_generate_v4(), $1, $2, now(), now())", "Daniel", pwHash1)
	//tx.MustExec("INSERT INTO users VALUES (uuid_generate_v4(), $1, $2, now(), now())", "Bex", pwHash2)

	tx.MustExec("INSERT INTO place (country, city, telcode) VALUES ($1, $2, $3)", "United States", "New York", "1")
	tx.MustExec("INSERT INTO place (country, telcode) VALUES ($1, $2)", "Hong Kong", "852")
	tx.MustExec("INSERT INTO place (country, telcode) VALUES ($1, $2)", "Singapore", "65")
	// Named queries can use structs, so if you have an existing struct (i.e. person := &Person{}) that you have populated, you can pass it in as &person
	tx.NamedExec("INSERT INTO person (first_name, last_name, email) VALUES (:first_name, :last_name, :email)", &Person{"Jane", "Citizen", "jane.citzen@example.com"})
	tx.Commit()

	jason := Person{}
	err := db.Get(&jason, "SELECT * FROM person WHERE first_name=$1", "Jason")

	if err != nil {
		log.Fatalln(err)
	}

	//test := []string{}
	//err = db.Select(&test, "SELECT costs FROM expense ")
	//fmt.Println(test[0])
	//fmt.Println(expenses[0].ID)
	//food := Expense{}
	//err = db.Get(&food, "SELECT * FROM expense WHERE type=$1", "Food")

	r := gin.Default()

	r.GET("/expense", listExpenses)

	r.POST("/expense", insertExpense)

	r.POST("/login", login)

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
