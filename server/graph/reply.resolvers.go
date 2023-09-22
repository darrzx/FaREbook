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

// CreateReply is the resolver for the createReply field.
func (r *mutationResolver) CreateReply(ctx context.Context, inputReplyPost model.NewReplyPost) (*model.ReplyPost, error) {
	replyComment := &model.ReplyPost{
		ID:           uuid.NewString(),
		Commentid:    inputReplyPost.Commentid,
		Userid:       inputReplyPost.Userid,
		Username:     inputReplyPost.Username,
		Replycomment: inputReplyPost.Replycomment,
		Date:         time.Now().Format("2006-01-02"),
	}
	return replyComment, r.DB.Save(&replyComment).Error
}

// GetAllReplyByCommentID is the resolver for the getAllReplyByCommentId field.
func (r *queryResolver) GetAllReplyByCommentID(ctx context.Context, id string) ([]*model.ReplyPost, error) {
	var replies []*model.ReplyPost
	return replies, r.DB.Where("commentid = ?", id).Find(&replies).Error
}