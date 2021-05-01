// TODO: Move to common lib? => converter https://github.com/tkrajina/typescriptify-golang-structs
export interface Expense {
    id: string;
    category: string;
    costs: string;
    name?: string;
    date: Date;
    tags?: Tag[];
}

export interface Income {
  id: string;
  costs: string;
  name: string;
  date: Date;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Reoccurring {
  id: string;
  costs: string;
  category?: string;
  name: string;
  start_date: Date;
  end_date?: Date;
  is_expense: boolean;
}

export interface ReoccurringHistoryItem extends Reoccurring {
  end_date: Date;
}

export interface ExpensesByCategory {
  category: string;
  percentageOfAllExpenses: number;
  percentageOfNonRecurringExpenses: number;
  totalCosts: number;
}

export interface ExpensesByTag {
  tag: string;
  percentageOfExpensesOnce: number;
  percentageOfAllExpenses: number;
  totalCosts: number;
}

export interface OverviewResponse {
  amountSaved: number;
  totalExpenseRecurring: number;
  totalExpenseOnce: number;
  totalExpense: number;
  expenseOnceByCategory: ExpensesByCategory[];
  expenseRecurringByCategory: ExpensesByCategory[];
  expenseByCategory: ExpensesByCategory[];
  expenseByTag: ExpensesByTag[];
  savingsRate: number;
  totalIncomeRecurring: number;
  totalIncomeOnce: number;
  totalIncome: number;
}
