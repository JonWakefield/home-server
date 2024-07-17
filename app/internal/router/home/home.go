package home

import (
	"archive/zip"
	"fmt"
	"io"
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

func ZipFolder(folderPath, zipPath string) error {
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	err = filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Create the zip file header
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		header.Name, err = filepath.Rel(filepath.Dir(folderPath), path)
		if err != nil {
			return err
		}

		if info.IsDir() {
			header.Name += "/"
		} else {
			header.Method = zip.Deflate
		}

		// Write the header
		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		// If it's a directory, we don't need to write anything more
		if info.IsDir() {
			return nil
		}

		// Open the file to read its contents
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		// Copy the file contents to the zip writer
		_, err = io.Copy(writer, file)
		return err
	})

	return err
}

func IsFolder(path string) bool {
	// check if the given path is a folder or file
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	if info.IsDir() {
		return true
	}
	return false
}

func RetrieveFile(c *gin.Context, path string) error {

	fmt.Println("checking if file or folder")
	// check if its a file or folder:
	if IsFolder(path) {
		// folders
		zipPath := path + ".zip"
		fmt.Println("ZIP: ", zipPath)
		err := ZipFolder(path, zipPath)
		if err != nil {
			return err
		}
		defer os.Remove(zipPath)

		c.FileAttachment(zipPath, filepath.Base(zipPath))
	} else {
		// files
		c.File(path)
	}
	return nil
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
