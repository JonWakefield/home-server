package home

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

// I hate this struct name
type Rename struct {
	NewFileName string `json:"newFileName"`
	FileName    string `json:"fileName"`
}

type Folder struct {
	Name string `json:"Name"`
}

type DirContents map[string]bool

func RetrieveFile(c *gin.Context, path string) {
	c.File(path)
}

func RenameFile(path, name, newName string) error {

	oldPath := path + "/" + name

	dir := filepath.Dir(oldPath)

	newPath := filepath.Join(dir, newName)

	// rename the file
	err := os.Rename(oldPath, newPath)
	if err != nil {
		return err
	}
	return nil

}

func DeleteFile(path string) error {

	err := os.RemoveAll(path)
	if err != nil {
		return err
	}
	return nil
}

func Exists(path string) bool {
	// check if the directory exists
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false
	}
	return true
}

func AddDirectory(path, name string) (bool, error) {
	// add a new directory for the users storage
	fullPath := path + "/" + name

	if Exists(fullPath) {
		return true, nil
	}

	err := os.MkdirAll(fullPath, os.ModePerm)
	if err != nil {
		return false, err
	}
	return false, nil
}

func GetFileNames(root, path string) (DirContents, error) {
	// given a path, return all the files and folders inside of the path

	files := make(DirContents)

	// curDir := getCurDir(path)

	entries, err := os.ReadDir(path)
	if err != nil {
		return files, err
	}
	for _, entry := range entries {
		dir := entry.IsDir()
		files[entry.Name()] = dir
	}

	// create back directory
	if root != path {
		files[".."] = true
	}

	return files, err
}

func SaveFile(c *gin.Context, path string, file *multipart.FileHeader) bool {

	filePath := fmt.Sprintf("%s/%s", path, file.Filename)

	// check if file exists
	if Exists(filePath) {
		count := 0
		for Exists(filePath) {
			filePath = fmt.Sprintf("%s/%d_%s", path, count, file.Filename)
			count++
		}
	}

	fmt.Println("Final path: ", filePath)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Message": "Failed to save the file",
		})
		return false
	}
	return true
}
