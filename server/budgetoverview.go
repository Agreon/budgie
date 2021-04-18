package main

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ExpenseByCategory struct {
	Category       string `db:"category" json:"category"`
	PercentageOnce string `db:"percentage_once" json:"percentage_of_non_recurring_expenses"`
	PercentageAll  string `db:"percentage_all" json:"percentage_of_all_expenses"`
	TotalCosts     string `db:"total" json:"total_costs"`
}

type ExpenseByTag struct {
	Tag            string `db:"tag" json:"tag"`
	PercentageOnce string `db:"percentage_once" json:"percentage_of_non_recurring_expenses"`
	PercentageAll  string `db:"percentage_all" json:"percentage_of_all_expenses"`
	TotalCosts     string `db:"total" json:"total_costs"`
}

type BudgetOverview struct {
	ExpensesRecurring string              `db:"expense_recurring" json:"total_expense_recurring"`
	ExpensesOnce      string              `db:"expense_once" json:"total_expense_once"`
	TotalExpense      string              `db:"expense_total" json:"total_expense"`
	ExpenseByCategory []ExpenseByCategory `json:"expense_by_category"`
	ExpenseByTag      []ExpenseByTag      `json:"expense_by_tag"`
	SavingsRate       string              `db:"savings_rate" json:"savings_rate"`
	IncomeRecurring   string              `db:"income_recurring" json:"total_income_recurring"`
	IncomeOnce        string              `db:"income_once" json:"total_income_once"`
	TotalIncome       string              `db:"income_total" json:"total_income"`
}

func getBudgetOverview(c *gin.Context) {
	db := GetDB()
	userID := c.MustGet("userID")
	var budgetOverview BudgetOverview

	//err := db.Get(&budgetOverview, "WITH expense_sum as (SELECT COALESCE(SUM(costs),0) AS expense_total FROM expense WHERE user_id=$1), income_sum as (SELECT COALESCE(SUM(costs),0) AS income_total FROM income WHERE user_id=$1), savings_rate as (select 100 - (expense_total from expense_sum)*100 / (income_total from income_sum) ) SELECT (select expense_total from expense_sum), (select income_total from income_sum), (select savings_rate)", userID)
	err := db.Get(&budgetOverview, "WITH expense_sum as (SELECT COALESCE(SUM(costs),0) AS expense_total FROM expense WHERE user_id=$1), income_sum as (SELECT COALESCE(SUM(costs),0) AS income_total FROM income WHERE user_id=$1), savings_rate as (SELECT income_total AS rate FROM income_sum) SELECT (select expense_total from expense_sum), (select income_total from income_sum), 100-div((select expense_total*100 from expense_sum), (select income_total from income_sum)) as savings_rate", userID)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseByCategory, "SELECT category, COALESCE(SUM(costs),0) AS total, ROUND(COALESCE(SUM(costs),0)*100 / $2) AS percentage_all, ROUND(COALESCE(SUM(costs),0)*100 / $3) AS percentage_once FROM expense WHERE user_id=$1 GROUP BY category ORDER BY total", userID, "50000", budgetOverview.TotalExpense)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseByTag, "SELECT tag_name_costs.tag, COALESCE(SUM(tag_name_costs.costs),0) AS total, ROUND(COALESCE(SUM(tag_name_costs.costs),0)*100 / $2) AS percentage_all, ROUND(COALESCE(SUM(tag_name_costs.costs),0)*100 / $3) AS percentage_once FROM (SELECT tag_id_costs.costs AS costs, tag.name AS tag FROM (SELECT expense.costs AS costs, expense_tag.tag_id AS id FROM expense, expense_tag WHERE expense.id = expense_tag.expense_id AND user_id=$1) AS tag_id_costs, tag WHERE tag_id_costs.id = tag.id) AS tag_name_costs GROUP BY tag_name_costs.tag ORDER BY total", userID, "50000", budgetOverview.TotalExpense)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	//err = db.Get(&budgetOverview.TotalIncome, "SELECT COALESCE(SUM(costs),0) AS total FROM income WHERE user_id=$1", userID)
	//if err != nil {
	//	saveErrorInfo(c, err, 500)
	//	return
	//}
	//
	//budgetOverview.SavingsRate, err = calc(budgetOverview.TotalExpense, budgetOverview.TotalIncome, calcPercentage)
	//if err != nil {
	//	saveErrorInfo(c, err, 500)
	//	return
	//}
	//budgetOverview.SavingsRate = fmt.Sprintf("%s%%", budgetOverview.SavingsRate)

	c.JSON(200, budgetOverview)
}

type calcFunction func(float64, float64) int

func calc(a string, b string, function calcFunction) (c string, err error) {
	var aNum, bNum float64
	aNum, err = strconv.ParseFloat(a, 64)
	if err != nil {
		return
	}
	bNum, err = strconv.ParseFloat(b, 64)
	if err != nil {
		return
	}
	cInt := function(aNum, bNum)

	c = strconv.Itoa(cInt)

	return
}

func calcPercentage(a float64, b float64) (c int) {
	cFloat := 100 - a*100/b

	c = int(math.Round(cFloat))
	return
}
