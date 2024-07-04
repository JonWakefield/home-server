package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

// NOTE: CHANGE PATH ON RPi
const dbName = "/app/cloud.db"

func createUserTable(db *sql.DB) {

	createTableSQL := `CREATE TABLE IF NOT EXISTS Users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		directory TEXT NOT NULL UNIQUE,
		created_at TEXT NOT NULL,
		total_storage REAL NOT NULL
	)`

	_, err := db.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}

}

func InitDB() *sql.DB {
	if _, err := os.Stat(dbName); os.IsNotExist(err) {
		file, err := os.Create(dbName)
		if err != nil {
			log.Fatalf("Failed to create database file: %v", err)
		}
		file.Close()
	}
	// open database connection
	db, err := sql.Open("sqlite3", dbName)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	createUserTable(db)

	fmt.Println("Initialized Database successfully...")
	return db
}
