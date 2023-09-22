import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/groupProfile.css';
import { BiWorld } from 'react-icons/bi';
import { BsPersonCircle } from 'react-icons/bs';
import ReactQuill from 'react-quill';
import Axios from 'axios';
import PostCarousel from '../component/postCarousel';
import { AiFillLike } from 'react-icons/ai';
import { PiSortAscendingBold } from 'react-icons/pi';
import { PiSortDescendingBold } from 'react-icons/pi';
import { FaRegCommentAlt, FaShare } from 'react-icons/fa';
import { getCurrentUser } from '../component/getCurrentUser';

const GET_GROUP_QUERY = gql`
    query GetGroup($id:ID!){
        getGroup(id:$id) {
            id
            name
            privacy
            profilepic
            date
        }
    }
`;

const GET_ALL_POST_BY_GROUPID_QUERY = gql`
    query GetAllPostByGroupID($groupid:ID!){
        getAllPostByGroupId(groupid: $groupid) {
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

const CREATE_POST_MUTATION = gql`
    mutation CreateGroupPost($inputGroupPost: NewGroupPost!, $medias: [String!]!) {
        createGroupPost(inputGroupPost: $inputGroupPost, medias: $medias) {
            id
            groupid
            groupname
            date
            text
            privacy
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

const CREATE_GROUP_INVITED_MUTATION = gql`
    mutation CreateGroupInvited($inputGroupInvited:NewGroupInvited!){
        createGroupInvited(inputGroupInvited:$inputGroupInvited){
            id
            groupid
            userid
        }
    } 
`;

const CREATE_GROUP_REQUEST_MUTATION = gql`
    mutation CreateGroupRequest($inputGroupRequest:NewGroupRequestJoin!){
        createGroupRequest(inputGroupRequest:$inputGroupRequest){
            id
            groupid
            userid
        }
    } 
`;

const CHECK_JOIN_QUERY = gql`
    query CheckMemberByUserid($groupid: String!, $userid: String!){
        checkMemberByUserid(groupid: $groupid, userid: $userid) 
    }
`;

const CHECK_REQUEST_JOIN_QUERY = gql`
    query CheckRequestByUserid($groupid: String!, $userid: String!){
        checkRequestByUserid(groupid: $groupid, userid: $userid) 
    }
`;

const CHECK_IS_ADMIN_QUERY = gql`
    query CheckMemberIsAdmin($groupid: String!, $userid: String!){
        checkMemberIsAdmin(groupid: $groupid, userid: $userid) 
    }
`;

const DELETE_GROUP_MEMBER_MUTATION = gql`
    mutation DeleteGroupMemberByUserID($groupid: String!, $userid:ID!){
        deleteGroupMemberByUserId(groupid:$groupid, userid:$userid){
            id
            groupid
            userid
            role
        }
    }
`;

const GET_ALL_FILE_QUERY = gql`
    query GetAllFileByGroupID($groupid:ID!, $name:String){
        getAllFileByGroupId(groupid: $groupid, name: $name) {
            id
            groupid
            filename
            mediaurl
            userid
            ownername
            date
            filetype
        }
    }
`;

const UPLOAD_FILE_MUTATION = gql`
    mutation CreateFile($inputFile:NewFile!){
        createFile(inputFile:$inputFile){
            id
            groupid
            filename
            mediaurl
            userid
            ownername
            date
            filetype
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

const GET_ALL_USER_REQUEST_QUERY = gql`
    query GetAllUserRequestByGroupID($groupid:ID!){
        getAllUserRequestByGroupId(groupid: $groupid) {
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

const CREATE_GROUP_MEMBER_MUTATION = gql`
    mutation CreateGroupMember($inputGroupMember:NewGroupMember!){
        createGroupMember(inputGroupMember:$inputGroupMember){
            id
            groupid
            userid
            role
        }
    } 
`;

const DELETE_USER_REQUEST_MUTATION = gql`
    mutation DeleteGroupRequestByUserID($groupid: String!, $userid:ID!){
        deleteGroupRequestByUserId(groupid:$groupid, userid:$userid){
            id
            groupid
            userid
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

const GroupProfile = () => {
    const apolloClient = useApolloClient();
    const { groupId } = useParams();
    const currUser = getCurrentUser()
    const userId = currUser?.getUserIdByToken?.id;
    const [activeLink, setActiveLink] = useState("Discussion");
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [privacyPost, setPrivacyPost] = useState("public");
    const [textPost, setTextPost] = useState("");
    const [selectedMedia, setSelectedMedia] = useState<any>([]);
    const [errorMessage, setErrorMessage] = useState<string>(''); 
    const [postMediaMap, setPostMediaMap] = useState<{ postId: string; medias: string[] }[]>([]);
    const [isCommentPostOpen, setIsCommentPostOpen] = useState(false);
    const [isInviteFriendOpen, setIsInviteFriendOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>();
    const [isRefetch, setIsRefetch] = useState(true);
    const [isReplyCommentOpen, setIsReplyCommentOpen] = useState(false);
    const [postCommentMap, setPostCommentMap] = useState<any>([]);
    const [selectedComment, setSelectedComment] = useState<any>();
    const [postReplyMap, setPostReplyMap] = useState<any>([]);
    const [textComment, setTextComment] = useState("");
    const [textReply, setTextReply] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<User[]>([]); 
    const [searchInput, setSearchInput] = useState("");
    const [sortOrder, setSortOrder] = useState(""); 

    const [createPostMutation] = useMutation(CREATE_POST_MUTATION);
    const [createCommentPostMutation] = useMutation(CREATE_COMMENT_POST_MUTATION);
    const [createLikePostMutation] = useMutation(CREATE_LIKE_POST_MUTATION);
    const [createReplyCommentMutation] = useMutation(CREATE_REPLY_COMMENT_MUTATION);
    const [createGroupInvitedMutation] = useMutation(CREATE_GROUP_INVITED_MUTATION);
    const [createGroupRequestMutation] = useMutation(CREATE_GROUP_REQUEST_MUTATION);
    const [deleteGroupMemberMutation] = useMutation(DELETE_GROUP_MEMBER_MUTATION);
    const [uploadFileMutation] = useMutation(UPLOAD_FILE_MUTATION);
    const [createLikeCommentMutation] = useMutation(CREATE_LIKE_COMMENT_MUTATION);
    const [createGroupMemberMutation] = useMutation(CREATE_GROUP_MEMBER_MUTATION);
    const [deleteUserRequestMutation] = useMutation(DELETE_USER_REQUEST_MUTATION);
    const [createNotifMutation] = useMutation(CREATE_NOTIF_MUTATION);

    const { loading: loadingCheck, error: errorCheck, data: dataCheck} =  useQuery(CHECK_JOIN_QUERY, {
        variables: { groupid: groupId, userid: userId },
    })
    const checkResult = dataCheck?.checkMemberByUserid;

    const { loading: loadingRequest, error: errorRequest, data: dataRequest, refetch: refetchDataRequest} =  useQuery(CHECK_REQUEST_JOIN_QUERY, {
        variables: { groupid: groupId, userid: userId },
    })
    const requestResult = dataRequest?.checkRequestByUserid;

    const { loading: loadingIsAdmin, error: errorIsAdmin, data: dataIsAdmin, refetch: refetchDataIsAdmin} =  useQuery(CHECK_IS_ADMIN_QUERY, {
        variables: { groupid: groupId, userid: userId },
    })
    const IsAdmin = dataIsAdmin?.checkMemberIsAdmin;

    const { loading: loadingGroup, error: errorGroup, data: dataGroup} =  useQuery(GET_GROUP_QUERY, {
        variables: { id: groupId },
    })
    const currentGroup = dataGroup?.getGroup || [];

    const { loading: loadingPost, error: errorPost, data: dataPost, refetch: refetchDataPost, fetchMore} =  useQuery(GET_ALL_POST_BY_GROUPID_QUERY, {
        variables: { groupid: groupId },
    })
    const posts = dataPost?.getAllPostByGroupId || [];

    const { loading: loadingAllGroups, error: errorAllGroups, data: dataAllGroups} =  useQuery(GET_ALL_GROUP_QUERY)
    const allGroup = dataAllGroups?.getAllGroup || [];

    const { loading: loadingAllLike, error: errorAllLike, data: dataAllLike, refetch: refetchDataLike} =  useQuery(GET_ALL_LIKE_QUERY)
    const likes = dataAllLike?.getAllLike || [];

    const { loading: loadingAllFriend, error: errorAllFriend, data: dataAllFriend} =  useQuery(GET_ALL_FRIEND_QUERY, {
        variables: { userid: userId },
    })
    const friends = dataAllFriend?.getAllFriendByUserId || [];

    const { loading: loadingAllFile, error: errorAllFile, data: dataAllFile, refetch: refetchDataFiles} =  useQuery(GET_ALL_FILE_QUERY, {
        variables: { groupid: groupId, name: searchInput },
    })
    const files = dataAllFile?.getAllFileByGroupId || [];

    const { loading: loadingAllLikeComment, error: errorAllLikeComment, data: dataAllLikeComment, refetch: refetchDataLikeComment} =  useQuery(GET_ALL_LIKE_COMMENT_QUERY)
    const likesComment = dataAllLikeComment?.getAllLikeComment || [];

    const { loading: loadingAllUserRequest, error: errorAllUserRequest, data: dataAllUserRequest, refetch: refetchDataUserRequest} =  useQuery(GET_ALL_USER_REQUEST_QUERY, {
        variables: { groupid: groupId },
    })
    const userRequest = dataAllUserRequest?.getAllUserRequestByGroupId || [];

    const handleSortClick = () => {
        let newSortOrder = 'asc';

        if (sortOrder === 'asc') {
            newSortOrder = 'desc';
        } else if (sortOrder === 'desc') {
            newSortOrder = '';
        }

        setSortOrder(newSortOrder);
    };

    const sortedFiles = sortOrder !== ''
        ? [...files].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();

            if (sortOrder === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        })
        : [...files];

    const handleActiveLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const openCreatePost = () => {
        setIsCreatePostOpen(!isCreatePostOpen)
        setPrivacyPost("public")
        setTextPost("")
        setSelectedMedia("")
        setErrorMessage("")
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

    const openInvitePopup = () => {
        setIsInviteFriendOpen(!isInviteFriendOpen)
        setSelectedFriends([])
    };

    const openReplyPost = async (comment: string) => {
        setIsReplyCommentOpen(!isReplyCommentOpen)
        setSelectedComment(comment)
    };

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

    const handlePrivacyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPrivacyPost(event.target.value);
    };

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

    const handleCreatePost = async () => {
        if (textPost === "" || textPost.length <= 0 || textPost === '<p><br></p>') {
          setErrorMessage("Text cannot be empty!");
          return;
        }
  
        const inputGroupPost = {
          groupid: groupId,
          groupname: currentGroup?.name,
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
                inputGroupPost: inputGroupPost,
                medias: mediaUrls,
            },
          });
    
          console.log("Post created:", response.data.createGroupPost);
        } catch (error) {
          console.error("Error creating post:", error);
        }
    
        setIsCreatePostOpen(false);
        refetchDataPost()
        setPrivacyPost("public")
        setTextPost("")
    };

    const addSelectedFriend = (friendIds: string) => {
        const selectedFriendsData = friends.filter((user: any) => friendIds.includes(user.id));
    
        const newSelectedFriends = selectedFriendsData.filter((friend: any) => !selectedFriends.some((selectedFriend: any) => selectedFriend.id === friend.id));
    
        setSelectedFriends((prevFriends: any) => [
            ...prevFriends,
            ...newSelectedFriends, 
        ]);
    };

    const handleCreateRequest = async () => {
        const inputGroupRequest = {
            groupid: groupId,
            userid: userId,
        };

        try {
            const { data: dataRequest } = await createGroupRequestMutation({
                variables: { inputGroupRequest: inputGroupRequest },
            });

            console.log(dataRequest.createGroupRequest.id);
        } catch (error) {
            console.error("Error inviting friend:", error);
        }
        refetchDataRequest()
    }

    const handleLeaveGroup = async () => {
        try {
            const { data: dataDelete } = await deleteGroupMemberMutation({
                variables: { groupid: groupId ,userid: userId },
            });

            console.log(dataDelete.deleteGroupMemberByUserId.id);
        } catch (error) {
            console.error("Error inviting friend:", error);
        }
        window.location.href = '/group'
    };

    const handleCreateInvite = async () => {
        if (selectedFriends.length > 0) {
            for (const selectedFriend of selectedFriends) {
                const inputGroupInvited = {
                    groupid: groupId,
                    userid: selectedFriend.id,
                };
    
                try {
                    const { data: dataInvited } = await createGroupInvitedMutation({
                        variables: { inputGroupInvited: inputGroupInvited },
                    });
    
                    console.log(dataInvited.createGroupInvited.id);
                } catch (error) {
                    console.error("Error inviting friend:", error);
                }
            }
        }

        setSelectedFriends([]);
        setIsInviteFriendOpen(false);
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

    const downloadFile = async (mediaURL: any, fileName: any) => {
        const fileUrl = mediaURL;
        const response = await fetch(fileUrl);
        const blob = await response.blob();
      
        // Extract the file extension from the mediaURL
        const existingExtension = mediaURL.substring(mediaURL.lastIndexOf(".") + 1);
      
        const url = window.URL.createObjectURL(blob);
      
        const link = document.createElement("a");
        link.href = url;
      
        // Set the desired file name with the extracted extension
        link.download = `${fileName}.${existingExtension}`;
      
        link.click();
      
        window.URL.revokeObjectURL(url); // Clean up the URL object
    };

    const handleChooseFileClick = () => {
        const mediaInput = document.getElementById('media-input');
        if (mediaInput) {
          mediaInput.click();
        }
    };

    const handleMediaChange = async (e: any) => {
        const selectedFiles = e.target.files;
  
        const fullFileName = selectedFiles[0].name;
        const fileNameParts = fullFileName.split('.');
        const fileExtension = "." + fileNameParts[fileNameParts.length - 1];

        console.log('File name without extension:', fileNameParts[0]);
        console.log('File extension:', fileExtension);

        const formData = new FormData();
        formData.append("file", selectedFiles[0])
        formData.append("upload_preset","orsgh758")
        let apiUrl = 'https://api.cloudinary.com/v1_1/dnl7josxn/';
        if (selectedFiles[0].type.includes('image')) {
            apiUrl += 'image/upload';
        } else if (selectedFiles[0].type.includes('video')) {
            apiUrl += 'video/upload';
        } else {
            apiUrl += 'raw/upload';
        }

        let photoUrl;

        try {
            const response = await Axios.post(apiUrl, formData);
            const secureUrl = response.data.secure_url;
            photoUrl = secureUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        const inputFile = {
            groupid: groupId,
            filename: fileNameParts[0],
            mediaurl: photoUrl,
            userid: userId,
            ownername: currUser?.getUserIdByToken?.firstname + " " + currUser?.getUserIdByToken?.surname,
            filetype: fileExtension
        };
        
        try {
            const { data: dataUpload } = await uploadFileMutation({
                variables: { inputFile: inputFile },
            });

            console.log(dataUpload.createFile.id);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
        refetchDataFiles();
    };

    const handleCreateMember = async (user: User) => {
        const inputGroupMember = {
            groupid: groupId,
            userid: user.id,
            role: "Member",
        };
    
        try {
            const response = await createGroupMemberMutation({
                variables: {
                    inputGroupMember: inputGroupMember,
                },
            }).then( async () => {
                try {
                    const response = await deleteUserRequestMutation({
                        variables: {
                            groupid: groupId,
                            userid: user.id,
                        },
                    }).then( async () => {
                        await refetchDataUserRequest()
                    });
                } catch (error) {
                    console.error("Error deleting user request:", error);
                }
                await refetchDataUserRequest()
            });
        } catch (error) {
            console.error("Error creating post:", error);
        }

        const inputNotification = {
            userid: user.id,
            username: user.firstname + " " + user.surname,
            text: "You have joined the group " + currentGroup?.name,
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
    }

    if(!currUser) return null
    
    return (
        <div className="group-profile-container">
            <div className="group-profile-left-sidebar">
                <div className="sidebar-header-group">
                    <h2>Groups</h2>
                </div>
            </div>

            <div className="group-profile-main-content">

                <div className="group-profile-container-head">
                    <div className="group-profile-cover-photo">
                        <img src={currentGroup?.profilepic} alt="" />
                    </div>
                    <div className="profile-group-info">
                        <div className="profile-group-personal">     
                            <div className="profile-user-details">
                                <h1 className="profile-user-name">{currentGroup?.name}</h1>
                                <div className='profile-privacy'>
                                    <BiWorld size={15} color="grey"/>
                                    <h5 className="profile-user-email"> {currentGroup?.privacy}</h5>
                                </div>
                            </div>
                        </div>
                        <div className="profile-group-others">
                            {checkResult ? (
                                <div className="invite-friend-group-button" onClick={openInvitePopup}>
                                    <div className='link-invite-friend-group'>
                                        Invite
                                    </div>
                                </div>
                            ) : (
                                !requestResult ? (
                                    <div className="invite-friend-group-button" onClick={handleCreateRequest}>
                                        <div className='link-invite-friend-group'>
                                            Join Group
                                        </div>
                                    </div>
                                ) : (
                                    <div className="requested-friend-group-button">
                                        <div className='link-invite-friend-group'>
                                            Requested
                                        </div>
                                    </div>
                                )
                            )}
                            {checkResult && (
                                <div className="leave-group-button" onClick={handleLeaveGroup}>
                                    <div className='link-leave-group'>
                                        Leave
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="group-profile-user-main">
                        <div className='group-profile-user-buttons'>
                            <div className={`profile-user-button ${activeLink === 'Discussion' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Discussion')}>Discussion</div>
                            <div className={`profile-user-button ${activeLink === 'Rooms' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Rooms')}>Rooms</div>
                            <div className={`profile-user-button ${activeLink === 'Members' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Members')}>Members</div>
                            <div className={`profile-user-button ${activeLink === 'Files' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Files')}>Files</div>
                            {IsAdmin && (
                                <div className={`profile-user-button ${activeLink === 'Request Join' ? "profile-user-button-active" : ""}`} onClick={() => handleActiveLinkClick('Request Join')}>Request Join</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='group-profile-container-body'>
                    <div className='container-body-group-profile'>
                        {activeLink === "Discussion" && (
                            <>
                                <div className="create-post">
                                    <div className="home-icon-profile">
                                        <img className='image-group-create-post' src={currentGroup?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px', marginTop: '8px' }} />
                                    </div>
                                    <input type="text" placeholder="What's on your mind?" className="post-input" onClick={openCreatePost} />
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
                                                        <BsPersonCircle size={30} color="grey" />
                                                        <span className="user-name">
                                                            {currentGroup?.name}
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
                                                        className="input-richtext" />
                                                    {selectedMedia.length > 0 && (
                                                        <div className="selected-media-container">
                                                            {selectedMedia.map((media: any, index: number) => (
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
                                                            } } />
                                                    </div>
                                                    {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}
                                                    <button className="post-button" onClick={handleCreatePost}>Post</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className='post-mapping-group-profile'>
                                    {posts.map((post: GroupPost) => (
                                        <div key={post.id} className="post-mapping">
                                            <div className="post">
                                                <div className="post-header">
                                                    {allGroup.map((group: Group) => (
                                                        group.id === post.groupid && (
                                                            <img src={group?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                                                        )
                                                    ))}
                                                    <div className="user-name">
                                                        {post.groupname}
                                                    </div>
                                                </div>
                                                <div className="post-text" dangerouslySetInnerHTML={{ __html: post.text }}></div>

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
                                                        <FaRegCommentAlt size={30} color="grey" />
                                                        <button className="action-button">Comment</button>
                                                    </div>
                                                    <div className="post-action">
                                                        <FaShare size={30} color="grey" />
                                                        <button className="action-button">Share</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                {isInviteFriendOpen && (
                                    <div className="overlay">
                                        <div className="comment-post-popup">
                                            <div className="popup-header">
                                                <h2>Invite Friends</h2>
                                                <button className="close-button" onClick={openInvitePopup}>
                                                    &times;
                                                </button>
                                            </div>
                                            <div className='popup-content'>
                                                <select
                                                    className="dropdown-menu-friends-group"
                                                    onChange={(e) => {addSelectedFriend(e.target.value)}}
                                                    value={""}
                                                    >
                                                    <option value="" disabled>Invite Friends</option>
                                                    {friends.map((friend: User) => (
                                                        <option key={friend.id} value={friend.id}>
                                                            {friend.firstname} {friend.surname}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className='show-member-invited-group-profile'>
                                                    {selectedFriends.map((friend: User) => (
                                                        <div className='member-invited'>
                                                            {friend.firstname + " " + friend.surname}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="invite-friend-group-button" onClick={handleCreateInvite}>
                                                    <div className='link-invite-friend-group'>
                                                        Invite
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}            
                            </>
                        )}
                        {activeLink === "Files" && (
                            <>
                                <div className='file-container'>
                                    <div className='file-header'>
                                        <div>
                                            <h2>Files</h2>
                                        </div>
                                        <div className='file-header-search-and-upload'>
                                            <div className="navbar-search">
                                                <input 
                                                    type="text" 
                                                    placeholder="Search Files" 
                                                    className="search-input" 
                                                    value={searchInput}
                                                    onChange={(e) => setSearchInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        setSearchInput("");
                                                    }
                                                    }}
                                                />
                                            </div>
                                            <div className="invite-friend-group-button" onClick={handleChooseFileClick}>
                                                <div className='link-invite-friend-group'>
                                                    Upload File
                                                </div>
                                                <input
                                                    id="media-input"
                                                    type="file"
                                                    accept=".jpg, .jpeg, .png, .mp4, .avi, .mov, .html, .pdf, .docx, .xlsx, .pptx"
                                                    className="media-input"
                                                    multiple
                                                    onChange={handleMediaChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='file-body'>
                                        <div className='file-body-title'>
                                            <div className="file-group-button">
                                                <div className='link-file-group'>
                                                    File Name
                                                </div>
                                            </div>
                                            <div className="file-group-button">
                                                <div className='link-file-group'>
                                                    Type
                                                </div>
                                            </div>
                                            <div className="file-group-button" onClick={handleSortClick}>
                                                <div className='link-file-group'>
                                                    Uploaded Date
                                                    {sortOrder === "asc" && (
                                                        <PiSortAscendingBold size={20} color="black" />
                                                    )}
                                                    {sortOrder === "desc" && (
                                                        <PiSortDescendingBold size={20} color="black" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='file-body-body'>
                                            {sortedFiles.map((file: FileGroup) => (
                                                <>
                                                <div key={file.id} className="file-mapping">
                                                    <div className='file-body-details-name' onClick={() => downloadFile(file.mediaurl, file.filename)}>
                                                        {file.filename}{file.filetype.toLowerCase()}
                                                    </div>
                                                    <div className='file-body-details'>
                                                        {file.filetype}
                                                    </div>
                                                    <div className='file-body-details'>
                                                        {file.date}
                                                    </div>
                                                </div>
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {activeLink === "Request Join" && (
                        userRequest.map((user: User) => (
                            <div className="people-mapping-user-request" key={user.id}>
                                <div className="people-each-card">
                                    <img src={user.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                                    {user.firstname + " " + user.surname}
                                </div>
                                <div className="invite-friend-group-button" onClick={() => handleCreateMember(user)}>
                                    <div className='link-invite-friend-group'>
                                        Approve
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default GroupProfile;