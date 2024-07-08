package auth

import (
	"database/sql"
	database "home-server/internal/db"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func VerifyToken(c *gin.Context, db *sql.DB) (int, bool) {
	// verify user has a login-token and its still valid

	// get token
	token, err := c.Cookie("login-token")

	if err != nil {
		log.Printf("Could not find a valid token! %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorizeded. no login token found",
		})
		return 0, false
	}

	// verify the login token
	userId, err := database.GetUserID(db, token)
	if err != nil {
		// this probabily means the token is expired
		log.Printf("Could not find a user for token: %v", err)
		c.Redirect(http.StatusTemporaryRedirect, "")
		return 0, false
	}
	return userId, true
}
