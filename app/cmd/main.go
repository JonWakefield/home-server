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
const BASE_SIZE = 1000           // unit: Kb

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
				"error": err.Error(),
				"login": false,
			})
			return
		}
		if !success {
			// user provided the wrong password, inform...
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Login failed. Invalid credentials.",
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
		contents, err := user.GetFileNames()

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
		// TODO Need to get users root path why ??
		// ...

		// get users new storage space used
		size, err := utils.GetUserStorageAmt(user.Directory)

		// convert to kb (use kb as base unit)
		sizeConv := utils.UnitConverter(size, BASE_SIZE)
		if err != nil {
			log.Printf("Encountered error calculating users storage: %v", err)
			// TODO Handle error (file was saved successfully so ...)
		}
		user.TotalStorage = sizeConv
		user.UpdateStorageAmt(db)
		fmt.Println("Directory total size: ", sizeConv)
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"storage": size,
		})
	})

	r.POST("/api/downloadFile", func(c *gin.Context) {
		// verify user token
		_, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}

		var payload home.Payload

		if err := c.ShouldBindJSON(&payload); err != nil {
			// did not successfully receive payload from user
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload uploaded",
			})
			return
		}
		home.DownloadFile(c, payload.FileName, payload.Path)
		fmt.Println("File sent back...")
	})

	r.POST("/api/renamefile", func(c *gin.Context) {
		// verify user token
		_, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var payload home.Payload
		if err := c.ShouldBindJSON(&payload); err != nil {
			// did not successfully receive payload from user
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload uploaded",
			})
			return
		}
		err := payload.RenameFile()
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

	r.POST("/api/deleteFile", func(c *gin.Context) {
		// verify user token
		_, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var payload home.Payload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload found.",
			})
			return
		}
		err := payload.DeleteFile()
		if err != nil {
			log.Printf("Failed to Delete file. Error: %v ", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Failed to Delete file",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully Deleted file",
		})
	})

	r.POST("/api/addFolder", func(c *gin.Context) {
		// verify user token
		_, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var payload home.Payload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload found.",
			})
			return
		}
		exists, err := payload.AddDirectory()
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

	r.POST("/api/deleteAccount", func(c *gin.Context) {
		// verify user token
		userId, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var user models.User
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload found.",
			})
			return
		}
		// double check user id is valid
		if user.ID != userId {
			fmt.Println("Not the same!")
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Can not delete user",
			})
		}
		// get root dir (i think this will be important when i add in file navigation)
		rootDir, err := user.GetRootDir(db)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Can not delete user",
			})
		}
		err = user.DeleteAccount(db)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Can not delete user",
			})
		}
		err = utils.DelDir(rootDir)
		if err != nil {
			log.Printf("Failed to delete users diretory. %v ", err)
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Successfully Deleted User",
		})
		// TODO delete all tokens in tokens db for user
		go database.DelUserTokens(db, userId)

	})

	r.POST("/api/previewFile", func(c *gin.Context) {
		// verify user token
		_, valid := auth.VerifyToken(c, db)
		if !valid {
			return
		}
		var payload home.Payload
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "No payload found.",
			})
			return
		}

		// TODO change name from `downloadFile` to retrieve file or something
		home.DownloadFile(c, payload.FileName, payload.Path)
		fmt.Println("File sent back...")

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
