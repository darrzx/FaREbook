import { gql, useMutation, useQuery, useApolloClient } from "@apollo/client";
import { useEffect, useState } from "react";
import { encryptStorage } from "./auth/login";
import '../styles/home.css';
import { BsCameraReelsFill, BsPersonCircle } from 'react-icons/bs';
import Axios from 'axios';
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { AiFillLike } from 'react-icons/ai';
import { FaRegCommentAlt } from 'react-icons/fa';
import { FaShare } from 'react-icons/fa';
// import { formatDistanceToNow } from 'date-fns';
import PostCarousel from "../component/postCarousel";
import { Link } from "react-router-dom";
import { FaUserFriends } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { AiFillPicture } from 'react-icons/ai';
import LoadingAnimation from "../component/loadingAnimation";


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

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($inputPost: NewPost!, $medias: [String!]!) {
    createPost(inputPost: $inputPost, medias: $medias) {
      id
      userid
      username
      text
      privacy
    }
  }
`;

const GET_ALL_POST_QUERY = gql`
query GetAllPost($offset:Int!, $limit:Int!){
  getAllPost(offset: $offset, limit: $limit) {
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

const GET_ALL_MEDIA_POST_QUERY = gql`
  query GetAllMediaByPostID($id:ID!){
    getAllMediaByPostId(id: $id) {
      id
      postid
      media
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

const CREATE_NOTIF_MUTATION = gql`
    mutation CreateNotification($inputNotification:NewNotification!){
        createNotification(inputNotification:$inputNotification){
            id
            userid
            username
            text
        }
    }
`;

export function Home(){
    // const currUser = getCurrentUser()
    // console.log(currUser.getUserIdByToken)
    const apolloClient = useApolloClient();
    const [tokenTest, setTokenTest] = useState<any>("");
    const [idUser, setIdUser] = useState<any>("");
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isCommentPostOpen, setIsCommentPostOpen] = useState(false);
    const [isReplyCommentOpen, setIsReplyCommentOpen] = useState(false);
    const [isRefetch, setIsRefetch] = useState(true);

    const [selectedPost, setSelectedPost] = useState<any>();
    const [selectedComment, setSelectedComment] = useState<any>();
    const [itemsLoaded, setItemsLoaded] = useState(5);

    const [selectedMedia, setSelectedMedia] = useState<any>([]);
    const [textPost, setTextPost] = useState("");
    const [textComment, setTextComment] = useState("");
    const [textReply, setTextReply] = useState("");
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(5);
    const [totalCount, setTotalCount] = useState(0);
    const [privacyPost, setPrivacyPost] = useState("public");
    const [postMediaMap, setPostMediaMap] = useState<{ postId: string; medias: string[] }[]>([]);
    const [postCommentMap, setPostCommentMap] = useState<any>([]);
    const [postReplyMap, setPostReplyMap] = useState<any>([]);
    const [errorMessage, setErrorMessage] = useState<string>(''); 
    const [loadingAnimation, setLoadingAnimation] = useState(false);

    const { loading, error, data} =  useQuery(GET_USER_QUERY, {
      variables: { id: idUser },
    })
    const user = data?.getUser || [];

    const { loading: loadingAllUser, error: errorAllUser, data: dataAllUser} =  useQuery(GET_ALL_USER_QUERY)
    const users = dataAllUser?.getAllUser || [];

    const [createPostMutation] = useMutation(CREATE_POST_MUTATION);
    const [createCommentPostMutation] = useMutation(CREATE_COMMENT_POST_MUTATION);
    const [createLikePostMutation] = useMutation(CREATE_LIKE_POST_MUTATION);
    const [createReplyCommentMutation] = useMutation(CREATE_REPLY_COMMENT_MUTATION);
    const [createLikeCommentMutation] = useMutation(CREATE_LIKE_COMMENT_MUTATION);
    const [createNotifMutation] = useMutation(CREATE_NOTIF_MUTATION);

    const { loading: loadingAllPost, error: errorAllPost, data: dataAllPost, refetch: refetchDataPost, fetchMore} =  useQuery(GET_ALL_POST_QUERY, {
      variables: { offset: offset, limit: limit },
    })

    const { loading: loadingAllLike, error: errorAllLike, data: dataAllLike, refetch: refetchDataLike} =  useQuery(GET_ALL_LIKE_QUERY)

    const posts = dataAllPost?.getAllPost || [];
    const likes = dataAllLike?.getAllLike || [];

    const { loading: loadingAllLikeComment, error: errorAllLikeComment, data: dataAllLikeComment, refetch: refetchDataLikeComment} =  useQuery(GET_ALL_LIKE_COMMENT_QUERY)
    const likesComment = dataAllLikeComment?.getAllLikeComment || [];

    useEffect(() => {
      if(encryptStorage.getItem("jwtToken")){
        setTokenTest(encryptStorage.getItem("jwtToken")) 
        setIdUser(encryptStorage.getItem("idUser")) 
      }
      else{
        window.location.href = '/login'
      }
    }, [])

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

    const openCreatePost = () => {
      setIsCreatePostOpen(!isCreatePostOpen)
      setPrivacyPost("public")
      setTextPost("")
      setSelectedMedia("")
      setErrorMessage("")
    };

    const openCommentPost = async (post: Post) => {
      setIsCommentPostOpen(true)
      setSelectedPost(post)
      setIsRefetch(true)
    };

    const openReplyPost = async (comment: string) => {
      setIsReplyCommentOpen(!isReplyCommentOpen)
      setSelectedComment(comment)
    };

    useEffect(() => {
      if(postReplyMap){
        console.log(postReplyMap)
        
      }
    }, [postReplyMap]);

    const closeCommentPost = () => {
      setIsCommentPostOpen(false)
      setIsReplyCommentOpen(false)
      setSelectedPost("")
      setIsRefetch(false)
    }

    const addSelectedMedia = (file: any) => {
      for(const media of file){
        if(selectedMedia.length < 10){
          setSelectedMedia((prevMedia: any) => [
            ...prevMedia,
            media,
          ]);
        }
      }
    };

    const removeSelectedMedia = (index: any) => {
      setSelectedMedia((prevMedia: any) => {
        const updatedMedia = [...prevMedia];
        updatedMedia.splice(index, 1);
        return updatedMedia;
      });
    };

    const handlePrivacyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPrivacyPost(event.target.value);
    };

    const handleCreatePost = async () => {
      if (textPost === "" || textPost.length <= 0 || textPost === '<p><br></p>') {
        setErrorMessage("Text cannot be empty!");
        return;
      }

      const inputPost = {
        userid: idUser,
        username: data?.getUser.firstname + " " + data?.getUser.surname,
        text: textPost,
        privacy: privacyPost, 
      };

      let mediaUrls: string[] = []

      for (const file of selectedMedia) {
        const formData = new FormData();
        formData.append("file", file)
        formData.append("upload_preset","orsgh758")

        let apiUrl = 'https://api.cloudinary.com/v1_1/dnl7josxn/';
        if (file.type.includes('image')) {
          apiUrl += 'image/upload';
        } else if (file.type.includes('video')) {
          apiUrl += 'video/upload';
        } else {
          console.log(`Unsupported file type: ${file.type}`);
          continue;
        }
      
        try {
          const response = await Axios.post(apiUrl, formData);
          const secureUrl = response.data.secure_url;
          mediaUrls.push(secureUrl);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
  
      try {
        const response = await createPostMutation({
          variables: {
            inputPost: inputPost,
            medias: mediaUrls,
          },
        });
  
        console.log("Post created:", response.data.createPost);
      } catch (error) {
        console.error("Error creating post:", error);
      }
  
      setIsCreatePostOpen(false);
      refetchDataPost()
      setPrivacyPost("public")
      setTextPost("")
    };

    const handleCreateCommentPost = async () => {
      const inputCommentPost = {
        postid: selectedPost.id,
        userid: idUser,
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

      const inputNotification = {
          userid: selectedPost.userid,
          username: user.firstname + " " + user.surname,
          text: user.firstname + " " + user.surname + " commented on your post",
      };

      try {
          const response = await createNotifMutation({
              variables: {
                  inputNotification: inputNotification,
              },
          });
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

      const inputNotification = {
        userid: selectedPost.userid,
        username: user.firstname + " " + user.surname,
        text: user.firstname + " " + user.surname + " replied on your post's comment",
      };

      try {
          const response = await createNotifMutation({
              variables: {
                  inputNotification: inputNotification,
              },
          });
      } catch (error) {
          console.error("Error creating post:", error);
      }

      setTextReply("")
      closeCommentPost()
      refetchDataPost()
    };

    const handleLikePost = async (post: Post, isLike : any) => {
      const inputNotification = {
        userid: post.userid,
        username: user.firstname + " " + user.surname,
        text: user.firstname + " " + user.surname + " liked on your post",
      };

      try {
          const response = await createNotifMutation({
              variables: {
                  inputNotification: inputNotification,
              },
          });
      } catch (error) {
          console.error("Error creating post:", error);
      }

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

    window.onscroll = async function (ev) { 
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) { 
    
          if (posts.length < itemsLoaded) { 
            return;
          }else{ 
            setLoadingAnimation(true);
            const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
            setItemsLoaded(itemsLoaded + 5);
            // setScrollPosition(currentPosition);
            await fetchMore({
              variables: {  offset: itemsLoaded, limit: limit },
              updateQuery: (prev, { fetchMoreResult }) => {
                // console.log(itemsLoaded)
                if (!fetchMoreResult) return prev;
                return {
                  getAllPost: [...prev.getAllPost, ...fetchMoreResult.getAllPost],
                };
              },
            });
            setLoadingAnimation(false);
          }
        }
      }

    return (
      <div className="home-container">

        <div className="left-sidebar">
          <div className="profile-info">
            <div className="home-icon-profile">
              <img src={user?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
            </div>
            <div className="profile-details">
              <h2>{data?.getUser.firstname + " " + data?.getUser.surname}</h2>
            </div>
          </div>

          <div className="sidebar-links">
            <div className="sidebar-link">
              <Link to="/friends" className="sidebar-link-content"> 
                <FaUserFriends size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
              </Link>
              <Link to="/friends" className="sidebar-link-content">
                <div>Friends</div>
              </Link>
            </div>
            <div className="sidebar-link">
              <Link to="/group" className="sidebar-link-content"> 
                <HiUserGroup size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
              </Link>
              <Link to="/group" className="sidebar-link-content">
                <div>Groups</div>
              </Link>
            </div>
            <div className="sidebar-link">  
              <Link to="/storyView" className="sidebar-link-content">
                <AiFillPicture size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
              </Link>
              <Link to="/storyView" className="sidebar-link-content">
                <div>Story</div>
              </Link>
            </div>
            <div className="sidebar-link">  
              <Link to="/reelsView" className="sidebar-link-content">
                <BsCameraReelsFill size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
              </Link>
              <Link to="/reelsView" className="sidebar-link-content">
                <div>Reels</div>
              </Link>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="feed">

            <div className="story-reels">
              <div className="box-header">
                <Link to="/story" className="header-content-story">
                  <div>Stories</div>
                </Link>
                <Link to="/reels" className="header-content-reels">
                  <div>Reels</div>
                </Link>
              </div>
            </div>

            <div className="create-post">
              <div className="home-icon-profile">
                <img src={user?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px', marginTop: '8px' }} />
              </div>
              <input type="text" placeholder="What's on your mind?" className="post-input" onClick={openCreatePost}/>
              {isCreatePostOpen && (
                <div className="overlay">
                  <div className="create-post-popup">
                    <div className="popup-header">
                      <h2>Create Post</h2>
                      <button onClick={openCreatePost} className="close-button">
                        &times;
                      </button>
                    </div>

                    <div className="popup-content">

                      <div className="user-info">
                        <img src={user?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                        <span className="user-name">
                          {data?.getUser.firstname} {data?.getUser.surname}
                        </span>
                        <div className="post-privacy-dropdown">
                          <select className="privacy-select" 
                          value={privacyPost}
                          onChange={handlePrivacyChange}>
                            <option value="public">Public</option>
                            <option value="friends">Friends</option>
                            <option value="specificFriends">Specific Friends</option>
                          </select>
                        </div>
                      </div>

                      <ReactQuill
                          value={textPost}
                          onChange={setTextPost}
                          placeholder="What's on your mind?"
                          theme="snow"
                          className="input-richtext"
                      />
                      {selectedMedia.length > 0 && (
                        <div className="selected-media-container">
                          {selectedMedia.map((media:any, index: number) => (
                            <div key={index} className="selected-media">
                              {media.type.startsWith("image/") ? (
                                <img src={URL.createObjectURL(media)} alt={`Selected Media ${index}`} />
                              ) : (
                                <video controls>
                                  <source src={URL.createObjectURL(media)} type={media.type} />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                              <button onClick={() => removeSelectedMedia(index)} className="remove-media-button">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="media-input-container">
                        <label htmlFor="media-input" className="media-input-label">
                          <span>📷</span> Photo/Video
                        </label>
                        <input
                          id="media-input"
                          type="file"
                          // accept="image/*, video/*"
                          accept=".jpg, .jpeg, .png, .gif, .bmp, .webp, .mp4, .mov, .avi, .flv, .mkv, .webm"
                          className="media-input"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              addSelectedMedia(e.target.files);
                            }
                          }}
                        />
                      </div>
                      {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}
                      <button className="post-button" onClick={handleCreatePost}>Post</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {posts.map((post: Post) => ( 
                <div key={post.id}>    
                  <div className="post"> 
                    <div className="post-header">
                      {users.map((usr: User) => (
                        usr.id === post.userid && (
                          <img className="post-header-image" src={usr?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                        )
                      ))}
                      <div className="user-name">
                        {post.username}
                      </div>
                      <div className="additional-info">
                        <div className="information-details">
                          {users.map((usr: User) => (
                            usr.id === post.userid && (
                              <>
                              <div className="post-header-content">
                                <img className="post-header-image" src={usr?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                                <h4>{usr?.firstname + " " + usr?.surname}</h4>
                              </div>
                              <h5>{usr?.email}</h5>
                              <h5>{usr?.dob}</h5>
                              <h5>{usr?.gender}</h5>
                              </>
                            )
                          ))}
                        </div>
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
              ))}
            
          </div>
        </div>

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

        <div className="right-sidebar">
          <div className="contacts">
            <h2>Contacts</h2>
          </div>
        </div>
        <LoadingAnimation loading={loadingAnimation} />
      </div>
    )
}