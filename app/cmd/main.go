package main

import (
	"database/sql"
	"fmt"
	database "home-server/internal/db"
	"home-server/internal/models"
	"home-server/internal/router/auth"
	"home-server/internal/router/home"
	"home-server/internal/utils"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const TOKEN_LAST_LENGTH = 43_200 // 1 month

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
			return
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

		c.SetCookie("login-token", token, TOKEN_LAST_LENGTH, "/", "", false, true)
		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully logged in",
			"login":   true,
		})
	})

	r.GET("/home", func(c *gin.Context) {
		token, err := c.Cookie("login-token")
		if err != nil {
			log.Printf("Could not find a token: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "")
			return
		}
		_, err = database.GetUserID(db, token) // if GetUserId doesn't find anything, it returns an error
		if err != nil {
			c.Redirect(http.StatusTemporaryRedirect, "")
			return
		}
		c.File("/static/home.html")
	})

	r.GET("/api/getUserInfo", func(c *gin.Context) {

		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}

		user, err := models.RetrieveUser(db, userId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to retrieve user info",
			})
			return
		}
		userReturn := models.User{
			ID:           user.ID,
			Name:         user.Name,
			Directory:    user.Directory,
			TotalStorage: user.TotalStorage,
		}
		c.JSON(http.StatusOK, gin.H{
			"user_info": userReturn,
		})
	})

	r.POST("/api/getDirContent", func(c *gin.Context) {

		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			fmt.Println("No user found! checking cookies user...")
			// no user data sent, use userId obtained from VerifyToken
			user, err = models.RetrieveUser(db, userId)
			if err != nil {
				// didnt receive a user, return
				c.JSON(http.StatusBadRequest, gin.H{
					"error": err.Error(),
				})
				return
			}
		}

		// get the content from the users directory, return file names back to user
		contents, err := home.GetFileNames(user.Directory)
		if err != nil {
			log.Printf("Error reading in file names: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed read in file names",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "Success",
			"files":  contents,
		})
	})

	r.POST("/api/uploadFile", func(c *gin.Context) {

		// unpack user data
		id, _ := strconv.Atoi(c.PostForm("id"))
		user := models.User{
			ID:        id,
			Name:      c.PostForm("name"),
			Directory: c.PostForm("directory"),
		}
		// unpack uploaded file
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"Message": "No file received",
			})
			return
		}
		success := user.SaveFile(c, db, file)
		if !success {
			return
		}
		// TODO Need to get users root path
		// ...

		// get users new storage space used
		size, err := utils.GetUserStorageAmt(user.Directory)
		if err != nil {
			log.Printf("Encountered error calculating users storage: %v", err)
			// TODO Handle error (file was saved successfully so ...)
		}
		// TODO store new size in database

		// TODO also send filename back to the user and display on the UI

		fmt.Println("Directory total size: ", size)

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"storage": size,
		})
	})

	return r
}

func main() {
	db := database.InitDB()
	defer db.Close()

	router := setupRouter(db)
	router.Run(":8080")
}
