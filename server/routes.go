package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func insertExpense(c *gin.Context) {
	tokenInput := c.GetHeader("token")

	userID, tokenIsValid := checkTokenIsValid(tokenInput)

	if tokenIsValid {
		var newExpense ExpenseInput
		c.BindJSON(&newExpense)

		fmt.Printf("token is valid -> data: %v, bla: %v, cost: %v, date: %v, userID: %v\n", newExpense.Name, newExpense.Category, newExpense.Costs, newExpense.Date, userID)
		db := GetDB()
		tx := db.MustBegin()
		tx.MustExec("INSERT INTO expense VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), now())", newExpense.Name, newExpense.Category, newExpense.Costs, userID, newExpense.Date)
		tx.Commit()
		fmt.Printf("URL to store: %v, bla: %v, cost: %v, date: %v\n", newExpense.Name, newExpense.Category, newExpense.Costs, newExpense.Date)

		/* return input */
		c.JSON(200, newExpense)
	} else {
		c.AbortWithStatus(401)
	}
}

func listExpenses(c *gin.Context) {
	tokenInput := c.GetHeader("token")

	userID, tokenIsValid := checkTokenIsValid(tokenInput)

	if tokenIsValid {
		db := GetDB()
		expenses := []Expense{}
		err := db.Select(&expenses, "SELECT * FROM expense WHERE user_id=$1 ORDER BY created_at DESC", userID)

		if err != nil {
			log.Fatalln(err)
		}

		c.JSON(200, expenses)
	} else {
		c.AbortWithStatus(401)
	}
	//c.JSON(200, gin.H{
	//	"message": jason.Email,
	//	"bla":     jason.FirstName,
	//})
}

func login(c *gin.Context) {

	userNameInput := c.Query("name")
	passwordInput := c.Query("pw")

	db := GetDB()
	userInDatabase := User{}
	err := db.Get(&userInDatabase, "SELECT * FROM users WHERE user_name=$1", userNameInput)
	if err != nil {
		log.Fatalln(err)
	}

	if bcrypt.CompareHashAndPassword([]byte(userInDatabase.Password), []byte(passwordInput)) == nil {
		/* get token and return it */
		token := getToken(userInDatabase.ID)
		c.JSON(200, gin.H{
			"token": token,
		})
		//tx.MustExec("UPDATE users SET token=$1 WHERE user_name=$2", token, userDatabase.UserName)
	} else {
		c.AbortWithStatus(401)
	}
}
