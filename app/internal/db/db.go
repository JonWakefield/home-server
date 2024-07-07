package database

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

	createTableQuery := `CREATE TABLE IF NOT EXISTS Users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		directory TEXT NOT NULL UNIQUE,
		created_at TEXT NOT NULL,
		total_storage REAL NOT NULL
	)`

	_, err := db.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}

}

func createTokensTable(db *sql.DB) {

	createTableQuery := `CREATE TABLE IF NOT EXISTS Tokens (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		token TEXT NOT NULL UNIQUE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE	
	)
	`
	_, err := db.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
}

func GetUserID(db *sql.DB, token string) (int, error) {
	var userId int
	query := `SELECT COUNT(*) user_id FROM Tokens WHERE token = ?`
	err := db.QueryRow(query, token).Scan(&userId)
	if err != nil {
		fmt.Printf("Error validating user: %v", err)
		return 0, err
	}
	fmt.Println("Count: ", userId)
	return userId, nil
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
	createTokensTable(db)
	fmt.Println("Initialized Database successfully...")
	return db
}
