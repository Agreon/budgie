package main

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ExpenseByCategory struct {
	Category       string `db:"category" json:"category"`
	PercentageOnce string `db:"percentage_once" json:"percentageOfNonRecurringExpenses"`
	PercentageAll  string `db:"percentage_all" json:"percentageOfAllExpenses"`
	TotalCosts     string `db:"total" json:"totalCosts"`
}

type ExpenseByTag struct {
	Tag            string `db:"tag" json:"tag"`
	PercentageOnce string `db:"percentage_once" json:"percentageOfNonRecurringExpenses"`
	PercentageAll  string `db:"percentage_all" json:"percentageOfAllExpenses"`
	TotalCosts     string `db:"total" json:"totalCosts"`
}

type BudgetOverview struct {
	ExpensesRecurring string              `db:"expense_recurring" json:"totalExpenseRecurring"`
	ExpensesOnce      string              `db:"expense_once" json:"totalExpenseOnce"`
	TotalExpense      string              `db:"expense_total" json:"totalExpense"`
	ExpenseByCategory []ExpenseByCategory `json:"expenseByCategory"`
	ExpenseByTag      []ExpenseByTag      `json:"expenseByTag"`
	SavingsRate       string              `db:"savings_rate" json:"savingsRate"`
	IncomeRecurring   string              `db:"income_recurring" json:"totalIncomeRecurring"`
	IncomeOnce        string              `db:"income_once" json:"totalIncomeOnce"`
	TotalIncome       string              `db:"income_total" json:"totalIncome"`
}

type OverviewInput struct {
	StartDate string `json:"startDate" binding:"required"`
	EndDate   string `json:"endDate" binding:"required"`
}


/**
TODO:
	COALESCE bei summe notwendig?!
	and überall groß
	multiline in go
	ordering von parametern
	Sortierung (ASC/DESC)
**/
func getBudgetOverview(c *gin.Context) {
	var overviewInput OverviewInput
	// TODO: As query parameter
	if err := c.BindJSON(&overviewInput); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}
	// TODO validate dates

	db := GetDB()
	userID := c.MustGet("userID")
	var budgetOverview BudgetOverview

	//err := db.Get(&budgetOverview, "WITH expense_sum as (SELECT COALESCE(SUM(costs),0) AS expense_total FROM expense WHERE user_id=$1), income_sum as (SELECT COALESCE(SUM(costs),0) AS income_total FROM income WHERE user_id=$1), savings_rate as (select 100 - (expense_total from expense_sum)*100 / (income_total from income_sum) ) SELECT (select expense_total from expense_sum), (select income_total from income_sum), (select savings_rate)", userID)
	//err = db.Get(&budgetOverview, "WITH expense_sum as (SELECT COALESCE(SUM(costs),0) AS expense_total FROM expense WHERE user_id=$1 AND date>=$2::date and date<$3::date), income_sum as (SELECT COALESCE(SUM(costs),0) AS income_total FROM income WHERE user_id=$1 AND date>=$2::date and date<$3::date), savings_rate as (SELECT income_total AS rate FROM income_sum) SELECT (select expense_total from expense_sum), (select income_total from income_sum), 100-div((select expense_total*100 from expense_sum), (select income_total from income_sum)) as savings_rate", userID, overviewInput.StartDate, overviewInput.EndDate)

	err := db.Get(&budgetOverview.ExpensesOnce, "SELECT COALESCE(SUM(costs),0) AS expense_once FROM expense WHERE user_id=$1 AND date>=$2::date and date<$3::date", userID, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	err = db.Get(&budgetOverview.IncomeOnce, "SELECT COALESCE(SUM(costs),0) AS income_once FROM income WHERE user_id=$1 AND date>=$2::date and date<$3::date", userID, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseByCategory, "SELECT category, COALESCE(SUM(costs),0) AS total, ROUND(COALESCE(SUM(costs),0)*100 / $2) AS percentage_all, ROUND(COALESCE(SUM(costs),0)*100 / $3) AS percentage_once FROM expense WHERE user_id=$1 AND date>=$4::date and date<$5::date GROUP BY category ORDER BY total", userID, "50000", budgetOverview.ExpensesOnce, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseByTag, `
		SELECT
			tag_name_costs.tag AS tag,
			COALESCE(SUM(tag_name_costs.costs),0) AS total,
			ROUND(COALESCE(SUM(tag_name_costs.costs),0)*100 / $2) AS percentage_all,
			ROUND(COALESCE(SUM(tag_name_costs.costs),0)*100 / $3) AS percentage_once
		FROM (
			SELECT
				tag_id_costs.costs AS costs,
				tag.name AS tag
			FROM (
				SELECT
					expense.costs AS costs,
					expense_tag.tag_id AS id
				FROM expense, expense_tag
				WHERE
					expense.id = expense_tag.expense_id
					AND user_id=$1
					AND date>=$4::date
					AND date<$5::date
			) AS tag_id_costs, tag
			WHERE
				tag_id_costs.id = tag.id
		) AS tag_name_costs
		GROUP BY tag_name_costs.tag
		ORDER BY total
		`, userID, "50000", budgetOverview.ExpensesOnce, overviewInput.StartDate, overviewInput.EndDate)
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
