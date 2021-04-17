package main

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	JWTSecret            string
	JWTExpirationTimeInS int
	DatabaseURL          string
}

var config Config

func loadDataFromEnv() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	config.JWTSecret = getEnvEntry("JWT_SECRET")
	config.DatabaseURL = getEnvEntry("DATABASE_URL")
	config.JWTExpirationTimeInS, _ = strconv.Atoi(getEnvEntry("JWT_EXPIRATION_TIME_IN_S"))
}

func getEnvEntry(key string) string {
	configData := os.Getenv(key)
	if configData == "" {
		log.Fatalf("Key missing: %s", key)
	}
	return configData
}
