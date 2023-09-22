import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { BsPersonCircle } from "react-icons/bs";
import { FaRegCommentAlt, FaShare, FaUserFriends } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import { MdDynamicFeed } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { getCurrentUser } from "../component/getCurrentUser";
import LoadingAnimation from "../component/loadingAnimation";
import PostCarousel from "../component/postCarousel";
import '../styles/search.css';

const GET_ALL_POST_BY_NAME_QUERY = gql`
    query GetAllPostByName($offset:Int!, $limit:Int!, $name:String!){
        getAllPostByName(offset: $offset, limit: $limit, name: $name) {
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

const GET_ALL_USER_BY_NAME_QUERY = gql`
    query GetAllUserByName($name:String!){
        getAllUserByName(name: $name) {
            id
            firstname
            surname
            email
            dob
            gender
            isActive
            profilepic
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

const GET_USER_QUERY = gql`
  query GetUser($id:ID!){
    getUser(id:$id){
        id
        firstname
        surname
        email
        dob
        gender
        isActive
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

const Search = () => {
    const { searchQuery } = useParams();
    const [activeLink, setActiveLink] = useState("Posts");
    const apolloClient = useApolloClient();
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(3);
    const [postMediaMap, setPostMediaMap] = useState<{ postId: string; medias: string[] }[]>([]);
    const [isCommentPostOpen, setIsCommentPostOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>();
    const [postCommentMap, setPostCommentMap] = useState<any>([]);
    const [isReplyCommentOpen, setIsReplyCommentOpen] = useState(false);
    const [selectedComment, setSelectedComment] = useState<any>();
    const [postReplyMap, setPostReplyMap] = useState<any>([]);
    const [textReply, setTextReply] = useState("");
    const [textComment, setTextComment] = useState("");
    const [itemsLoaded, setItemsLoaded] = useState(3);
    const [loadingAnimation, setLoadingAnimation] = useState(false);

    const currUser = getCurrentUser()
    const userId = currUser?.getUserIdByToken?.id;
    const [createLikePostMutation] = useMutation(CREATE_LIKE_POST_MUTATION);
    const [createReplyCommentMutation] = useMutation(CREATE_REPLY_COMMENT_MUTATION);
    const [createCommentPostMutation] = useMutation(CREATE_COMMENT_POST_MUTATION);
    const [createLikeCommentMutation] = useMutation(CREATE_LIKE_COMMENT_MUTATION);

    const { loading: loadingAllPost, error: errorAllPost, data: dataAllPost, refetch: refetchDataPost, fetchMore} =  useQuery(GET_ALL_POST_BY_NAME_QUERY, {
        variables: { offset: offset, limit: limit, name: searchQuery },
    })

    const { loading: loadingAllUser, error: errorAllUser, data: dataAllUser, refetch: refetchDataUser, fetchMore: fetchMoreUser} =  useQuery(GET_ALL_USER_BY_NAME_QUERY, {
        variables: {name: searchQuery },
    })

    const { loading: loadingAllLike, error: errorAllLike, data: dataAllLike, refetch: refetchDataLike} =  useQuery(GET_ALL_LIKE_QUERY)

    const { loading: loadingAllLikeComment, error: errorAllLikeComment, data: dataAllLikeComment, refetch: refetchDataLikeComment} =  useQuery(GET_ALL_LIKE_COMMENT_QUERY)
    const likesComment = dataAllLikeComment?.getAllLikeComment || [];

    const posts = dataAllPost?.getAllPostByName || [];
    const people = dataAllUser?.getAllUserByName || [];
    const likes = dataAllLike?.getAllLike || [];

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
      }, [posts]);

    const handleSidebarLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const handleLikePost = async (post: Post, isLike : any) => {
        const inputLikePost = {
          postid: post.id,
          userid: currUser?.getUserIdByToken.id,
          username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
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

    const openCommentPost = async (post: Post) => {
        setIsCommentPostOpen(true)
        setSelectedPost(post)
    };

    useEffect(() => {
        if(selectedPost){
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
        }
      }, [selectedPost]);

    const closeCommentPost = () => {
        setIsCommentPostOpen(false)
        setIsReplyCommentOpen(false)
    }

    const openReplyPost = async (comment: string) => {
        setIsReplyCommentOpen(!isReplyCommentOpen)
        setSelectedComment(comment)
    };

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

    const handleCreateReplyPost = async () => {

        const inputReplyPost = {
            commentid: selectedComment,
            userid: currUser?.getUserIdByToken.id,
            replycomment: textReply,
            username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname
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

    const handleCreateCommentPost = async () => {
        const inputCommentPost = {
          postid: selectedPost.id,
          userid: currUser?.getUserIdByToken.id,
          username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
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
        closeCommentPost()
      };

      const handleLikeComment = async (comment: CommentPost, isLike : any) => {
        const inputLikeComment = {
          commentid: comment.id,
          userid: userId,
          username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
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
        if (window.innerHeight + window.scrollY > document.body.offsetHeight - 100) { 
      
            if (posts.length < itemsLoaded) { 
              return;
            }else{ 
              setLoadingAnimation(true);
              const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
              setItemsLoaded(itemsLoaded + 3);
              // setScrollPosition(currentPosition);
              await fetchMore({
                variables: {  offset: itemsLoaded, limit: limit },
                updateQuery: (prev, { fetchMoreResult }) => {
                  // console.log(itemsLoaded)
                  if (!fetchMoreResult) return prev;
                  return {
                    getAllPostByName: [...prev.getAllPostByName, ...fetchMoreResult.getAllPostByName],
                  };
                },
              });
              setLoadingAnimation(false);
            }
          }
        }

    if(!currUser) return null

    return (
        <div className="search-container">
            <div className="search-left-sidebar">
                <div className="icon-info">
                    <h2>Search Result</h2>
                </div>
                <div className="search-left-menus">
                    <div className={`sidebar-link ${activeLink === 'Posts' ? "sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Posts')}>
                        <MdDynamicFeed size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div >Posts</div>
                    </div>
                    <div className={`sidebar-link ${activeLink === 'People' ? "sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('People')}>  
                        <FaUserFriends size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div>People</div>
                    </div>
                    <div className={`sidebar-link ${activeLink === 'Groups' ? "sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Groups')}>
                        <HiUserGroup size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div >Groups</div>
                    </div>
                </div>
            </div>

            <div className="search-main-content">
                <div className="all-container">
                    {activeLink === "Posts" && (
                        posts.map((post: Post) => ( 
                            <div key={post.id}>    
                              <div className="post">
                                <div className="post-header">
                                  <BsPersonCircle size={30} color="grey" />
                                  <div className="user-name">
                                    {post.username}
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
                                    <div className="post-action" onClick={() => handleLikePost(post, likes.some((like: any) => like.postid === post.id && like.userid === currUser?.getUserIdByToken.id && like.isLike === true))}>
                                      <AiFillLike size={30} color={likes.some((like: any) => like.postid === post.id && like.userid === currUser?.getUserIdByToken.id && like.isLike === true) ? '#1877f2' : 'grey'} />
                                      <button
                                        className="action-button"
                                        style={{ color: likes.some((like: any) => like.postid === post?.id && like.userid === currUser?.getUserIdByToken.id && like.isLike === true) ? '#1877f2' : 'grey' }}
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
                    {activeLink === "People" && (
                        people.map((person: User) => (
                            <div className="people-mapping" key={person.id}>
                                <div className="people-each-card">
                                <img src={person.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                                    {person.firstname + " " + person.surname}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isCommentPostOpen && (
                <div className="overlay">
                    <div className="comment-post-popup">
                    <div className="popup-header">
                        <h2>{selectedPost?.username}'s Comments</h2>
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
                              <div className="reply-like" onClick={() => handleLikeComment(comment, likesComment.some((like: any) => like.commentid === comment.id && like.userid === userId && like.isLike === true))}
                              style={{ color: likesComment.some((like: any) => like.commentid === comment?.id && like.userid === userId && like.isLike === true) ? '#1877f2' : 'black' }}>{comment.likecommentcount} like</div>
                      
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
            <LoadingAnimation loading={loadingAnimation} />
        </div>
    );
}

export default Search;