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

	"github.com/gin-gonic/gin"
)

const (
	TOKEN_LAST_LENGTH = 43_200 // 1 month
	BASE_SIZE         = 1000   // unit: Kb
	PATH_TO_HOME_HTML = "/usr/share/nginx/html/static/home.html"
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
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		fmt.Println("creating user...")
		created, err := user.CreateUser(db)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": err.Error(),
			})
			return
		}
		if !created {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Username already in use",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "User created successfully",
			"user":    user,
		})
	})

	// retrieve users to display on UI
	r.GET("/api/retrieveUsers", func(c *gin.Context) {

		userList := models.RetrieveUsers(db)

		fmt.Println(userList)

		c.JSON(http.StatusOK, gin.H{
			"response":  "OK!",
			"user_info": userList,
		})

	})

	r.POST("/api/signin", func(c *gin.Context) {

		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		sentPassword := user.Password

		// call function
		user, err := database.RetrieveUser(db, user.ID)
		if err != nil {
			log.Printf("Encountered an error retrieving user info: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
				"login": false,
			})
			return
		}

		success := user.VerifySignIn(db, sentPassword)
		if !success {
			// user provided the wrong password, inform...
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Login failed. Invalid credentials.",
				"login":   false,
			})
			return
		}

		// check if user has a token:
		userId, valid := auth.VerifyToken(c, db)
		if !valid || userId != user.ID {
			fmt.Println("Could not find a token, making a new one")
			// Create a new token for the user
			token, err := utils.GenerateToken()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "Failed to generate login token. Login Failed",
					"login":   false,
				})
				return
			}
			// store token in db
			expTime := utils.CalcExpirationTime(TOKEN_LAST_LENGTH)

			err = user.StoreToken(db, token, expTime)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "Failed to store user token. Login Failed",
					"login":   false,
				})
				return
			}
			c.SetCookie("login-token", token, TOKEN_LAST_LENGTH, "/", "", false, true)
		} else {
			fmt.Println("Already found a token!")
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully logged in",
			"login":   true,
		})
	})

	// ---- home page routes ------
	r.GET("/home", func(c *gin.Context) {

		_, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		c.File(PATH_TO_HOME_HTML)
	})

	r.GET("/api/getUserInfo", func(c *gin.Context) {

		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		user, err := database.RetrieveUser(db, userId)
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

	r.GET("/api/getDirContent", func(c *gin.Context) {
		// veryify user
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		// retrieve user info
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		// retrieve path from query:
		path := c.Query("path")
		fullPath := utils.CreateFullPath(user.Directory, path)

		// get the content from the users directory, return file names back to user
		contents, err := home.GetFileNames(user.Directory, fullPath)
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

		// veryify user
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		// retrieve path from query:
		path := c.Query("path")

		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		// unpack uploaded file
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"Message": "No file received",
			})
			return
		}
		fullPath := utils.CreateFullPath(user.Directory, path)
		success := home.SaveFile(c, fullPath, file)
		if !success {
			return
		}

		// get users new storage space used
		size, err := utils.GetUserStorageAmt(user.Directory)
		if err != nil {
			log.Printf("Encountered error calculating users storage: %v", err)
			// TODO Handle error (file was saved successfully so ...)
		}

		// convert to kb (use kb as base unit)
		sizeConv := utils.UnitConverter(size, BASE_SIZE)
		user.TotalStorage = sizeConv
		user.UpdateStorageAmt(db)
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
		})
	})

	r.GET("/api/downloadFile", func(c *gin.Context) {
		// verify user token
		fmt.Println("IN")
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		// retrieve path from query:
		path := c.Query("path")
		fullPath := utils.CreateFullPath(user.Directory, path)
		err = home.RetrieveFile(c, fullPath)
		if err != nil {
			log.Printf("Failed to download. Error: %v ", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}
	})

	r.PATCH("/api/renameFile", func(c *gin.Context) {
		// verify user token
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var rename home.Rename
		if err := c.ShouldBindJSON(&rename); err != nil {
			// did not successfully receive payload from user
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload uploaded",
			})
			return
		}
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		// retrieve path from query:
		path := c.Query("path")
		fullPath := utils.CreateFullPath(user.Directory, path)

		err = home.RenameFile(fullPath, rename.FileName, rename.NewFileName)
		if err != nil {
			log.Printf("Failed to Rename file. Error: %v ", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Failed to rename file",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully renamed file",
		})
	})

	r.DELETE("/api/deleteFile", func(c *gin.Context) {
		// verify user token
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		path := c.Query("path")
		fullPath := utils.CreateFullPath(user.Directory, path)

		err = home.DeleteFile(fullPath)
		if err != nil {
			log.Printf("Failed to Delete file. Error: %v ", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Failed to Delete file",
				"success": false,
			})
			return
		}

		// update users total storage used
		size, err := utils.GetUserStorageAmt(user.Directory)
		if err != nil {
			log.Printf("Encountered error calculating users storage: %v", err)
			// TODO Handle error (file was saved successfully so ...)
		}
		// convert to kb (use kb as base unit)
		sizeConv := utils.UnitConverter(size, BASE_SIZE)
		user.TotalStorage = sizeConv
		user.UpdateStorageAmt(db)

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully Deleted file",
			"success": true,
		})
	})

	r.POST("/api/addFolder", func(c *gin.Context) {
		// verify user token
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		// retrieve path from query:
		path := c.Query("path")
		fullPath := utils.CreateFullPath(user.Directory, path)
		var folder home.Folder
		if err := c.ShouldBindJSON(&folder); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload found.",
			})
			return
		}
		exists, err := home.AddDirectory(fullPath, folder.Name)
		if exists {
			c.JSON(http.StatusOK, gin.H{
				"message": "Folder already Exists",
				"created": false,
			})
			return
		}
		if err != nil {
			log.Printf("Failed to Add Directory. Error: %v ", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Failed to Add Directory",
				"created": false,
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully Added Directory",
			"created": true,
		})
	})

	r.DELETE("/api/deleteAccount", func(c *gin.Context) {
		// verify user token
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		err = user.DeleteAccount(db)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Can not delete user",
			})
		}
		err = utils.DelDir(user.Directory)
		if err != nil {
			log.Printf("Failed to delete users diretory. %v ", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully Deleted User",
		})
		// TODO delete all tokens in tokens db for user
		go database.DelUserTokens(db, userId)
	})

	r.GET("/api/previewFile", func(c *gin.Context) {
		// verify user token
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		user, err := database.RetrieveUser(db, userId)
		if err != nil {
			// didnt receive a user, return
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}
		// retrieve path from query:
		path := c.Query("path")
		fullPath := utils.CreateFullPath(user.Directory, path)
		home.RetrieveFile(c, fullPath)
	})

	return r
}

func main() {
	db := database.InitDB()
	defer db.Close()

	router := setupRouter(db)
	router.MaxMultipartMemory = 50 << 20
	router.Run(":8080")
}
