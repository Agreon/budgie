package main

import (
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

type DBExtended struct {
	*sqlx.DB
}

/* only supports query where statement "WHERE" is included */
func (db *DBExtended) SelectWithFilterOptions(dest interface{}, query string, filter map[string]string, args ...interface{}) error {
	adaptQuery(&query, filter, &args)
	return db.Select(dest, query, args...)
}

/* only supports query where statement "WHERE" is included */
func (db *DBExtended) GetWithFilterOptions(dest interface{}, query string, filter map[string]string, args ...interface{}) error {
	adaptQuery(&query, filter, &args)
	return db.Get(dest, query, args...)
}

func adaptQuery(query *string, filter map[string]string, args *[]interface{}) {
	numOfArgs := len(*args)

	querySplit := strings.SplitAfter(*query, "WHERE ")
	var newQuery []string
	newQuery = append(newQuery, querySplit[0])

	var filterQuery string
	i := 0
	for key, value := range filter {
		*args = append(*args, value)

		i++
		filterQuery = fmt.Sprintf("%s=$%d AND ", key, numOfArgs+i)

		newQuery = append(newQuery, filterQuery)
	}
	newQuery = append(newQuery, querySplit[1])

	*query = strings.Join(newQuery, "")
}
