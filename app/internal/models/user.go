package models

type User struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Password     string `json:"password"`
	Directory    string `json:"directory"`
	CreatedAt    string `json:"created_at"`
	TotalStorage string `json:"total_storage"`
}

func InsertUser() {

}
