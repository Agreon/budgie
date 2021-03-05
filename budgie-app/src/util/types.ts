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
