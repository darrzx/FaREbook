import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import React from "react";
import { useEffect, useState } from "react"
import { AiFillLike } from "react-icons/ai";
import { BsPersonCircle } from "react-icons/bs";
import { FaGreaterThan, FaLessThan, FaRegCommentAlt, FaShare } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useParams } from "react-router-dom";
import { getCurrentUser } from "../component/getCurrentUser";
import PostCarousel from "../component/postCarousel";
import '../styles/profile.css';
import ReelsEach from "./reelsEach";
import Axios from 'axios';

const GET_USER_QUERY = gql`
  query GetUser($id:ID!){
    getUser(id:$id){
        id
        firstname
        surname
        email
        dob
        gender
        profilepic
        isActive
      }
    }
`;

const GET_FRIEND_COUNT_QUERY = gql`
    query GetFriendCountByUserID($userid:ID!){
        getFriendCountByUserId(userid: $userid)
    }
`;

const GET_SUGGESTIONS_QUERY = gql`
  query GetAllFriendSuggestionByUserID($userid:ID!){
    getAllFriendSuggestionByUserId(userid: $userid) {
        id
        firstname
        surname
        email
        dob
        gender
        profilepic
    }
  }
`;

const GET_ALL_POST_BY_USERID_QUERY = gql`
    query GetAllPostByUserID($userid:ID!){
        getAllPostByUserId(userid: $userid) {
            id
            userid
            username
            date
            text
            privacy
            commentcount
            likecount
        }
    }
`;

const GET_ALL_USER_QUERY = gql`
  query GetAllUser{
    getAllUser {
      id
      firstname
      surname
      email
      dob
      gender
      profilepic
      isActive
    }
  }
`;

const GET_ALL_MEDIA_POST_QUERY = gql`
  query GetAllMediaByPostID($id:ID!){
    getAllMediaByPostId(id: $id) {
      id
      postid
      media
    }
  }
`;

const CREATE_LIKE_POST_MUTATION = gql`
  mutation CreateLike($inputLikePost: NewLikePost!) {
    createLike(inputLikePost: $inputLikePost) {
      id
      postid
      userid
      username
      isLike
    }
  }
`;

const GET_ALL_LIKE_QUERY = gql`
  query GetAllLike{
    getAllLike {
      id
      postid
      userid
      username
      isLike
    }
  }
`;

const GET_ALL_COMMENT_POST_QUERY = gql`
  query GetAllCommentByPostID($id:ID!){
    getAllCommentByPostId(id: $id) {
      id
      postid
      userid
      username
      comment
      date
      replycount
      likecommentcount
    }
  }
`;

const GET_ALL_REPLY_COMMENT_QUERY = gql`
  query GetAllReplyByCommentID($id:ID!){
    getAllReplyByCommentId(id: $id) {
      id
      commentid
      userid
      username
      replycomment
      date
    }
  }
`;

const CREATE_REPLY_COMMENT_MUTATION = gql`
  mutation CreateReply($inputReplyPost: NewReplyPost!) {
    createReply(inputReplyPost: $inputReplyPost) {
      id
      commentid
      userid
      replycomment
      date
    }
  }
`;

const CREATE_COMMENT_POST_MUTATION = gql`
  mutation CreateCommentPost($inputCommentPost: NewCommentPost!) {
    createCommentPost(inputCommentPost: $inputCommentPost) {
      id
      postid
      userid
      username
      comment
      date
    }
  }
`;

const GET_ALL_FRIEND_QUERY = gql`
    query GetAllFriendByUserID($userid:ID!){
        getAllFriendByUserId(userid: $userid) {
            id
            firstname
            surname
            email
            dob
            gender
            profilepic
            isActive
        }
    }
`;

const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id:ID!){
    deletePost(id:$id){
      id
      userid
      username
      date
      text
      privacy
      commentcount
      likecount
    }
  }
`;

const GET_ALL_REELS_QUERY = gql`
    query GetAllReelsByUserID($userid:ID!){
        getAllReelsByUserId(userid: $userid) {
            id
            userid
            username
            video
            text
            date
        }
    }
`;

const CHECK_FRIEND_QUERY = gql`
    query CheckFriendByUserid($userid: String!, $friendid:String!){
      checkFriendByUserid(userid: $userid, friendid: $friendid) 
    }
`;

const CHECK_FRIEND_REQUEST_QUERY = gql`
    query CheckFriendRequestByUserid($userid: String!, $requesterid:String!){
      checkFriendRequestByUserid(userid: $userid, requesterid: $requesterid) 
    }
`;

const CREATE_FRIEND_REQUEST_MUTATION = gql`
    mutation CreateFriendRequests($inputRequestFriends: NewFriendRequests!) {
        createFriendRequests(inputRequestFriends: $inputRequestFriends) {
            id
            userid
            requesterid
        }
    }
`; 

const CREATE_LIKE_COMMENT_MUTATION = gql`
  mutation CreateLikeComment($inputLikeComment: NewLikeComment!) {
    createLikeComment(inputLikeComment: $inputLikeComment) {
      id
      commentid
      userid
      username
      isLike
    }
  }
`;

const GET_ALL_LIKE_COMMENT_QUERY = gql`
  query GetAllLikeComment{
    getAllLikeComment {
      id
      commentid
      userid
      username
      isLike
    }
  }
`;

const UPDATE_USER_PROFILE_MUTATION = gql`
    mutation UpdateUserProfilepic($id:ID!, $profilepic:String!){
        updateUserProfilepic(id:$id, profilepic: $profilepic){
            id
            firstname
            surname
            email
            dob
            gender
            profilepic
            isActive
        }
    }
`;

const Profile = () => {
    const apolloClient = useApolloClient();
    const { userId } = useParams();
    const currUser = getCurrentUser();
    const currentUserId = currUser?.getUserIdByToken?.id;
    const [activeLink, setActiveLink] = useState("Posts");
    const [postMediaMap, setPostMediaMap] = useState<{ postId: string; medias: string[] }[]>([]);
    const [createLikePostMutation] = useMutation(CREATE_LIKE_POST_MUTATION);
    const [createReplyCommentMutation] = useMutation(CREATE_REPLY_COMMENT_MUTATION);
    const [createCommentPostMutation] = useMutation(CREATE_COMMENT_POST_MUTATION);
    const [deletePostMutation] = useMutation(DELETE_POST_MUTATION);
    const [createFriendRequestMutation] = useMutation(CREATE_FRIEND_REQUEST_MUTATION);
    const [createLikeCommentMutation] = useMutation(CREATE_LIKE_COMMENT_MUTATION);
    const [updateUserProfileMutation] = useMutation(UPDATE_USER_PROFILE_MUTATION);

    const [isCommentPostOpen, setIsCommentPostOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>();
    const [isRefetch, setIsRefetch] = useState(true);
    const [isReplyCommentOpen, setIsReplyCommentOpen] = useState(false);
    const [postCommentMap, setPostCommentMap] = useState<any>([]);
    const [selectedComment, setSelectedComment] = useState<any>();
    const [postReplyMap, setPostReplyMap] = useState<any>([]);
    const [textReply, setTextReply] = useState("");
    const [textComment, setTextComment] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedPhoto, setSelectedPhoto] = useState<any>([]);

    const { loading, error, data, refetch: refetchDataUser} =  useQuery(GET_USER_QUERY, {
        variables: { id: userId },
    })
    const user = data?.getUser || [];

    const { loading: loadingFriendCount, error: errorFriendCount, data: dataFriendCount} =  useQuery(GET_FRIEND_COUNT_QUERY, {
        variables: { userid: userId },
    })
    const friendcount = dataFriendCount?.getFriendCountByUserId || [];

    const { loading: loadingAllSuggestions, error: errorAllSuggestions, data: dataAllSuggestions, refetch: refetchDataSuggestions} =  useQuery(GET_SUGGESTIONS_QUERY, {
        variables: { userid: currentUserId },
    })
    const suggestions = dataAllSuggestions?.getAllFriendSuggestionByUserId || [];

    const { loading: loadingAllPost, error: errorAllPost, data: dataAllPost, refetch: refetchDataPost} =  useQuery(GET_ALL_POST_BY_USERID_QUERY, {
        variables: { userid: userId },
    })
    const posts = dataAllPost?.getAllPostByUserId || [];

    const { loading: loadingAllLike, error: errorAllLike, data: dataAllLike, refetch: refetchDataLike} =  useQuery(GET_ALL_LIKE_QUERY)
    const likes = dataAllLike?.getAllLike || [];

    const { loading: loadingAllUser, error: errorAllUser, data: dataAllUser} =  useQuery(GET_ALL_USER_QUERY)
    const users = dataAllUser?.getAllUser || [];

    const { loading: loadingAllFriend, error: errorAllFriend, data: dataAllFriend} =  useQuery(GET_ALL_FRIEND_QUERY, {
        variables: { userid: userId },
    })
    const friends = dataAllFriend?.getAllFriendByUserId || [];

    const { loading: loadingAllReels, error: errorAllReels, data: dataAllReels} =  useQuery(GET_ALL_REELS_QUERY, {
        variables: { userid: userId },
    })
    const reels = dataAllReels?.getAllReelsByUserId || [];

    const { loading: loadingCheckFriend, error: errorCheckFriend, data: dataCheckFriend, refetch: refetchDataFriend} =  useQuery(CHECK_FRIEND_QUERY, {
      variables: { userid: currentUserId, friendid: userId },
    })
    const checkResult = dataCheckFriend?.checkFriendByUserid;

    const { loading: loadingCheckFriendRequest, error: errorCheckFriendRequest, data: dataCheckFriendRequest, refetch: refetchDataRequest} =  useQuery(CHECK_FRIEND_REQUEST_QUERY, {
      variables: { userid: userId, requesterid: currentUserId },
    })
    const checkResultRequest = dataCheckFriendRequest?.checkFriendRequestByUserid;

    const { loading: loadingAllLikeComment, error: errorAllLikeComment, data: dataAllLikeComment, refetch: refetchDataLikeComment} =  useQuery(GET_ALL_LIKE_COMMENT_QUERY)
    const likesComment = dataAllLikeComment?.getAllLikeComment || [];

    async function fetchMediaForPost(postId: any) {
        try {
          await apolloClient.query({
            query: GET_ALL_MEDIA_POST_QUERY,
            variables: { id: postId },
          }).then(async response => {
            if (!response.error) {
              if (!postMediaMap.some(media => media.postId === postId)) {
                setPostMediaMap(prevMedias => [
                  ...prevMedias,
                  { postId: postId, medias: response.data.getAllMediaByPostId.map((media:any) => media.media) },
                ]);
              }
            }
          });
        } catch (error) {
          console.error("Error fetching mediaa:", error);
          return [];
        }
    }
  
    useEffect(() => {
    if(posts){
        for (const post of posts) {
        fetchMediaForPost(post.id);
        } 
    }
    }, [posts, user]);

    useEffect(() => {
        if(selectedPost && isRefetch){
          console.log(selectedPost)
          async function fetchCommentForPost(postId: any) {
            try {
              await apolloClient.query({
                query: GET_ALL_COMMENT_POST_QUERY,
                variables: { id: postId },
              }).then(response => {
                if (!response.error) {
                  console.log(response.data.getAllCommentByPostId)
                  setPostCommentMap(response.data.getAllCommentByPostId)
                }
              });
            } catch (error) {
              console.error("Error fetching comentt:", error);
              return [];
            }
          }
          fetchCommentForPost(selectedPost.id);
          setIsRefetch(false)
        }
      }, [selectedPost, isRefetch]);

    useEffect(() => {
        if(selectedComment){
            async function fetchReplyForComment(commentId: any) {
                try {
                    await apolloClient.query({
                    query: GET_ALL_REPLY_COMMENT_QUERY,
                    variables: { id: commentId },
                    }).then(response => {
                    if (!response.error) {
                        console.log(response.data.getAllReplyByCommentId)
                        setPostReplyMap(response?.data.getAllReplyByCommentId)
                    }
                    });
                } catch (error) {
                    console.error("Error fetching comentt:", error);
                    return [];
                }
            }
            fetchReplyForComment(selectedComment);
        }
    }, [selectedComment]);

    const handleLikePost = async (post: Post, isLike : any) => {
        const inputLikePost = {
            postid: post.id,
            userid: data.getUser.id,
            username: data?.getUser.firstname + " " + data?.getUser.surname,
            isLike : isLike
        };
        try {
            const response = await createLikePostMutation({
            variables: {
                inputLikePost: inputLikePost,
            },
            }).then( async () => {
                await refetchDataPost()
                await refetchDataLike()
            });
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleLikeComment = async (comment: CommentPost, isLike : any) => {
      const inputLikeComment = {
        commentid: comment.id,
        userid: data.getUser.id,
        username: data?.getUser.firstname + " " + data?.getUser.surname,
        isLike : isLike
      };

      try {
        const response = await createLikeCommentMutation({
          variables: {
            inputLikeComment: inputLikeComment,
          },
        }).then( async () => {
          await refetchDataPost()
          await refetchDataLikeComment()
        });
      } catch (error) {
        console.error("Error creating post:", error);
      }
    };

    const handleCreateCommentPost = async () => {
        const inputCommentPost = {
          postid: selectedPost.id,
          userid: userId,
          username: data?.getUser.firstname + " " + data?.getUser.surname,
          comment: textComment
        };
  
        try {
          const response = await createCommentPostMutation({
            variables: {
              inputCommentPost: inputCommentPost,
            },
          });
    
          console.log("Comment created:", response.data);
        } catch (error) {
          console.error("Error creating post:", error);
        }
        setTextComment("")
        refetchDataPost()
        setIsRefetch(true);
        closeCommentPost()
      };

    const handleCreateReplyPost = async () => {

        const inputReplyPost = {
          commentid: selectedComment,
          userid: data.getUser.id,
          replycomment: textReply,
          username: data?.getUser.firstname + " " + data?.getUser.surname
        };
  
        try {
          const response = await createReplyCommentMutation({
            variables: {
              inputReplyPost: inputReplyPost,
            },
          });
    
          console.log("reply created:", response.data);
        } catch (error) {
          console.error("Error creating post:", error);
        }
        setTextReply("")
        closeCommentPost()
        refetchDataPost()
    };

    const openCommentPost = async (post: Post) => {
        setIsCommentPostOpen(true)
        setSelectedPost(post)
        setIsRefetch(true)
    };

    const closeCommentPost = () => {
        setIsCommentPostOpen(false)
        setIsReplyCommentOpen(false)
        setSelectedPost("")
        setIsRefetch(false)
    }

    const openReplyPost = async (comment: string) => {
        setIsReplyCommentOpen(!isReplyCommentOpen)
        setSelectedComment(comment)
    };

    const handleMediaChange = async (e: any) => {
      const selectedFiles = e.target.files;
      setSelectedPhoto(selectedFiles);

      const formData = new FormData();
      formData.append("file", selectedFiles[0])
      formData.append("upload_preset","orsgh758")
      let apiUrl = 'https://api.cloudinary.com/v1_1/dnl7josxn/';
      if (selectedFiles[0].type.includes('image')) {
        apiUrl += 'image/upload';
      } 

      let photoUrl;

      try {
        const response = await Axios.post(apiUrl, formData);
        const secureUrl = response.data.secure_url;
        photoUrl = secureUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
      }

      try {
        const { data: dataUpdate } = await updateUserProfileMutation({
            variables: { id: currentUserId, profilepic: photoUrl },
        });

        console.log(dataUpdate.updateUserProfilepic.id);
      } catch (error) {
          console.error("Error uploading file:", error);
      }
      refetchDataUser();
    };

    const handleChangeProfilePicClick = () => {
      const mediaInput = document.getElementById('media-input');
      if (mediaInput) {
        mediaInput.click();
      }
    };

    const handleDeletePost = async (post: Post) => {
        console.log(post)
        try {
          const response = await deletePostMutation({
            variables: {
              id: post.id,
            },
          });
    
          console.log("Post deleted:", response.data);
        } catch (error) {
          console.error("Error creating post:", error);
        }
        refetchDataPost()
    };

    const handleActiveLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else {
          const reelsCount = reels.length;
          setCurrentIndex(reelsCount - 1);
        }
    };

    const nextSlide = () => {
        if (currentIndex < reels.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handleCreateFriendRequest = async () => {
      const inputRequestFriends = {
          userid: userId,
          requesterid: currentUserId,
      };

      try {
          const response = await createFriendRequestMutation({
              variables: {
                  inputRequestFriends: inputRequestFriends,
              },
          });

          console.log("request created:", response.data);
      } catch (error) {
          console.error("Error creating post:", error);
      }
      refetchDataRequest();
    };

    if(!currUser) {
        return null
    }
    
    return (
        <div className="profile-container">
            <div className="profile-container-head">
                <div className="profile-cover-photo">

                </div>
                <div className="profile-user-info">
                    <div className="profile-user-personal">
                        <div className="profile-user-image">
                            <img src={user?.profilepic} alt="" />
                        </div>
                        <div className="profile-user-details">
                            <h1 className="profile-user-name">{user?.firstname + " " + user?.surname}</h1>
                            <h5 className="profile-user-email">{user?.email}</h5>
                            <h5 className="profile-user-dob">{user?.dob}</h5>
                            <h5 className="profile-user-gender">{user?.gender}</h5>
                            <h5 className="profile-user-friendcount">{friendcount} friends</h5>
                        </div>
                    </div>
                    <div className="profile-user-others">
                      {currentUserId !== userId && (
                        !checkResult && (
                          !checkResultRequest ? (
                            <div className="invite-friend-group-button" onClick={handleCreateFriendRequest}>
                              <div className='link-invite-friend-group'>
                                Add Friend
                              </div>
                            </div>
                          ) : (
                            <div className="requested-friend-group-button">
                                <div className='link-invite-friend-group'>
                                    Requested
                                </div>
                            </div>
                          )

                        )
                      )}
                      {currentUserId === userId && (
                        <div className="invite-friend-group-button" onClick={handleChangeProfilePicClick}>
                          <div className='link-invite-friend-group'>
                            Edit Profile Picture
                          </div>
                          <input
                            id="media-input"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            className="media-input"
                            multiple
                            onChange={handleMediaChange} />
                        </div>
                      )}
                    </div>
                </div>
                <div className="profile-user-suggestions">
                    <div className='title-friend-suggestions'>
                        <h3>People You May Know</h3>
                    </div>
                    <div className='profile-suggestions-detail'>
                        {suggestions.map((suggest: User) => (
                            <div className="friend-request-card">
                                <img src={suggest.profilepic} alt="" className="profile-image" />
                                <div className="friend-details">
                                    <h3>{suggest.firstname + " " + suggest.surname}</h3>
                                    <p>2 mutual friends</p>
                                </div>
                                <div className="friend-actions">
                                    <button className="confirm-button">Add Friend</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="profile-user-main">
                    <div className='profile-user-buttons'>
                        <div className={`profile-user-button ${activeLink === 'Posts' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Posts')}>Posts</div>
                        <div className={`profile-user-button ${activeLink === 'Friends' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Friends')}>Friends</div>
                        <div className={`profile-user-button ${activeLink === 'Reels' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Reels')}>Reels</div>
                    </div>
                </div>
            </div>
            <div className="profile-container-body">
                {activeLink === "Posts" && ( 
                posts.map((post: Post) => ( 
                    <div key={post.id}>    
                        <div className="post"> 
                          <div className="post-header-profile">
                            <div className="header-detail-post">
                              {users.map((usr: User) => (
                              usr.id === post.userid && (
                                  <img src={usr?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                              )
                              ))}
                              <div className="user-name">
                                {post.username}
                              </div>
                            </div>
                            <div className="delete-post" onClick={() => handleDeletePost(post)}>
                              <MdDelete size={30} color="grey"/>
                            </div>
                          </div>
                          <div className="post-text" dangerouslySetInnerHTML = {{ __html: post.text}}></div>
                        
                        {postMediaMap.map((media, i) => (
                            media.postId === post.id && (
                            <PostCarousel medias={postMediaMap[i].medias} />
                            )
                        ))}
                        
                        <div className="post-indicator">
                            <div>liked by {post.likecount}</div>
                            <div>{post.commentcount} comments</div>
                        </div>
                            <div className="post-actions">
                            <div className="post-action" onClick={() => handleLikePost(post, likes.some((like: any) => like.postid === post.id && like.userid === data.getUser.id && like.isLike === true))}>
                                <AiFillLike size={30} color={likes.some((like: any) => like.postid === post.id && like.userid === data?.getUser.id && like.isLike === true) ? '#1877f2' : 'grey'} />
                                <button
                                className="action-button"
                                style={{ color: likes.some((like: any) => like.postid === post?.id && like.userid === data?.getUser?.id && like.isLike === true) ? '#1877f2' : 'grey' }}
                                >
                                Like
                                </button>
                            </div>
                            <div className="post-action" onClick={() => openCommentPost(post)}>
                                <FaRegCommentAlt size={30} color="grey"/>
                                <button className="action-button">Comment</button>
                            </div>
                            <div className="post-action">
                                <FaShare size={30} color="grey"/>
                                <button className="action-button">Share</button>
                            </div>
                            </div> 
                        </div>
                    </div>
                ))
                )}
                {isCommentPostOpen && (
                    <div className="overlay">
                        <div className="comment-post-popup">
                        <div className="popup-header">
                            <h2>{selectedPost?.username}'s Posts</h2>
                            <button className="close-button" onClick={closeCommentPost}>
                            &times;
                            </button>
                        </div>

                        <div className="popup-content">
                            {postCommentMap.map((comment: CommentPost) => (
                            <div key={comment.id} className="popup-list">
                                <div className="popup-comment">
                                <div className="comment-header">
                                    <BsPersonCircle size={30} color="grey" />
                                    <div className="comment-header-name">{comment.username}</div>
                                </div>
                                <div className="post-text" dangerouslySetInnerHTML = {{ __html: comment.comment}}></div>
                                </div>

                                <div className="popup-reply">
                                  <div className="reply-like" onClick={() => handleLikeComment(comment, likesComment.some((like: any) => like.commentid === comment.id && like.userid === data.getUser.id && like.isLike === true))}
                                  style={{ color: likesComment.some((like: any) => like.commentid === comment?.id && like.userid === data?.getUser?.id && like.isLike === true) ? '#1877f2' : 'black' }}>{comment.likecommentcount} like</div>
                      
                                  <div className="reply-comment" onClick={() => openReplyPost(comment.id)}>{comment.replycount} reply</div>
                                </div>
                                <div className="reply-view">
                                {isReplyCommentOpen && comment.id === selectedComment && (
                                    <div>
                                    {postReplyMap.map((reply: ReplyPost) => (
                                        comment.id === reply.commentid && (
                                        <div key={reply.id}>
                                        <div className="reply-person">
                                            <div className="comment-header">
                                            <BsPersonCircle size={30} color="grey" />
                                            <div className="comment-header-name">{reply.username}</div>
                                            </div>
                                            <div className="post-text">{reply.replycomment}</div>
                                        </div>
                                        </div>
                                        )
                                        ))}
                                        <input
                                        type="text"
                                        placeholder="What's on your mind?"
                                        className="comment-input"
                                        value={textReply}
                                        onChange={(e) => setTextReply(e.target.value)}
                                        />
                                        <button className="comment-button" onClick={handleCreateReplyPost}>Reply</button>
                                        
                                    </div>
                                )}
                                </div>
                            </div>
                            ))}
                        </div>

                        <div className="popup-input-comment">
                            <input
                            type="text"
                            placeholder="What's on your mind?"
                            className="comment-input"
                            value={textComment}
                            onChange={(e) => setTextComment(e.target.value)}
                            />
                            <button className="comment-button" onClick={handleCreateCommentPost}>Comment</button>
                        </div>
                        </div>
                    </div>
                )}

                <div className="profile-show-friends">
                    {activeLink === "Friends" && (
                        friends.map((friend: User) => (
                            <div className="people-mapping" key={friend.id}>
                                <div className="people-each-card">
                                    <img src={friend.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                                    {friend.firstname + " " + friend.surname}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {activeLink === "Reels" && reels.length > 0 && (
                    <>
                    <div className="reelsuser-main-content">
                        <div className="carousel-prev-reels" onClick={prevSlide}>
                            <FaLessThan />
                        </div>
                        <div className="reelsview-content">
                            {reels.map((reel: Reels, index: number) => (
                            <React.Fragment key={reel.id}>
                                <ReelsEach key={reel.id} reels={reel} isActive={index === currentIndex} />
                            </React.Fragment>
                            ))}
                        </div>
                        <div className="carousel-next" onClick={nextSlide}>
                            <FaGreaterThan />
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;