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
		newUser.CreateUser(db)

		// for now, just respond with the user data
		c.JSON(http.StatusOK, gin.H{
			"message": "User created successfully",
			"user":    newUser,
		})
	})

	// retrieve users to display on UI
	r.GET("/api/retrieveUsers", func(c *gin.Context) {

		userList := models.RetrieveUsers(db)

		fmt.Println("Retrieved User Info: ")
		fmt.Println(userList)

		c.JSON(http.StatusOK, gin.H{
			"response":  "OK!",
			"user_info": userList,
		})

	})

	r.POST("/api/signin", func(c *gin.Context) {
		fmt.Println("Trying login...")

		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("User: ", user)

		// call function
		success, err := user.SignIn(db)
		if err != nil {
			// handle and return error to client
		}

		if success {
			// If user signed in successfully, need too...
			// 1) display user home page
			// show documents / folder user has stored
		}

		c.JSON(http.StatusOK, gin.H{
			"message": success,
		})
	})

	return r
}

func main() {
	db := db.InitDB()
	defer db.Close()

	router := setupRouter(db)
	router.Run(":8080")
}
