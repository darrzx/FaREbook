import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { AiFillLike } from 'react-icons/ai';
import { BsFillFilePostFill, BsPersonCircle } from 'react-icons/bs';
import { FaRegCommentAlt, FaShare } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { RiCompassDiscoverFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../component/getCurrentUser';
import PostCarousel from '../component/postCarousel';
import '../styles/group.css';

const GET_ALL_GROUP_BY_USERID_QUERY = gql`
    query GetAllGroupByUserID($userid:String!){
        getAllGroupByUserId(userid: $userid) {
            id
            group{
                id
                name
                privacy
                profilepic
                date
            }
        }
    }
`;

const GET_ALL_GROUP_QUERY = gql`
    query GetAllGroup{
        getAllGroup {
            id
            name
            privacy
            profilepic
            date
        }
    }
`;

const GET_ALL_GROUP_POST_QUERY = gql`
    query GetAllGroupPost($offset:Int!, $limit:Int!, $groupids: [String!]!){
      getAllGroupPost(offset: $offset, limit: $limit, groupids: $groupids) {
        id
        groupid
        groupname
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

const GET_ALL_GROUP_BY_NAME_QUERY = gql`
  query GetAllGroupByName($name:String!){
    getAllGroupByName(name: $name) {
      id
      id
      name
      privacy
      profilepic
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

const Group = () => {
    const apolloClient = useApolloClient();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState("");
    const [activeLink, setActiveLink] = useState("Feed");   
    const currUser = getCurrentUser()
    const userId = currUser?.getUserIdByToken?.id;
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(5);
    const [postMediaMap, setPostMediaMap] = useState<{ postId: string; medias: string[] }[]>([]);
    const [isCommentPostOpen, setIsCommentPostOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>();
    const [isRefetch, setIsRefetch] = useState(true);
    const [isReplyCommentOpen, setIsReplyCommentOpen] = useState(false);
    const [postCommentMap, setPostCommentMap] = useState<any>([]);
    const [selectedComment, setSelectedComment] = useState<any>();
    const [postReplyMap, setPostReplyMap] = useState<any>([]);
    const [textComment, setTextComment] = useState("");
    const [textReply, setTextReply] = useState("");

    const [createCommentPostMutation] = useMutation(CREATE_COMMENT_POST_MUTATION);
    const [createLikePostMutation] = useMutation(CREATE_LIKE_POST_MUTATION);
    const [createReplyCommentMutation] = useMutation(CREATE_REPLY_COMMENT_MUTATION);
    const [createLikeCommentMutation] = useMutation(CREATE_LIKE_COMMENT_MUTATION);

    const { loading: loadingAllGroup, error: errorAllGroup, data: dataAllGroup} =  useQuery(GET_ALL_GROUP_BY_USERID_QUERY, {
        variables: { userid: userId },
    })
    const groups = dataAllGroup?.getAllGroupByUserId || [];
    const groupids = groups.map((group: GroupHeader) => group.group.id);

    const { loading: loadingAllPost, error: errorAllPost, data: dataAllPost, refetch: refetchDataPost, fetchMore} =  useQuery(GET_ALL_GROUP_POST_QUERY, {
        variables: { offset: offset, limit: limit, groupids: groupids },
    })
    const posts = dataAllPost?.getAllGroupPost || [];

    const { loading: loadingAllLike, error: errorAllLike, data: dataAllLike, refetch: refetchDataLike} =  useQuery(GET_ALL_LIKE_QUERY)
    const likes = dataAllLike?.getAllLike || [];

    const { loading: loadingAllGroups, error: errorAllGroups, data: dataAllGroups} =  useQuery(GET_ALL_GROUP_QUERY)
    const allGroup = dataAllGroups?.getAllGroup || [];

    const { loading: loadingAllGroupSearch, error: errorAllGroupSearch, data: dataAllGroupSearch} =  useQuery(GET_ALL_GROUP_BY_NAME_QUERY, {
      variables: { name: searchInput },
    })
    const groupsSearch = dataAllGroupSearch?.getAllGroupByName || [];
    
    const { loading: loadingAllLikeComment, error: errorAllLikeComment, data: dataAllLikeComment, refetch: refetchDataLikeComment} =  useQuery(GET_ALL_LIKE_COMMENT_QUERY)
    const likesComment = dataAllLikeComment?.getAllLikeComment || [];

    const handleEnterSearch = () => {
        setActiveLink("Discover")
    };

    const handleCreateGroupClick = () => {
        window.location.href = "/createGroup"
    };

    const handleSidebarLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const openCommentPost = async (post: GroupPost) => {
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

    const handleLikePost = async (post: GroupPost, isLike : any) => {
        const inputLikePost = {
            postid: post.id,
            userid: userId,
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

    const handleCreateReplyPost = async () => {

        const inputReplyPost = {
          commentid: selectedComment,
          userid: userId,
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
          userid: userId,
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
        setIsRefetch(true);
        closeCommentPost()
    };

    const handleGroupProfile = (group: Group) => {
      navigate(`/groupProfile/${encodeURIComponent(group?.id)}`);
    };
    
    if(!currUser) return null

    return (
        <div className='group-container'>
            <div className='group-left-sidebar'>
                <div className="sidebar-header-group">
                    <h2>Groups</h2>
                </div>
                <div className="sidebar-search">
                    <div className="navbar-search">
                        <input 
                            type="text" 
                            placeholder="Search Groups" 
                            className="search-input" 
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEnterSearch();
                              setSearchInput("");
                            }
                            }}
                        />
                    </div>
                </div>
                <div className="friends-left-menus">
                    <div className={`friends-sidebar-link ${activeLink === 'Feed' ? "friends-sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Feed')}>
                        <BsFillFilePostFill size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div >Your Feed</div>
                    </div>
                    <div className={`friends-sidebar-link ${activeLink === 'Discover' ? "friends-sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Discover')}>  
                        <RiCompassDiscoverFill size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div>Discover</div>
                    </div>
                    <div className={`friends-sidebar-link ${activeLink === 'Groups' ? "friends-sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Groups')}>
                        <HiUserGroup size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div >Your Groups</div>
                    </div>
                </div>
                <div className="create-group-button" onClick={handleCreateGroupClick}>
                    <div className='link-create-group'>
                        Create New Group
                    </div>
                </div>
                <div className='all-group-joined-container'>
                    <div className="all-group-header-group">
                        <h3>Groups you've joined</h3>
                    </div>
                    {groups.length > 0 && (
                        <div className="sidebar-group-display">
                            {groups.map((group: GroupHeader) => (
                                <div className="groups-mapping" key={group.id} onClick={() => handleGroupProfile(group.group)}>
                                    <div className="groups-each-card" >
                                        <img src={group.group.profilepic} alt="" />
                                        <div className='card-name'>{group.group.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className='group-main-content'>
              {activeLink === "Feed" && (
                posts.map((post: GroupPost) => ( 
                    <div key={post.id} className="post-mapping">    
                        <div className="post"> 
                            <div className="post-header">
                                {allGroup.map((group: Group) => (
                                    group.id === post.groupid && (
                                    <img src={group?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px', objectFit: 'cover' }} />
                                    )
                                ))}
                                <div className="user-name">
                                    {post.groupname}
                                </div>
                            </div>
                            <div className="post-text" dangerouslySetInnerHTML = {{ __html: post.text}}></div>
                        
                            <div className='media-mapping'>
                                {postMediaMap.map((media, i) => (
                                media.postId === post.id && (
                                    <PostCarousel medias={postMediaMap[i].medias} />
                                )
                                ))}
                            </div>
                        
                            <div className="post-indicator">
                                <div>liked by {post.likecount}</div>
                                <div>{post.commentcount} comments</div>
                            </div>
                            <div className="post-actions">
                                <div className="post-action" onClick={() => handleLikePost(post, likes.some((like: any) => like.postid === post.id && like.userid === userId && like.isLike === true))}>
                                    <AiFillLike size={30} color={likes.some((like: any) => like.postid === post.id && like.userid === userId && like.isLike === true) ? '#1877f2' : 'grey'} />
                                    <button
                                        className="action-button"
                                        style={{ color: likes.some((like: any) => like.postid === post?.id && like.userid === userId && like.isLike === true) ? '#1877f2' : 'grey' }}
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
                {activeLink === "Discover" && (
                  <div>
                    {groupsSearch.length > 0 && (
                        <div className="group-display-search">
                            {groupsSearch.map((group: Group) => (
                                <div className="groups-search-mapping" key={group.id} onClick={() => handleGroupProfile(group)}>
                                    <div className="groups-search-each-card" >
                                        <img src={group.profilepic} alt="" />
                                        <div className='card-name'>{group.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>
                )}
            </div>

            {isCommentPostOpen && (
                <div className="overlay">
                    <div className="comment-post-popup">
                    <div className="popup-header">
                        <h2>{selectedPost?.groupname}'s Posts</h2>
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
        </div>
    )
}

export default Group;