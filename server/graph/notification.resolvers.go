package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/timothydarren/WebTY/graph/model"
)

// CreateNotification is the resolver for the createNotification field.
func (r *mutationResolver) CreateNotification(ctx context.Context, inputNotification model.NewNotification) (*model.Notification, error) {
	notification := &model.Notification{
		ID:       uuid.NewString(),
		Userid:   inputNotification.Userid,
		Username: inputNotification.Username,
		Text:     inputNotification.Text,
		Date:     time.Now().Format("2006-01-02"),
		Status:   "Unread",
	}
	return notification, r.DB.Save(&notification).Error
}

// GetAllNotificationByUserID is the resolver for the getAllNotificationByUserId field.
func (r *queryResolver) GetAllNotificationByUserID(ctx context.Context, id string, isAll bool) ([]*model.Notification, error) {
	var notifications []*model.Notification
	query := r.DB.Where("userid = ?", id)

	if !isAll {
		query = query.Where("status = ?", "Unread")
	}

	return notifications, query.Find(&notifications).Error
}

// GetNotificationCountByStatus is the resolver for the getNotificationCountByStatus field.
func (r *queryResolver) GetNotificationCountByStatus(ctx context.Context, userid string) (int, error) {
	var notifCount int64
	if err := r.DB.Model(&model.Notification{}).Where("userid = ? AND status = ?", userid, "Unread").Count(&notifCount).Error; err != nil {
		return 0, err
	}
	return int(notifCount), nil
}
