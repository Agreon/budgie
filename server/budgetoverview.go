package main

import (
	"errors"
	"fmt"
	"math"
	"sort"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ExpenseByCategory struct {
	Category       string `db:"category" json:"category"`
	PercentageOnce string `db:"percentage_once" json:"percentageOfNonRecurringExpenses"`
	PercentageAll  string `db:"percentage_all" json:"percentageOfAllExpenses"`
	TotalCosts     string `db:"total" json:"totalCosts"`
}

type ExpenseTotalByCategory struct {
	Category      string `db:"category" json:"category"`
	PercentageAll string `db:"percentage_all" json:"percentageOfAllExpenses"`
	TotalCosts    string `db:"total" json:"totalCosts"`
}

type ExpenseByTag struct {
	Tag            string `db:"tag" json:"tag"`
	PercentageOnce string `db:"percentage_once" json:"percentageOfExpensesOnce"`
	PercentageAll  string `db:"percentage_all" json:"percentageOfAllExpenses"`
	TotalCosts     string `db:"total" json:"totalCosts"`
}

type CategoryInformationForCalculation struct {
	Percentage int
	Total      float64
}

type CategoryInformationForCalculationWithKey struct {
	key string
	CategoryInformationForCalculation
}

type BudgetOverview struct {
	ExpensesRecurring     string                   `db:"expense_recurring" json:"totalExpenseRecurring"`
	ExpensesOnce          string                   `db:"expense_once" json:"totalExpenseOnce"`
	TotalExpense          string                   `db:"expense_total" json:"totalExpense"`
	ExpenseOnceByCategory []ExpenseByCategory      `json:"expenseOnceByCategory"`
	ExpenseRecByCategory  []ExpenseByCategory      `json:"expenseRecurringByCategory"`
	ExpenseByCategory     []ExpenseTotalByCategory `json:"expenseByCategory"`
	ExpenseByTag          []ExpenseByTag           `json:"expenseByTag"`
	SavingsRate           string                   `db:"savings_rate" json:"savingsRate"`
	IncomeRecurring       string                   `db:"income_recurring" json:"totalIncomeRecurring"`
	IncomeOnce            string                   `db:"income_once" json:"totalIncomeOnce"`
	TotalIncome           string                   `db:"income_total" json:"totalIncome"`
	AmountSaved           string                   `json:"amountSaved"`
}

type OverviewInput struct {
	StartDate string `json:"startDate" binding:"required"`
	EndDate   string `json:"endDate" binding:"required"`
}

func getBudgetOverview(c *gin.Context) {
	var overviewInput OverviewInput
	overviewInput.StartDate = c.Query("startDate")
	overviewInput.EndDate = c.Query("endDate")
	if err := overviewInput.validateInput(); err != nil {
		saveErrorInfo(c, err, 400)
		return
	}

	db := GetDB()
	userID := c.MustGet("userID")
	var budgetOverview BudgetOverview

	err := db.Get(&budgetOverview.ExpensesOnce, "SELECT COALESCE(SUM(costs),0) AS expense_once FROM expense WHERE user_id=$1 AND date>=$2::date AND date<$3::date", userID, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	err = db.Get(&budgetOverview.IncomeOnce, "SELECT COALESCE(SUM(costs),0) AS income_once FROM income WHERE user_id=$1 AND date>=$2::date AND date<$3::date", userID, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}
	var nullTime time.Time
	err = db.Get(&budgetOverview.IncomeRecurring, `
		SELECT
			ROUND(COALESCE(SUM(cost_interval.costs*cost_interval.interval),0)::numeric,2) AS income_recurring
		FROM (
			SELECT
				relevant_recurring.costs,
				relevant_recurring.start_date,
				relevant_recurring.end_date,
				extract(year from age(relevant_recurring.end_date, relevant_recurring.start_date)) * 12 +
						extract(month from age(relevant_recurring.end_date, relevant_recurring.start_date)) + 1 AS interval
			FROM (
				SELECT 
					costs,
					CASE WHEN start_date<$3 THEN $3
						ELSE start_date
					END AS start_date,
					CASE WHEN end_date>$2 THEN $2
						WHEN end_date=$4 THEN $2
						ELSE end_date
					END AS end_date
				FROM recurring 
				WHERE 
					user_id=$1 AND is_expense=FALSE AND start_date<$2::date AND (end_date>$3::date OR end_date=$4::date)
			) AS relevant_recurring
		) AS cost_interval
		`, userID, overviewInput.EndDate, overviewInput.StartDate, nullTime)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Get(&budgetOverview.ExpensesRecurring, `
	SELECT
		ROUND(COALESCE(SUM(cost_interval.costs*cost_interval.interval),0)::numeric,2) AS income_recurring
	FROM (
		SELECT
			relevant_recurring.costs,
			relevant_recurring.start_date,
			relevant_recurring.end_date,
			extract(year from age(relevant_recurring.end_date, relevant_recurring.start_date)) * 12 +
					extract(month from age(relevant_recurring.end_date, relevant_recurring.start_date)) + 1 AS interval
		FROM (
			SELECT 
				costs,
				CASE WHEN start_date<$3 THEN $3
					ELSE start_date
				END AS start_date,
				CASE WHEN end_date>$2 THEN $2
					WHEN end_date=$4 THEN $2
					ELSE end_date
				END AS end_date
			FROM recurring 
			WHERE 
				user_id=$1 AND is_expense=TRUE AND start_date<$2::date AND (end_date>$3::date OR end_date=$4::date)
		) AS relevant_recurring
	) AS cost_interval
	`, userID, overviewInput.EndDate, overviewInput.StartDate, nullTime)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	budgetOverview.TotalExpense,
		budgetOverview.TotalIncome,
		budgetOverview.SavingsRate,
		budgetOverview.AmountSaved,
		err = budgetOverview.calculateOverviewInformation()
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseOnceByCategory, `
		SELECT 
			category, 
			COALESCE(SUM(costs),0) AS total, 
			ROUND(COALESCE(SUM(costs),0)*100 / $1) AS percentage_all, 
			ROUND(COALESCE(SUM(costs),0)*100 / $2) AS percentage_once 
		FROM 
			expense 
		WHERE 	
			user_id=$3 AND date>=$4::date AND date<$5::date 
		GROUP BY category 	
		ORDER BY total DESC
		`, budgetOverview.TotalExpense, budgetOverview.ExpensesOnce, userID, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseRecByCategory, `
		SELECT 
			cost_interval.category AS category, 
			COALESCE(SUM(cost_interval.costs*cost_interval.interval),0) AS total, 
			ROUND(COALESCE(SUM(cost_interval.costs*cost_interval.interval),0)*100 / $1) AS percentage_all, 
			ROUND(COALESCE(SUM(cost_interval.costs*cost_interval.interval),0)*100 / $2) AS percentage_once 
		FROM (
			SELECT
				relevant_recurring.costs AS costs,
				relevant_recurring.start_date AS start_date,
				relevant_recurring.end_date AS end_date,
				relevant_recurring.category AS category,
				extract(year from age(relevant_recurring.end_date, relevant_recurring.start_date)) * 12 +
						extract(month from age(relevant_recurring.end_date, relevant_recurring.start_date)) + 1 AS interval
			FROM (
				SELECT 
					costs,
					CASE WHEN start_date<$4 THEN $4
						ELSE start_date
					END AS start_date,
					CASE WHEN end_date>$5 THEN $5
						WHEN end_date=$6 THEN $5
						ELSE end_date
					END AS end_date,
					category
				FROM recurring 
				WHERE 
					user_id=$3 AND is_expense=TRUE AND start_date<$5::date AND (end_date>$4::date OR end_date=$6::date)
			) AS relevant_recurring
		) AS cost_interval
		GROUP BY category 	
		ORDER BY total DESC
	`, budgetOverview.TotalExpense, budgetOverview.ExpensesRecurring, userID, overviewInput.StartDate, overviewInput.EndDate, nullTime)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	err = db.Select(&budgetOverview.ExpenseByTag, `
		SELECT
			tag_name_costs.tag AS tag,
			COALESCE(SUM(tag_name_costs.costs),0) AS total,
			ROUND(COALESCE(SUM(tag_name_costs.costs),0)*100 / $1) AS percentage_all,
			ROUND(COALESCE(SUM(tag_name_costs.costs),0)*100 / $2) AS percentage_once
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
					AND user_id=$3
					AND date>=$4::date
					AND date<$5::date
			) AS tag_id_costs, tag
			WHERE
				tag_id_costs.id = tag.id
		) AS tag_name_costs
		GROUP BY tag_name_costs.tag
		ORDER BY total DESC
		`, budgetOverview.TotalExpense, budgetOverview.ExpensesOnce, userID, overviewInput.StartDate, overviewInput.EndDate)
	if err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	if err = budgetOverview.summariseAndSortExpenseByCategory(); err != nil {
		saveErrorInfo(c, err, 500)
		return
	}

	budgetOverview.fillArraysToAvoidNullInJSON()

	c.JSON(200, budgetOverview)
}

func (input OverviewInput) validateInput() (err error) {
	var startDate, endDate time.Time

	startDate, err = time.Parse("2006-01-02T15:04:05.000Z", input.StartDate)
	if err != nil {
		return
	}

	endDate, err = time.Parse("2006-01-02T15:04:05.000Z", input.EndDate)
	if err != nil {
		return
	}

	if endDate.Before(startDate) {
		err = errors.New("End date before start date.")
	}

	return
}

func (overview BudgetOverview) calculateOverviewInformation() (expensesTotal string, incomeTotal string, savingsRate string, amountSaved string, err error) {
	var expensesOnceNum, expensesRecurringNum, incomeOnceNum, incomerecurringNum float64

	expensesOnceNum, err = strconv.ParseFloat(overview.ExpensesOnce, 64)
	if err != nil {
		return
	}
	expensesRecurringNum, err = strconv.ParseFloat(overview.ExpensesRecurring, 64)
	if err != nil {
		return
	}
	incomeOnceNum, err = strconv.ParseFloat(overview.IncomeOnce, 64)
	if err != nil {
		return
	}
	incomerecurringNum, err = strconv.ParseFloat(overview.IncomeRecurring, 64)
	if err != nil {
		return
	}

	expensesTotalNum := expensesOnceNum + expensesRecurringNum
	incomeTotalNum := incomeOnceNum + incomerecurringNum

	savingsRateNum := 100 - expensesTotalNum*100/incomeTotalNum

	amountSavedNum := incomeTotalNum - expensesTotalNum

	savingsRate = strconv.Itoa(int(math.Round(savingsRateNum)))

	amountSaved = fmt.Sprintf("%.2f", amountSavedNum)
	expensesTotal = fmt.Sprintf("%.2f", expensesTotalNum)
	incomeTotal = fmt.Sprintf("%.2f", incomeTotalNum)

	return
}

func (overview *BudgetOverview) summariseAndSortExpenseByCategory() (err error) {
	var expenseByCategoryNum = map[string]CategoryInformationForCalculation{}

	var totalCostsNum float64
	var percentageNum int

	for _, expenseOnce := range overview.ExpenseOnceByCategory {
		totalCostsNum, err = strconv.ParseFloat(expenseOnce.TotalCosts, 64)
		if err != nil {
			return
		}
		percentageNum, err = strconv.Atoi(expenseOnce.PercentageAll)
		if err != nil {
			return
		}

		expenseByCategoryNum[expenseOnce.Category] = CategoryInformationForCalculation{percentageNum, totalCostsNum}
	}

	for _, expenseRec := range overview.ExpenseRecByCategory {
		totalCostsNum, err = strconv.ParseFloat(expenseRec.TotalCosts, 64)
		if err != nil {
			return
		}
		percentageNum, err = strconv.Atoi(expenseRec.PercentageAll)
		if err != nil {
			return
		}

		if _, exists := expenseByCategoryNum[expenseRec.Category]; exists == true {
			percentageNum = percentageNum + expenseByCategoryNum[expenseRec.Category].Percentage
			totalCostsNum = totalCostsNum + expenseByCategoryNum[expenseRec.Category].Total
		}

		expenseByCategoryNum[expenseRec.Category] = CategoryInformationForCalculation{percentageNum, totalCostsNum}
	}

	/* sort by total */
	var keys []CategoryInformationForCalculationWithKey
	for key, value := range expenseByCategoryNum {
		keys = append(keys, CategoryInformationForCalculationWithKey{key, value})
	}
	sort.Slice(keys, func(i, j int) bool {
		return keys[i].Total > keys[j].Total
	})

	var currentExpense ExpenseTotalByCategory
	for _, item := range keys {
		currentExpense.Category = item.key
		currentExpense.PercentageAll = strconv.Itoa(item.Percentage)
		currentExpense.TotalCosts = fmt.Sprintf("%.2f", item.Total)

		overview.ExpenseByCategory = append(overview.ExpenseByCategory, currentExpense)
	}

	return
}

func (overview BudgetOverview) fillArraysToAvoidNullInJSON() {

	if len(overview.ExpenseByTag) == 0 {
		overview.ExpenseByTag = []ExpenseByTag{}
	}

	if len(overview.ExpenseOnceByCategory) == 0 {
		overview.ExpenseOnceByCategory = []ExpenseByCategory{}
	}

	if len(overview.ExpenseRecByCategory) == 0 {
		overview.ExpenseRecByCategory = []ExpenseByCategory{}
	}

	if len(overview.ExpenseByCategory) == 0 {
		overview.ExpenseByCategory = []ExpenseTotalByCategory{}
	}

}
