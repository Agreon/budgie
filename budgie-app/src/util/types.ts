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
