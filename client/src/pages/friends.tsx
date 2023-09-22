import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { BsPersonPlusFill } from 'react-icons/bs';
import { FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../component/getCurrentUser';
import '../styles/friends.css';

const GET_ALL_FRIEND_REQUEST_QUERY = gql`
    query GetAllFriendRequestsByUserID($userid:ID!){
        getAllFriendRequestsByUserId(userid: $userid) {
            id
            userid
            requesterid
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
        profilepic
        isActive
      }
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

const DELETE_REQUEST_MUTATION = gql`
    mutation DeleteFriendRequests($id:ID!){
        deleteFriendRequests(id:$id){
            id
            userid
            requesterid
        }
    }
`;

const CREATE_FRIEND_MUTATION = gql`
    mutation CreateFriend($inputFriends:NewFriend!){
        createFriend(inputFriends:$inputFriends){
            id
            userid
            friendid
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

const CREATE_FRIEND_REQUEST_MUTATION = gql`
    mutation CreateFriendRequests($inputRequestFriends: NewFriendRequests!) {
        createFriendRequests(inputRequestFriends: $inputRequestFriends) {
            id
            userid
            requesterid
        }
    }
`; 

const Friends = () => {
    const currUser = getCurrentUser()
    const userId = currUser?.getUserIdByToken?.id;
    const [activeLink, setActiveLink] = useState("Home");
    const apolloClient = useApolloClient();
    const [userMap, setUserMap] = useState<any>([]);
    const [deleteRequestMutation] = useMutation(DELETE_REQUEST_MUTATION);
    const [createFriendMutation] = useMutation(CREATE_FRIEND_MUTATION);
    const [createNotifMutation] = useMutation(CREATE_NOTIF_MUTATION);
    const [createFriendRequestMutation] = useMutation(CREATE_FRIEND_REQUEST_MUTATION);

    const navigate = useNavigate();

    const { loading: loadingAllRequest, error: errorAllRequest, data: dataAllRequest, refetch: refetchDataRequest} =  useQuery(GET_ALL_FRIEND_REQUEST_QUERY, {
        variables: { userid: userId },
    })

    const { loading: loadingAllSuggestions, error: errorAllSuggestions, data: dataAllSuggestions, refetch: refetchDataSuggestions} =  useQuery(GET_SUGGESTIONS_QUERY, {
        variables: { userid: userId },
    })
    
    const requests = dataAllRequest?.getAllFriendRequestsByUserId || [];
    const suggestions = dataAllSuggestions?.getAllFriendSuggestionByUserId || [];

    async function fetchUserForRequest(userId: any) {
        try {
          const response = await apolloClient.query({
            query: GET_USER_QUERY,
            variables: { id: userId },
          });
      
          if (!response.error) {
            return response.data.getUser;
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          return null;
        }
    }
      
    useEffect(() => {
        if (requests) {
            requests.map(async (request: FriendRequest) => {
                const user = await fetchUserForRequest(request.requesterid);
                setUserMap((prevUser: any) => [
                    ...prevUser,
                    user,
                  ]);
                return user;
            });
        }
    }, [requests]);

    // useEffect(() => {
    //     if (userMap) {
    //         console.log(userMap)
    //     }
    //   }, [userMap]);

    if(!currUser) {
        return null
    }

    const handleSidebarLinkClick = (linkName: string) => {
        setActiveLink(linkName);
    };

    const handleCreateFriend = async (request : any, user : any) => {
        const inputFriends = {
            userid: request.userid,
            friendid: request.requesterid,
        };

        try {
            const response = await createFriendMutation({
                variables: {
                inputFriends: inputFriends,
                },
            }).then(async () => {
                try {
                    const response = await deleteRequestMutation({
                        variables: {
                        id: request.id,
                        },
                    });
                    console.log("reply deleted:", response.data);
                } catch (error) {
                    console.error("Error creating post:", error);
                }
            });
        } catch (error) {
            console.error("Error creating post:", error);
        }

        const inputNotification = {
            userid: user.id,
            username: user.firstname + " " + user.surname,
            text: currUser?.getUserIdByToken?.firstname + " " + currUser?.getUserIdByToken?.surname + " accepted your friend request",
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

        refetchDataRequest();
        refetchDataSuggestions();
    };

    const handleDeleteFriendRequest = async (request : any) => {
        try {
            const response = await deleteRequestMutation({
                variables: {
                id: request.id,
                },
            });
            console.log("reply deleted:", response.data);
        } catch (error) {
            console.error("Error creating post:", error);
        }
        refetchDataRequest();
    };

    const handleUserProfile = (userid: string) => {
        navigate(`/profile/${encodeURIComponent(userid)}`);
    };

    const handleCreateFriendRequest = async (user: User) => {
        const inputRequestFriends = {
            userid: user.id,
            requesterid: userId,
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
        refetchDataSuggestions();
    };

    return (
        <div className="friends-container">
            <div className='friends-left-sidebar'>
                <div className="icon-info">
                    <h2>Friends</h2>
                </div>
                <div className="friends-left-menus">
                    <div className={`friends-sidebar-link ${activeLink === 'Home' ? "friends-sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Home')}>
                        <FaUserFriends size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div >Home</div>
                    </div>
                    <div className={`friends-sidebar-link ${activeLink === 'FriendRequests' ? "friends-sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('FriendRequests')}>  
                        <BsPersonPlusFill size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div>Friend Requests</div>
                    </div>
                    <div className={`friends-sidebar-link ${activeLink === 'Suggestions' ? "friends-sidebar-link-active" : ""}`} onClick={() => handleSidebarLinkClick('Suggestions')}>
                        <BsPersonPlusFill size={30} color="#1877f2" style={{marginRight: '10px', marginLeft: '10px'}}/>
                        <div >Suggestions</div>
                    </div>
                </div>
            </div>

            <div className='friends-main-content'>
                {activeLink === "Home" && (
                    <>
                        <div className='friend-request'>
                            <div className='title-friend-request'>
                                <h3>Friend Requests</h3>
                            </div>
                            <div className='friend-request-detail'>
                                {requests.map((request: FriendRequest) => (
                                    <div key={request.id}>
                                        {userMap.map((user: User) => (
                                            request.requesterid === user.id && (
                                                <div className="friend-request-card">
                                                    <img src={user.profilepic} alt="" className="profile-image" onClick={() => handleUserProfile(user.id)} />
                                                    <div className="friend-details">
                                                        <h3>{user.firstname + " " + user.surname}</h3>
                                                        <p>2 mutual friends</p>
                                                    </div>
                                                    <div className="friend-actions">
                                                        <button className="confirm-button" onClick={() => handleCreateFriend(request, user)}>Confirm</button>
                                                        <button className="delete-button" onClick={() => handleDeleteFriendRequest(request)}>Delete</button>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className='title-friend-suggestions'>
                                <h3>People You May Know</h3>
                            </div>
                            <div className='friend-suggestions-detail'>
                                {suggestions.slice(0, 5).map((suggest: User, index: number) => (
                                    <div className="friend-request-card" key={index}>
                                        <img src={suggest.profilepic} alt="" className="profile-image" onClick={() => handleUserProfile(suggest.id)} />
                                        <div className="friend-details">
                                            <h3>{suggest.firstname + " " + suggest.surname}</h3>
                                            <p>2 mutual friends</p>
                                        </div>
                                        <div className="friend-actions">
                                            <button className="confirm-button" onClick={() => handleCreateFriendRequest(suggest)}>Add Friend</button>
                                            <button className="delete-button">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Friends;