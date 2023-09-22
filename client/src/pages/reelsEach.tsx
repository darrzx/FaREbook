import { gql, useApolloClient, useMutation } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { AiFillLike } from 'react-icons/ai';
import { BsFillChatLeftDotsFill, BsPersonCircle } from 'react-icons/bs';
import { getCurrentUser } from '../component/getCurrentUser';
import '../styles/reelsEach.css';

const GET_ALL_COMMENT_REELS_QUERY = gql`
  query GetAllCommentByReelsID($id:ID!){
    getAllCommentByReelsId(id: $id) {
      id
      reelsid
      userid
      username
      comment
      date
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

const CREATE_COMMENT_REELS_QUERY = gql`
  mutation CreateCommentReels($inputCommentReels: NewCommentReels!) {
    createCommentReels(inputCommentReels: $inputCommentReels) {
      id
      reelsid
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

interface ReelsProps {
  reels: Reels;
  isActive: boolean;
}

const ReelsEach: React.FC<ReelsProps> = ({ reels, isActive }) => {
  const apolloClient = useApolloClient();
  const currUser = getCurrentUser();
  const userId = currUser?.getUserIdByToken?.id;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCommentReelsOpen, setIsCommentReelsOpen] = useState(false);
  const [selectedReels, setSelectedReels] = useState<any>();
  const [textComment, setTextComment] = useState("");
  const [reelsCommentMap, setReelsCommentMap] = useState<any>([]);
  const [isRefetch, setIsRefetch] = useState(true);
  const [isReplyCommentOpen, setIsReplyCommentOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any>();
  const [postReplyMap, setPostReplyMap] = useState<any>([]);
  const [textReply, setTextReply] = useState("");

  const [createCommentReelsMutation] = useMutation(CREATE_COMMENT_REELS_QUERY);
  const [createReplyCommentMutation] = useMutation(CREATE_REPLY_COMMENT_MUTATION);
  const [createNotifMutation] = useMutation(CREATE_NOTIF_MUTATION);

  useEffect(() => {
    if(selectedReels && isRefetch){
      async function fetchCommentForPost(reelsId: any) {
        try {
          await apolloClient.query({
            query: GET_ALL_COMMENT_REELS_QUERY,
            variables: { id: reelsId },
          }).then(response => {
            if (!response.error) {
              console.log(response.data.getAllCommentByReelsId)
              setReelsCommentMap(response.data.getAllCommentByReelsId)
            }
          });
        } catch (error) {
          console.error("Error fetching comentt:", error);
          return [];
        }
      }
      fetchCommentForPost(selectedReels.id);
      setIsRefetch(false)
    }
  }, [selectedReels, isRefetch]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; 
      }
    }
  }, [isActive]);

  const openCommentReels = async (reels: Reels) => {
    setIsCommentReelsOpen(true)
    setSelectedReels(reels)
  };

  const openReplyPost = async (comment: string) => {
    setIsReplyCommentOpen(!isReplyCommentOpen)
    setSelectedComment(comment)
  };

  const closeCommentReels = () => {
    setIsCommentReelsOpen(false)
    setIsReplyCommentOpen(false)
  }

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

  const handleCreateReplyReels = async () => {
    const inputReplyPost = {
      commentid: selectedComment,
      userid: userId,
      replycomment: textReply,
      username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
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
    setIsRefetch(true)
    closeCommentReels()
  }

  const handleCreateCommentReels = async () => {
    const inputCommentReels = {
      reelsid: selectedReels.id,
      userid: userId,
      username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
      comment: textComment
    };

    try {
      const response = await createCommentReelsMutation({
        variables: {
          inputCommentReels: inputCommentReels,
        },
      });

      console.log("Comment created:", response.data);
    } catch (error) {
      console.error("Error creating post:", error);
    }

    const inputNotification = {
      userid: selectedReels.userid,
      username: currUser?.getUserIdByToken?.firstname + " " + currUser?.getUserIdByToken?.surname,
      text: currUser?.getUserIdByToken?.firstname + " " + currUser?.getUserIdByToken?.surname + " commented on your reel",
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
    setIsRefetch(true)
    closeCommentReels()
  };

  if(!currUser) {
    return null
  }
  
  return (
    <>
      <div className={`reels ${isActive ? "reels-active" : ""}`}>
        <div className='reels-result'>
          <video ref={videoRef} src={reels.video} autoPlay loop></video>
          <div className='reels-text'>{reels.text}</div> 
        </div>
        <div className='reels-actions'>
          <div className="reels-action">
              <AiFillLike size={30} color="white" />
              <button className="action-button"></button>
          </div>
          <div className="reels-action" onClick={() => openCommentReels(reels)}>
              <BsFillChatLeftDotsFill size={30} color="white"/>
              <div className='reels-action-comment-count'>{reels.commentcount}</div>
          </div>

        </div>
      </div>

      {isCommentReelsOpen && (
          <div className="overlay">
            <div className="comment-post-popup">
              <div className="popup-header">
                <h2>{selectedReels?.username}'s Comments</h2>
                <button className="close-button" onClick={closeCommentReels}>
                  &times;
                </button>
              </div>

              <div className="popup-content">
                {reelsCommentMap.map((comment: CommentReels) => (
                  <div key={comment.id} className="popup-list">
                    <div className="popup-comment">
                      <div className="comment-header">
                        <BsPersonCircle size={30} color="grey" />
                        <div className="comment-header-name">{comment.username}</div>
                      </div>
                      <div className="post-text" dangerouslySetInnerHTML = {{ __html: comment.comment}}></div>
                    </div>

                    <div className="popup-reply">
                      <div className="reply-like">like</div>
                      <div className="reply-comment" onClick={() => openReplyPost(comment.id)}>reply</div>
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
                            <button className="comment-button" onClick={handleCreateReplyReels}>Reply</button>
                            
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
                <button className="comment-button" onClick={handleCreateCommentReels}>Comment</button>
              </div>
            </div>
          </div>
        )}

    </>
  );
};

export default ReelsEach;
