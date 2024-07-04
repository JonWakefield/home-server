package main

import (
	"home-server/internal/db"
	"home-server/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	// disable console color
	// gin.DisableConsoleColor()
	r := gin.Default()

	// --- Setup routes ---

	// ping test
	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"response": "pong",
		})
	})

	// get user
	r.GET("/api/users", func(c *gin.Context) {

	})

	return r
}

func main() {
	db := db.InitDB()
	defer db.Close()

	exUser := models.User{
		ID:           1,
		Name:         "Jon",
		Password:     "Hello",
		Directory:    "",
		CreatedAt:    "",
		TotalStorage: 0,
	}

	models.CreateUser(exUser, db)

	// router := setupRouter()
	// router.Run(":8080")
}
