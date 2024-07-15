package home

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

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

type DirContents map[string][]string

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
	err := os.Remove(path)
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

func AddDirectory(path, name string) (bool, error) {
	// add a new directory for the users storage
	fullPath := path + "/" + name

	if DirExists(fullPath) {
		return true, nil
	}

	err := os.MkdirAll(fullPath, os.ModePerm)
	if err != nil {
		return false, err
	}
	return false, nil
}

func getCurDir(dir string) string {
	res := strings.Split(dir, "/")
	return res[len(res)-1]
}

func GetFileNames(path string) (DirContents, error) {
	// given a path, return all the files and folders inside of the path
	var name string
	files := make(DirContents)

	curDir := getCurDir(path)

	err := filepath.WalkDir(path, func(path string, d os.DirEntry, err error) error {
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

func SaveFile(c *gin.Context, path string, file *multipart.FileHeader) bool {

	filePath := fmt.Sprintf("%s/%s", path, file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Message": "Failed to save the file",
		})
		return false
	}
	return true
}
