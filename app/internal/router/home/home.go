package home

import (
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// I hate this struct name
type Payload struct {
	NewFileName string `json:"newFileName"`
	FileName    string `json:"fileName"`
	Path        string `json:"path"`
}

// TODO change this to a method for payload
func DownloadFile(c *gin.Context, name, path string) {
	// add file to body stream for user downloading
	fullPath := path + "/" + name
	c.File(fullPath)
}

func (load *Payload) RenameFile() error {

	oldPath := load.Path + "/" + load.FileName

	dir := filepath.Dir(oldPath)

	newPath := filepath.Join(dir, load.NewFileName)

	// rename the file
	err := os.Rename(oldPath, newPath)
	if err != nil {
		return err
	}
	return nil

}

func (load *Payload) DeleteFile() error {
	// delete file
	fullPath := load.Path + "/" + load.FileName

	err := os.Remove(fullPath)
	if err != nil {
		return err
	}
	return nil
}

func DirExists(path string) bool {
	// check if the directory exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}
	return true
}

func (load *Payload) AddDirectory() (bool, error) {
	// add a new directory for the users storage
	fullPath := load.Path + "/" + load.NewFileName

	if DirExists(fullPath) {
		return true, nil
	}

	err := os.MkdirAll(fullPath, os.ModePerm)
	if err != nil {
		return false, err
	}
	return false, nil
}
