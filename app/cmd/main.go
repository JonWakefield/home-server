package main

import (
	"database/sql"
	"fmt"
	"home-server/internal/db"
	"home-server/internal/models"
	"home-server/internal/utils"
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
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to retrieve user credentials",
				"login":   false,
			})
		}
		if !success {
			// user provided the wrong password, inform...
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "login failed. invalid credentials.",
				"login":   false,
			})
			return
		}
		// User signed in successfully
		token, err := utils.GenerateToken()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to generate login token. Login Failed",
				"login":   false,
			})
			return
		}

		// store token in db
		err = user.StoreToken(db, token)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to store user token. Login Failed",
				"login":   false,
			})
			return
		}

		c.SetCookie("login-token", token, 3600, "/", "", false, true)
		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully logged in",
			"login":   true,
		})

		// Next:
		// 1) Return `home page` content (/home)
		// 2) retreive home page specifics (i.e files, folders...)
	})

	r.GET("/home", func(c *gin.Context) {
		fmt.Println("Hit home!")
		token, err := c.Cookie("login-token")
		if err != nil || !utils.IsValidToken(db, token) {
			fmt.Println("Not valid!")
			c.Redirect(http.StatusTemporaryRedirect, "")
			return
		}
		c.File("/static/home.html")
	})

	return r
}

func main() {
	db := db.InitDB()
	defer db.Close()

	router := setupRouter(db)
	router.Run(":8080")
}
