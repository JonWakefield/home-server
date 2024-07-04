package main

import (
	"database/sql"
	"fmt"
	"home-server/internal/db"
	"home-server/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupRouter(db *sql.DB) *gin.Engine {
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
	r.POST("/api/createUser", func(c *gin.Context) {
		fmt.Println("Hit endpoint...")
		// can move this to a function
		var newUser models.User

		if err := c.ShouldBindJSON(&newUser); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("creating user...")
		models.CreateUser(newUser, db)

		// for now, just respond with the user data
		c.JSON(http.StatusOK, gin.H{
			"message": "User created successfully",
			"user":    newUser,
		})
	})

	return r
}

func main() {
	db := db.InitDB()
	defer db.Close()

	// exUser := models.User{
	// 	Name:     "Jon",
	// 	Password: "Hello",
	// }
	// models.CreateUser(exUser, db)

	router := setupRouter(db)
	router.Run(":8080")
}
