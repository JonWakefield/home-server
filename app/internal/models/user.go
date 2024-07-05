package models

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// theses structs are sorta crap,is there is a way to combine these two structs ?
type User struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type UserInfo struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	TotalStorage float32 `json:"total_storage"`
}

const BasePath = "/app/users/"
const DirPermissions = 0755

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

func checkUserExists(name string, db *sql.DB) (bool, error) {

	count := 0
	query := `SELECT COUNT(*) FROM Users WHERE name = ?`
	err := db.QueryRow(query, name).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func createDir(path string) error {
	err := os.Mkdir(path, DirPermissions)
	if err != nil {
		return err
	}
	return nil
}

func CreateUser(user User, db *sql.DB) (bool, error) {
	// note may to return a string (or maybe use error) to inform user if something went wrong (i.e name already exists)

	// check to see if user exists
	userExists, err := checkUserExists(user.Name, db)
	if err != nil {
		log.Printf("Failed to query database: %v", err)
		return false, err
	}
	if userExists {
		log.Printf("User already exists in database, can't insert")
		return false, nil
	}

	startingStorage := 0.0

	// hash password first
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return false, err
	}
	// get current time
	curTime := getCurTime()
	// create path
	path := createPath(user.Name)

	insertUserQuery := `INSERT INTO Users (name, password, directory, created_at, total_storage) VALUES (?, ?, ?, ?, ?)`
	statement, err := db.Prepare(insertUserQuery)
	if err != nil {
		log.Printf("Failed to insert user into Database: %v", err)
		return false, err
	}
	defer statement.Close()

	_, err = statement.Exec(user.Name, hashedPassword, path, curTime, startingStorage)
	if err != nil {
		log.Printf("Failed to insert query into table `Users` %v", err)
		return false, err
	}
	// create directory for user on success
	fmt.Println("Successfully added user to table `Users`")

	err = createDir(path)
	if err != nil {
		log.Printf("Failed to create directory for user: %v", err)
		return false, err
	}
	return true, nil
}

func RetrieveUsers(db *sql.DB) []UserInfo {

	query := `SELECT id, name, total_storage FROM Users`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error retrieving users: %e ", err)
	}
	defer rows.Close()

	users := make([]UserInfo, 0)
	for rows.Next() {
		var name string
		var storage float32
		var id int
		if err := rows.Scan(&id, &name, &storage); err != nil {
			log.Printf("Error reading in user info: %v", err)
		}
		user := UserInfo{
			ID:           id,
			Name:         name,
			TotalStorage: storage,
		}
		users = append(users, user)
	}
	// check for any final errors
	if err := rows.Err(); err != nil {
		log.Printf("Encountered error reading in user data: %v", err)
	}

	return users
}

func SignIn(user User) (bool, error) {

	return true, nil
}
