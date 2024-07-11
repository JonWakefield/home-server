package home

import (
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DirContents map[string][]string

// I hate this struct name
type Payload struct {
	NewFileName string `json:"newFileName"`
	FileName    string `json:"fileName"`
	Path        string `json:"path"`
}

func GetFileNames(path string) (DirContents, error) {
	// given a path, return all the files and folders inside of the path
	files := make(DirContents)

	err := filepath.WalkDir(path, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		dir := strconv.FormatBool(d.IsDir())
		files[d.Name()] = []string{dir}
		return nil
	})
	return files, err
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
