package utils

import (
	"crypto/rand"
	"encoding/hex"
	"math"
	"os"
	"path/filepath"
	"time"
)

const (
	DirPermissions   = 0755
	storagePrecision = 2 // num of decimal points to use when calculating amount of storage
)

func GetCurTime() string {
	currentTime := time.Now()
	return currentTime.Format("2006-01-02 15:04:05")
}

func CalcExpirationTime(timeLen int) string {
	var len time.Duration = time.Duration(timeLen)
	expTime := time.Now().Add(len * time.Minute).Format("2006-01-02 15:04:05")
	return expTime
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

func GetUserStorageAmt(path string) (int64, error) {
	var totalSize int64

	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			totalSize += info.Size()
		}
		return nil
	})
	return totalSize, err
}

func Round(val float64, precision int) float64 {
	// rounds val to precision num of decimal points
	ratio := math.Pow(10, float64(precision))
	return math.Round(val*ratio) / ratio
}

func UnitConverter(size int64, unit int64) float64 {
	result := float64(size) / float64(unit)
	return Round(result, storagePrecision)
}

func DelDir(path string) error {
	// delete users root directory
	err := os.RemoveAll(path)
	if err != nil {
		return err
	}
	return nil
}

func CreateFullPath(base, new string) string {
	n := new[4:]
	if n != "" {
		return base + "/" + n
	}
	return base
}
