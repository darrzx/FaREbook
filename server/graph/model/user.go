package model

import "golang.org/x/crypto/bcrypt"

type User struct {
	ID        string `json:"id"`
	Firstname string `json:"firstname"`
	Surname   string `json:"surname"`
	Email     string `json:"email" gorm:"unique"`
	Dob       string `json:"dob"`
	Gender    string `json:"gender"`
	Password  string `json:"password"`
	Profilepic  string `json:"profilepic"`
	IsActive  bool   `json:"isActive"`
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
