package main

import (
	"time"
	//"github.com/Rhymond/go-money"
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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS expense (
	id uuid,
	name text,
	category text,
	costs money,
	user_id uuid,
	date timestamp with time zone,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS users (
	id uuid,
	user_name text,
	password text,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)	
`

type Person struct {
	FirstName string `db:"first_name"`
	LastName  string `db:"last_name"`
	Email     string
}

type User struct {
	ID       string `db:"id"`
	UserName string `db:"user_name"`
	Password string `db:"password"`
	// TODO add pw hash
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type ExpenseCategory string

const (
	Food            ExpenseCategory = "Food"
	Clothes                         = "Clothes"
	DinnerOutside                   = "DinnerOutside"
	Rent                            = "Rent"
	Electricity                     = "Electricity"
	GEZ                             = "GEZ"
	Insurance                       = "Insurance"
	Cellphone                       = "Cellphone"
	PublicTransport                 = "PublicTransport"
	Internet                        = "Internet"
	HygieneMedicine                 = "HygieneMedicine"
	LeisureTime                     = "LeisureTime"
	Education                       = "Education"
	Travel                          = "Travel"
	Other                           = "Other"
)

type Expense struct {
	ID        string          `db:"id" json:"id"`
	Name      string          `db:"name" json:"name"`
	Category  ExpenseCategory `db:"category" json:"category"`
	Costs     string          `db:"costs" json:"costs"`
	UserID    string          `db:"user_id"`
	Date      time.Time       `db:"date" json:"date"`
	CreatedAt time.Time       `db:"created_at" json:"created_at"`
	UpdatedAt time.Time       `db:"updated_at" json:"updated_at"`
}

type ExpenseInput struct {
	Name     string          `json:"name" binding:"required"`
	Category ExpenseCategory `json:"category" binding:"required"`
	Cost     string          `json:"cost" binding:"required"`
	Date     string          `json:"date" binding:"required"`
}
