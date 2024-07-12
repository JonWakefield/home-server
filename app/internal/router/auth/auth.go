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

	token, err := c.Cookie("login-token") //returns an error if no token is found
	if err != nil {
		log.Printf("Could not find a valid token! %v", err)
		c.Redirect(http.StatusTemporaryRedirect, "")
		return 0, false
	}

	// verify the login token
	// TODO need to check if the token is expired
	userId, err := database.GetUserID(db, token)

	if err != nil {
		// this probabily means the token is expired
		log.Printf("Could not find a user for token: %v", err)
		c.Redirect(http.StatusTemporaryRedirect, "")
		return 0, false
	}
	return userId, true
}
