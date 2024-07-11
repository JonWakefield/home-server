package home

import (
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DirContents map[string][]string

type DownloadFilePayload struct {
	FileName string `json:"fileName"`
	Path     string `json:"path"`
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

func DownloadFile(c *gin.Context, name, path string) {
	// add file to body stream for user downloading
	fullPath := path + "/" + name
	c.File(fullPath)
}
