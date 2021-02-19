package main

import "time"

var expenseTagTable = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS expense_tag (
	expense_id uuid UNIQUE,
	tag_id uuid UNIQUE,
	created_at timestamp with time zone,
	updated_at timestamp with time zone
)`

type ExpenseTag struct {
	ExpenseID string    `db:"expense_id" json:"expense_id"`
	TagID     string    `db:"tag_id" json:"tag_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}
