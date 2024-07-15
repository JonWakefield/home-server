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
type Payload struct {
	NewFileName string `json:"newFileName"`
	FileName    string `json:"fileName"`
	Path        string `json:"path"`
}

type DirContents map[string][]string

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
