package database

import (
	"github.com/timothydarren/WebTY/graph/model"
	"github.com/timothydarren/WebTY/helper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var database *gorm.DB

const defaultDatabase = "host=localhost user=postgres password=darrenPG dbname=tpaweb port=5432 sslmode=disable TimeZone=Asia/Shanghai"

func GetInstance() *gorm.DB {
	if database == nil {
		dsn := helper.GoDotEnvVariable("DATABASE_URL")
		if dsn == "" {
			dsn = defaultDatabase
		}
		db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			panic(err)
		}
		database = db
	}
	return database
}

func MigrateTable() {
	db := GetInstance()
	db.AutoMigrate(&model.User{})
	db.AutoMigrate(&model.Post{})
	db.AutoMigrate(&model.MediaPost{})
	db.AutoMigrate(&model.CommentPost{})
	db.AutoMigrate(&model.LikePost{})
	db.AutoMigrate(&model.ReplyPost{})
	db.AutoMigrate(&model.Story{})
	db.AutoMigrate(&model.Reels{})
	db.AutoMigrate(&model.CommentReels{})
	db.AutoMigrate(&model.FriendRequests{})
	db.AutoMigrate(&model.Friend{})
	db.AutoMigrate(&model.Notification{})
	db.AutoMigrate(&model.Conversation{})
	db.AutoMigrate(&model.Message{})
	db.AutoMigrate(&model.Group{})
	db.AutoMigrate(&model.GroupMember{})
	db.AutoMigrate(&model.GroupRequestJoin{})
	db.AutoMigrate(&model.GroupInvited{})
	db.AutoMigrate(&model.GroupPost{})
	db.AutoMigrate(&model.File{})
	db.AutoMigrate(&model.LikeComment{})

}
