package utils

import (
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
