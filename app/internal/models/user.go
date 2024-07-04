package models

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	Password     string  `json:"password"`
	Directory    string  `json:"directory"`
	CreatedAt    string  `json:"created_at"`
	TotalStorage float32 `json:"total_storage"`
}

const BasePath = "/app/"

func hashPassword(password string) (string, error) {
	// gen hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil

}

func createPath(name string) string {
	path := BasePath + name
	return path
}

func getCurTime() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")

}

func CreateUser(user User, db *sql.DB) (bool, error) {
	// need to decide / find out if i should check if the user already exists or if execting the query will take care of that

	startingStorage := 0.0

	// hash + salt password first
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		// TODO NEED TO RETURN ERROR TO CLIENT
	}

	// get current time
	curTime := getCurTime()

	// create path
	path := createPath(user.Name)

	fmt.Println(hashedPassword)
	fmt.Println(curTime)
	fmt.Println(path)

	insertUserQuery := `INSERT INTO Users (name, password, directory, created_at, total_storage) VALUES (?, ?, ?, ?, ?)`
	statement, err := db.Prepare(insertUserQuery)
	if err != nil {
		log.Printf("Failed to insert user into Database: %v", err)
		// TODO NEED TO RETURN ERROR TO CLIENT
	}
	defer statement.Close()

	_, err = statement.Exec(user.Name, hashedPassword, path, curTime, startingStorage)
	if err != nil {
		log.Printf("Failed to insert query into table `Users` %v", err)
		// TODO RETURN Err
	}
	// create directory for user on success

	fmt.Println("Successfully added user to table `Users`")
	return true, nil
}
