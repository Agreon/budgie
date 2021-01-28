package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var schema = `
CREATE TABLE IF NOT EXISTS person (
    first_name text,
    last_name text,
    email text
);

CREATE TABLE IF NOT EXISTS place (
    country text,
    city text NULL,
    telcode integer
);

CREATE TABLE IF NOT EXISTS expense (
	id text,
	name text,
	type text,
	costs text,
	date timestamp with time zone,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
	)`

type Person struct {
	FirstName string `db:"first_name"`
	LastName  string `db:"last_name"`
	Email     string
}

type ExpenseType string

const (
	Food            ExpenseType = "Food"
	Clothes                     = "Clothes"
	DinnerOutside               = "DinnerOutside"
	Rent                        = "Rent"
	Electricity                 = "Electricity"
	GEZ                         = "GEZ"
	Insurance                   = "Insurance"
	Cellphone                   = "Cellphone"
	PublicTransport             = "PublicTransport"
	Internet                    = "Internet"
	HygieneMedicine             = "HygieneMedicine"
	LeisureTime                 = "LeisureTime"
	Education                   = "Education"
	Travel                      = "Travel"
	Other                       = "Other"
)

type Expense struct {
	ID        string      `db:"ID"`
	Name      string      `db:"name"`
	Type      ExpenseType `db:"type"`
	Costs     string      `db:"costs"`
	Time      time.Time   `db:"date"`
	CreatedAt time.Time   `db:"createdAt"`
	UpdatedAt time.Time   `db:"updatedat"`
}

func main() {
	db, err := sqlx.Connect("postgres", "user=postgres dbname=budgie password=postgres sslmode=disable")
	if err != nil {
		log.Fatalln(err)
	}

	db.MustExec(schema)

	tx := db.MustBegin()
	tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($2, $1, $3)", "Jason", "Moiron", "jmoiron@jmoiron.net")
	tx.MustExec("INSERT INTO person (first_name, last_name, email) VALUES ($1, $2, $3)", "John", "Doe", "johndoeDNE@gmail.net")
	tx.MustExec("INSERT INTO place (country, city, telcode) VALUES ($1, $2, $3)", "United States", "New York", "1")
	tx.MustExec("INSERT INTO place (country, telcode) VALUES ($1, $2)", "Hong Kong", "852")
	tx.MustExec("INSERT INTO place (country, telcode) VALUES ($1, $2)", "Singapore", "65")
	// Named queries can use structs, so if you have an existing struct (i.e. person := &Person{}) that you have populated, you can pass it in as &person
	tx.NamedExec("INSERT INTO person (first_name, last_name, email) VALUES (:first_name, :last_name, :email)", &Person{"Jane", "Citizen", "jane.citzen@example.com"})
	tx.Commit()

	jason := Person{}
	err = db.Get(&jason, "SELECT * FROM person WHERE first_name=$1", "Jason")

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {

		c.JSON(200, jason)
		//c.JSON(200, gin.H{
		//	"message": jason.Email,
		//	"bla":     jason.FirstName,
		//})
	})
	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
