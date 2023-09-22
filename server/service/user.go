package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/timothydarren/WebTY/database"
	"github.com/timothydarren/WebTY/graph/model"
)

func UserCreate(ctx context.Context, inputUser model.NewUser) (*model.User, error) {
	db := database.GetInstance()

	password, err := model.HashPassword(inputUser.Password)

	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:        uuid.NewString(),
		Firstname: inputUser.Firstname,
		Surname:   inputUser.Surname,
		Email:     inputUser.Email,
		Dob:       inputUser.Dob,
		Gender:    inputUser.Gender,
		Password:  password,
	}

	if err := db.Model(user).Create(&user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func UserGetByID(ctx context.Context, id string) (*model.User, error) {
	db := database.GetInstance()

	var user model.User
	if err := db.Model(user).Where("id = ?", id).Take(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func UserGetByEmail(ctx context.Context, email string) (*model.User, error) {
	db := database.GetInstance()

	var user model.User
	if err := db.Model(user).Where("email = ?", email).Take(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
