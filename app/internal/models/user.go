package models

import (
	"database/sql"
	"fmt"
	"home-server/internal/utils"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// theses structs are sorta crap,is there is a way to combine these two structs ?
type User struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	Password     string  `json:"password"`
	Directory    string  `json:"directory"`
	CreatedAt    string  `json:"created_at"`
	TotalStorage float64 `json:"total_storage"`
}

type DirContents map[string][]string

const BasePath = "/app/users/"

func (user *User) hashPassword() (string, error) {
	// gen hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func (user *User) createPath() string {
	path := BasePath + user.Name
	return path
}

func (user *User) checkUserExists(db *sql.DB) (bool, error) {
	count := 0
	query := `SELECT COUNT(*) FROM Users WHERE name = ?`
	err := db.QueryRow(query, user.Name).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (user *User) CreateUser(db *sql.DB) (bool, error) {
	// note may to return a string (or maybe use error) to inform user if something went wrong (i.e name already exists)
	// check to see if user exists
	userExists, err := user.checkUserExists(db)
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
	hashedPassword, err := user.hashPassword()
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return false, err
	}
	// get current time
	curTime := utils.GetCurTime()
	// create path
	path := user.createPath()

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

	err = utils.CreateDir(path)
	if err != nil {
		log.Printf("Failed to create directory for user: %v", err)
		return false, err
	}
	return true, nil
}

func RetrieveUsers(db *sql.DB) []User {

	query := `SELECT id, name, total_storage FROM Users`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error retrieving users: %e ", err)
	}
	defer rows.Close()

	users := make([]User, 0)
	for rows.Next() {
		var name string
		var storage float64
		var id int
		if err := rows.Scan(&id, &name, &storage); err != nil {
			log.Printf("Error reading in user info: %v", err)
		}
		user := User{
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

func RetrieveUser(db *sql.DB, id int) (User, error) {

	var storedUser User
	query := "SELECT * FROM Users WHERE Id = ?"
	err := db.QueryRow(query, id).Scan(&storedUser.ID,
		&storedUser.Name,
		&storedUser.Password,
		&storedUser.Directory,
		&storedUser.CreatedAt,
		&storedUser.TotalStorage)
	if err != nil {
		return User{}, err
	}
	return storedUser, nil
}

func (user *User) verifyPassword(hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password))
	return err == nil
}

func (user *User) SignIn(db *sql.DB) (bool, error) {
	// called on user sign in
	retrUser, err := RetrieveUser(db, user.ID)
	if err != nil {
		log.Printf("Encountered an error retrieving user info: %v", err)
		return false, err
	}
	match := user.verifyPassword(retrUser.Password)
	if !match {
		log.Printf("Failed loggin attempt. User: %s ", user.Name)
		return false, nil
	}
	fmt.Println("User verification Complete!")

	return true, nil
}

func (user *User) StoreToken(db *sql.DB, token, exp string) error {
	// store login-token in sql
	query := `INSERT INTO Tokens (user_id, token, expiration) VALUES (?, ?, ?)`

	_, err := db.Exec(query, user.ID, token, exp)
	if err != nil {
		log.Printf("Failed to store token in Users Table: %v", err)
		return err
	}
	return nil
}

func (user *User) SaveFile(c *gin.Context, db *sql.DB, file *multipart.FileHeader) bool {

	filePath := fmt.Sprintf("%s/%s", user.Directory, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Message": "Failed to save the file",
		})
		return false
	}
	return true
}

func (user *User) UpdateStorageAmt(db *sql.DB) {

	query := `UPDATE Users SET total_storage = ? WHERE id = ?`

	_, err := db.Exec(query, user.TotalStorage, user.ID)
	if err != nil {
		log.Printf("Failed to update usere storage amount: %v ", err)
	}
}

func (user *User) DeleteAccount(db *sql.DB) error {

	query := `DELETE FROM Users WHERE id = ?`

	_, err := db.Exec(query, user.ID)
	if err != nil {
		log.Printf("Failed to delete user: %v", err)
		return err
	}
	return nil

}

func (user *User) GetRootDir(db *sql.DB) (string, error) {
	// get user root directory
	var dir string
	query := `SELECT directory FROM Users WHERE id = ?`
	err := db.QueryRow(query, user.ID).Scan(&dir)
	if err != nil {
		return "", err
	}
	return dir, nil
}

// user/jon
func getCurDir(dir string) string {
	res := strings.Split(dir, "/")
	return res[len(res)-1]
}

func (user *User) GetFileNames() (DirContents, error) {
	// given a path, return all the files and folders inside of the path
	var name string
	files := make(DirContents)

	curDir := getCurDir(user.Directory)

	err := filepath.WalkDir(user.Directory, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		dir := strconv.FormatBool(d.IsDir())
		if d.Name() == curDir {
			name = ".."
		} else {
			name = d.Name()
		}
		files[name] = []string{dir}
		return nil
	})
	return files, err
}
