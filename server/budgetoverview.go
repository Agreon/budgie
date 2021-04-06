package main

import (
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ExpenseByCategory struct {
	Category   string `db:"category" json:"category"`
	TotalCosts string `db:"total" json:"total_costs"`
}

type ExpenseByTag struct {
	Tag        string `db:"tag" json:"category"`
	TotalCosts string `db:"total" json:"total_costs"`
}

type BudgetOverview struct {
	TotalExpense      string              `json:"total_expense"`
	ExpenseByCategory []ExpenseByCategory `json:"expense_by_category"`
	ExpenseByTag      []ExpenseByTag      `json:"expense_by_tag"`
	SavingsRate       string              `json:"savings_rate"`
	TotalIncome       string              `json:"total_income"`
}

func getBudgetOverview(c *gin.Context) {
	db := GetDB()
	userID := c.MustGet("userID")
	var budgetOverview BudgetOverview

	err := db.Get(&budgetOverview.TotalExpense, "SELECT COALESCE(SUM(costs),0) AS total FROM expense WHERE user_id=$1", userID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	totalExpense, _ := strconv.ParseFloat(budgetOverview.TotalExpense, 64)

	err = db.Select(&budgetOverview.ExpenseByCategory, "SELECT category, COALESCE(SUM(costs),0) AS total FROM expense WHERE user_id=$1 GROUP BY category ORDER BY total", userID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	// TODO join tag - expense_tag - expense
	//err = db.Select(&budgetOverview.ExpenseByTag, "SELECT tag, COALESCE(SUM(costs),0) AS total FROM expense WHERE user_id=$1 GROUP BY tag ORDER BY total", userID)
	//if err != nil {
	//	saveErrorInfo(c, err, 500)
	//	return
	//}

	err = db.Get(&budgetOverview.TotalIncome, "SELECT COALESCE(SUM(costs),0) AS total FROM income WHERE user_id=$1", userID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	totalIncome, _ := strconv.ParseFloat(budgetOverview.TotalIncome, 64)

	savingsRate := 100 - totalExpense*100/totalIncome
	budgetOverview.SavingsRate = fmt.Sprintf("%.2f %%", savingsRate)

	c.JSON(200, budgetOverview)
}
