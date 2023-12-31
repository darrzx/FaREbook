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

// CreatePost is the resolver for the createPost field.
func (r *mutationResolver) CreatePost(ctx context.Context, inputPost model.NewPost, medias []string) (*model.Post, error) {
	post := &model.Post{
		ID:           uuid.NewString(),
		Userid:       inputPost.Userid,
		Username:     inputPost.Username,
		Date:         time.Now().Format("2006-01-02"),
		Text:         inputPost.Text,
		Privacy:      inputPost.Privacy,
		Commentcount: 0,
		Likecount:    0,
	}

	if err := r.DB.Save(&post).Error; err != nil {
		return nil, err
	}

	if len(medias) > 0 {
		for _, media := range medias {
			inputMediaPost := model.NewMediaPost{
				Postid: post.ID,
				Media:  media,
			}
			if _, err := r.CreateMediaPost(ctx, inputMediaPost); err != nil {
				return nil, err
			}
		}
	}

	return post, nil
}

// CreateMediaPost is the resolver for the createMediaPost field.
func (r *mutationResolver) CreateMediaPost(ctx context.Context, inputMediaPost model.NewMediaPost) (*model.MediaPost, error) {
	mediaPost := &model.MediaPost{
		ID:     uuid.NewString(),
		Postid: inputMediaPost.Postid,
		Media:  inputMediaPost.Media,
	}
	return mediaPost, r.DB.Save(&mediaPost).Error
}

// CreateCommentPost is the resolver for the createCommentPost field.
func (r *mutationResolver) CreateCommentPost(ctx context.Context, inputCommentPost model.NewCommentPost) (*model.CommentPost, error) {
	commentPost := &model.CommentPost{
		ID:               uuid.NewString(),
		Postid:           inputCommentPost.Postid,
		Userid:           inputCommentPost.Userid,
		Username:         inputCommentPost.Username,
		Comment:          inputCommentPost.Comment,
		Date:             time.Now().Format("2006-01-02"),
		Replycount:       0,
		Likecommentcount: 0,
	}
	return commentPost, r.DB.Save(&commentPost).Error
}

// DeletePost is the resolver for the deletePost field.
func (r *mutationResolver) DeletePost(ctx context.Context, id string) (*model.Post, error) {
	var post *model.Post
	if err := r.DB.First(&post, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return post, r.DB.Delete(&post).Error
}

// GetPost is the resolver for the getPost field.
func (r *queryResolver) GetPost(ctx context.Context, id string) (*model.Post, error) {
	panic(fmt.Errorf("not implemented: GetPost - getPost"))
}

// GetAllPost is the resolver for the getAllPost field.
func (r *queryResolver) GetAllPost(ctx context.Context, offset *int, limit *int) ([]*model.Post, error) {
	var posts []*model.Post

	// Apply limit and offset to the database query
	query := r.DB
	if limit != nil {
		query = query.Limit(*limit)
	}
	if offset != nil {
		query = query.Offset(*offset)
	}

	if err := query.Find(&posts).Error; err != nil {
		return nil, err
	}

	fetchPosts := make([]*model.Post, 0, len(posts))

	for _, post := range posts {
		fetchPost := &model.Post{
			ID:           post.ID,
			Userid:       post.Userid,
			Username:     post.Username,
			Date:         post.Date,
			Text:         post.Text,
			Privacy:      post.Privacy,
			Commentcount: 0,
			Likecount:    0,
		}

		var commentcount int64
		if err := r.DB.Model(&model.CommentPost{}).Where("postid = ?", post.ID).Count(&commentcount).Error; err != nil {
			return nil, err
		}

		fetchPost.Commentcount = int(commentcount)

		var likecount int64
		if err := r.DB.Model(&model.LikePost{}).Where("postid = ? AND is_like = ?", post.ID, true).Count(&likecount).Error; err != nil {
			return nil, err
		}

		fetchPost.Likecount = int(likecount)

		fetchPosts = append(fetchPosts, fetchPost)
	}

	return fetchPosts, nil
}

// GetAllMediaByPostID is the resolver for the getAllMediaByPostId field.
func (r *queryResolver) GetAllMediaByPostID(ctx context.Context, id string) ([]*model.MediaPost, error) {
	var medias []*model.MediaPost
	return medias, r.DB.Where("postid = ?", id).Find(&medias).Error
}

// GetAllCommentByPostID is the resolver for the getAllCommentByPostId field.
func (r *queryResolver) GetAllCommentByPostID(ctx context.Context, id string) ([]*model.CommentPost, error) {
	var comments []*model.CommentPost
	if err := r.DB.Where("postid = ?", id).Find(&comments).Error; err != nil {
		return nil, err
	}

	fetchComments := make([]*model.CommentPost, 0, len(comments))

	for _, comment := range comments {
		fetchComment := &model.CommentPost{
			ID:               comment.ID,
			Postid:           comment.Postid,
			Userid:           comment.Userid,
			Username:         comment.Username,
			Comment:          comment.Comment,
			Date:             comment.Date,
			Replycount:       0,
			Likecommentcount: 0,
		}

		var replycount int64
		if err := r.DB.Model(&model.ReplyPost{}).Where("commentid = ?", comment.ID).Count(&replycount).Error; err != nil {
			return nil, err
		}

		fetchComment.Replycount = int(replycount)

		var likecommentcount int64
		if err := r.DB.Model(&model.LikeComment{}).Where("commentid = ? AND is_like = ?", comment.ID, true).Count(&likecommentcount).Error; err != nil {
			return nil, err
		}

		fetchComment.Likecommentcount = int(likecommentcount)

		fetchComments = append(fetchComments, fetchComment)
	}

	return fetchComments, nil
}

// GetAllPostByName is the resolver for the getAllPostByName field.
func (r *queryResolver) GetAllPostByName(ctx context.Context, offset *int, limit *int, name *string) ([]*model.Post, error) {
	var posts []*model.Post

	// Apply limit and offset to the database query
	query := r.DB
	if limit != nil {
		query = query.Limit(*limit)
	}
	if offset != nil {
		query = query.Offset(*offset)
	}

	if name != nil && *name != "" {
		query = query.Where("text ILIKE ?", "%"+*name+"%")
	}

	if err := query.Find(&posts).Error; err != nil {
		return nil, err
	}

	fetchPosts := make([]*model.Post, 0, len(posts))

	for _, post := range posts {
		fetchPost := &model.Post{
			ID:           post.ID,
			Userid:       post.Userid,
			Username:     post.Username,
			Date:         post.Date,
			Text:         post.Text,
			Privacy:      post.Privacy,
			Commentcount: 0,
			Likecount:    0,
		}

		var commentcount int64
		if err := r.DB.Model(&model.CommentPost{}).Where("postid = ?", post.ID).Count(&commentcount).Error; err != nil {
			return nil, err
		}

		fetchPost.Commentcount = int(commentcount)

		var likecount int64
		if err := r.DB.Model(&model.LikePost{}).Where("postid = ? AND is_like = ?", post.ID, true).Count(&likecount).Error; err != nil {
			return nil, err
		}

		fetchPost.Likecount = int(likecount)

		fetchPosts = append(fetchPosts, fetchPost)
	}

	return fetchPosts, nil
}

// GetAllPostByUserID is the resolver for the getAllPostByUserId field.
func (r *queryResolver) GetAllPostByUserID(ctx context.Context, userid string) ([]*model.Post, error) {
	var posts []*model.Post

	if err := r.DB.Where("userid = ?", userid).Find(&posts).Error; err != nil {
		return nil, err
	}

	fetchPosts := make([]*model.Post, 0, len(posts))

	for _, post := range posts {
		fetchPost := &model.Post{
			ID:           post.ID,
			Userid:       post.Userid,
			Username:     post.Username,
			Date:         post.Date,
			Text:         post.Text,
			Privacy:      post.Privacy,
			Commentcount: 0,
			Likecount:    0,
		}

		var commentcount int64
		if err := r.DB.Model(&model.CommentPost{}).Where("postid = ?", post.ID).Count(&commentcount).Error; err != nil {
			return nil, err
		}

		fetchPost.Commentcount = int(commentcount)

		var likecount int64
		if err := r.DB.Model(&model.LikePost{}).Where("postid = ? AND is_like = ?", post.ID, true).Count(&likecount).Error; err != nil {
			return nil, err
		}

		fetchPost.Likecount = int(likecount)

		fetchPosts = append(fetchPosts, fetchPost)
	}

	return fetchPosts, nil
}
