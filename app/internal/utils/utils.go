package utils

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"os"
	"time"
)

const DirPermissions = 0755

func GetCurTime() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")
}

func CreateDir(path string) error {
	err := os.Mkdir(path, DirPermissions)
	if err != nil {
		return err
	}
	return nil
}

func GenerateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func IsValidToken(db *sql.DB, token string) bool {

	var count int
	query := `SELECT COUNT(*) FROM Users WHERE token = ?`
	err := db.QueryRow(query, token).Scan(&count)
	if err != nil {
		fmt.Printf("Error validating user: %v", err)
		return false
	}
	fmt.Println("Count: ", count)
	return count > 0
}
