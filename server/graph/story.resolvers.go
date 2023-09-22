package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/timothydarren/WebTY/graph/model"
)

// CreateStory is the resolver for the createStory field.
func (r *mutationResolver) CreateStory(ctx context.Context, inputStory model.NewStory) (*model.Story, error) {
	story := &model.Story{
		ID:              uuid.NewString(),
		Userid:          inputStory.Userid,
		Username:        inputStory.Username,
		Image:           inputStory.Image,
		Text:            inputStory.Text,
		BackgroundColor: inputStory.BackgroundColor,
		Font:            inputStory.Font,
		Date:            time.Now().Format("2006-01-02"),
	}
	return story, r.DB.Save(&story).Error
}

// GetStory is the resolver for the getStory field.
func (r *queryResolver) GetStory(ctx context.Context, id string) (*model.Story, error) {
	panic(fmt.Errorf("not implemented: GetStory - getStory"))
}

// GetAllStory is the resolver for the getAllStory field.
func (r *queryResolver) GetAllStory(ctx context.Context) ([]*model.Story, error) {
	panic(fmt.Errorf("not implemented: GetAllStory - getAllStory"))
}

// GetAllStoryByUserID is the resolver for the getAllStoryByUserId field.
func (r *queryResolver) GetAllStoryByUserID(ctx context.Context, id string) ([]*model.Story, error) {
	var stories []*model.Story
	return stories, r.DB.Where("userid = ?", id).Find(&stories).Error
}
