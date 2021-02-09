package main

import (
	"log"
	"sync"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var singleton *sqlx.DB

var once sync.Once

func GetDB() *sqlx.DB {
	once.Do(func() {
		var err error
		singleton, err = sqlx.Connect("postgres", "host=db user=postgres dbname=budgie password=postgres sslmode=disable")
		if err != nil {
			log.Fatalln(err)
		}
	})
	return singleton
}
