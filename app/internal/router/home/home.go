package home

import (
	"os"
	"path/filepath"
	"strconv"
)

type DirContents map[string][]string

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
