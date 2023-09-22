package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.36

import (
	"context"

	"github.com/google/uuid"
	"github.com/timothydarren/WebTY/graph/model"
)

// CreateFriend is the resolver for the createFriend field.
func (r *mutationResolver) CreateFriend(ctx context.Context, inputFriends model.NewFriend) (*model.Friend, error) {
	friends := &model.Friend{
		ID:       uuid.NewString(),
		Userid:   inputFriends.Userid,
		Friendid: inputFriends.Friendid,
	}

	if err := r.DB.Save(friends).Error; err != nil {
		return nil, err
	}

	swappedFriends := &model.Friend{
		ID:       uuid.NewString(),
		Userid:   inputFriends.Friendid,
		Friendid: inputFriends.Userid,
	}

	if err := r.DB.Save(swappedFriends).Error; err != nil {
		return nil, err
	}

	return friends, nil
}

// CreateFriendRequests is the resolver for the createFriendRequests field.
func (r *mutationResolver) CreateFriendRequests(ctx context.Context, inputRequestFriends model.NewFriendRequests) (*model.FriendRequests, error) {
	friendRequests := &model.FriendRequests{
		ID:          uuid.NewString(),
		Userid:      inputRequestFriends.Userid,
		Requesterid: inputRequestFriends.Requesterid,
	}
	return friendRequests, r.DB.Save(&friendRequests).Error
}

// DeleteFriendRequests is the resolver for the deleteFriendRequests field.
func (r *mutationResolver) DeleteFriendRequests(ctx context.Context, id string) (*model.FriendRequests, error) {
	var request *model.FriendRequests
	if err := r.DB.First(&request, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return request, r.DB.Delete(&request).Error
}

// GetAllFriendRequestsByUserID is the resolver for the getAllFriendRequestsByUserId field.
func (r *queryResolver) GetAllFriendRequestsByUserID(ctx context.Context, userid string) ([]*model.FriendRequests, error) {
	var friendRequests []*model.FriendRequests
	return friendRequests, r.DB.Where("userid = ?", userid).Find(&friendRequests).Error
}

// GetAllFriendSuggestionByUserID is the resolver for the getAllFriendSuggestionByUserId field.
func (r *queryResolver) GetAllFriendSuggestionByUserID(ctx context.Context, userid string) ([]*model.User, error) {
	// Get the user's friends
	var userFriends []*model.Friend
	if err := r.DB.Where("userid = ?", userid).Find(&userFriends).Error; err != nil {
		return nil, err
	}

	// Get the user's friend IDs
	var friendIDs []string
	for _, friend := range userFriends {
		friendIDs = append(friendIDs, friend.Friendid)
	}

	// Get the friends of the user's friends
	var friendsOfFriends []*model.Friend
	if err := r.DB.Where("userid IN ?", friendIDs).Find(&friendsOfFriends).Error; err != nil {
		return nil, err
	}

	// Filter out friends of the user and friends of friends
	suggestedFriendIDs := make(map[string]bool)
	for _, fof := range friendsOfFriends {
		if fof.Friendid != userid && !contains(friendIDs, fof.Friendid) {
			suggestedFriendIDs[fof.Friendid] = true
		}
	}

	// Get the details of suggested friends
	var suggestedFriends []*model.User
	if err := r.DB.Where("id IN ?", keys(suggestedFriendIDs)).Find(&suggestedFriends).Error; err != nil {
		return nil, err
	}

	return suggestedFriends, nil
}

// GetFriendCountByUserID is the resolver for the getFriendCountByUserId field.
func (r *queryResolver) GetFriendCountByUserID(ctx context.Context, userid string) (int, error) {
	var friendcount int64
	if err := r.DB.Model(&model.Friend{}).Where("userid = ?", userid).Count(&friendcount).Error; err != nil {
		return 0, err
	}
	return int(friendcount), nil
}

// GetAllFriendByUserID is the resolver for the getAllFriendByUserId field.
func (r *queryResolver) GetAllFriendByUserID(ctx context.Context, userid string) ([]*model.User, error) {
	var userFriends []*model.Friend
	if err := r.DB.Where("userid = ?", userid).Find(&userFriends).Error; err != nil {
		return nil, err
	}

	var friendIDs []string
	for _, friend := range userFriends {
		friendIDs = append(friendIDs, friend.Friendid)
	}

	var users []*model.User
	if err := r.DB.Where("id IN (?)", friendIDs).Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

// GetAllFriendByUserIDWithStory is the resolver for the getAllFriendByUserIdWithStory field.
func (r *queryResolver) GetAllFriendByUserIDWithStory(ctx context.Context, userid string) ([]*model.User, error) {
	var userFriends []*model.Friend
	if err := r.DB.Where("userid = ?", userid).Find(&userFriends).Error; err != nil {
		return nil, err
	}

	var friendIDs []string
	for _, friend := range userFriends {
		var storyCount int64
		if err := r.DB.Model(&model.Story{}).Where("userid IN (?)", friend.Friendid).Count(&storyCount).Error; err != nil {
			return nil, err
		}

		if storyCount != 0 {
			friendIDs = append(friendIDs, friend.Friendid)
		}

	}

	var users []*model.User
	if err := r.DB.Where("id IN (?)", friendIDs).Find(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

// CheckFriendByUserid is the resolver for the checkFriendByUserid field.
func (r *queryResolver) CheckFriendByUserid(ctx context.Context, userid string, friendid string) (bool, error) {
	var friend model.Friend
	err := r.DB.Model(&friend).
		Where("userid = ?", userid).
		Where("friendid = ?", friendid).
		First(&friend).Error

	if err != nil {
		return false, nil
	}

	return true, nil
}

// CheckFriendRequestByUserid is the resolver for the checkFriendRequestByUserid field.
func (r *queryResolver) CheckFriendRequestByUserid(ctx context.Context, userid string, requesterid string) (bool, error) {
	var friend model.FriendRequests
	err := r.DB.Model(&friend).
		Where("userid = ?", userid).
		Where("requesterid = ?", requesterid).
		First(&friend).Error

	if err != nil {
		return false, nil
	}

	return true, nil
}

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
func keys(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}