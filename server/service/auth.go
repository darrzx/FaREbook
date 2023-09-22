package service

import (
	"context"

	"github.com/timothydarren/WebTY/graph/model"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"gorm.io/gorm"
)

func CheckPassword(ctx context.Context, id string, password string) (bool, error) {
	getUser, err := UserGetByID(ctx, id)
	if err != nil {
		return false, err
	}

	if !model.CheckPasswordHash(password, getUser.Password) {
		return false, nil
	}

	return true, nil
}

func UserLogin(ctx context.Context, email string, password string) (string, error) {
	getUser, err := UserGetByEmail(ctx, email)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", &gqlerror.Error{
				Message: "user not found",
			}
		}
		return "", err
	}

	if !model.CheckPasswordHash(password, getUser.Password) {
		return "", nil
	}

	if !getUser.IsActive {
		return "", nil
	}

	token, err := JwtGenerate(ctx, getUser.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}
