import { gql, useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { BsPersonCircle } from "react-icons/bs";
import { FaImages } from "react-icons/fa";
import { IoIosCreate } from "react-icons/io";
import { getCurrentUser } from "../component/getCurrentUser";
import '../styles/messenger.css';
import Axios from 'axios';

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

const GET_ALL_CONVERSATION_QUERY = gql`
    query GetAllConversationByUserID($userid:String!, $name:String){
        getAllConversationByUserId(userid: $userid, name:$name) {
            id
            user1{
            id
            firstname
            surname
            email
            dob
            gender
            profilepic
            isActive
            }
            user2{
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
    }
`;

const GET_ALL_MESSAGE_BY_CONVERSATIONID_QUERY = gql`
    query GetAllMessageByConversationID($conversationid:String!){
        getAllMessageByConversationId(conversationid: $conversationid) {
            id
            conversationid
            senderid
            content
            date
        }
    }
`;

const CREATE_MESSAGE_MUTATION = gql`
    mutation CreateMessage($inputMessage:NewMessage!){
        createMessage(inputMessage:$inputMessage)
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

const Messenger = () => {
    const apolloClient = useApolloClient();
    const currUser = getCurrentUser()
    const userId = currUser?.getUserIdByToken?.id;
    const [searchInput, setSearchInput] = useState("");
    const [textChat, setTextChat] = useState("");
    const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
    const [isMessageChatOpen, setIsMessageChatOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<any>();
    const [selectedPhoto, setSelectedPhoto] = useState<any>([]);
    const [isPhotoSelected, setIsPhotoSelected] = useState(false);

    const [createMessageMutation] = useMutation(CREATE_MESSAGE_MUTATION);
    const [createNotifMutation] = useMutation(CREATE_NOTIF_MUTATION);

    const { loading: loadingAllFriend, error: errorAllFriend, data: dataAllFriend} =  useQuery(GET_ALL_FRIEND_QUERY, {
        variables: { userid: userId },
    })
    const friends = dataAllFriend?.getAllFriendByUserId || [];

    const { loading: loadingAllConversation, error: errorAllConversation, data: dataAllConversation} =  useQuery(GET_ALL_CONVERSATION_QUERY, {
        variables: { userid: userId, name: searchInput },
    })
    const conversations = dataAllConversation?.getAllConversationByUserId || [];

    const { loading: loadingAllMessage, error: errorAllMessage, data: dataAllMessage, refetch: refetchDataMessage} =  useQuery(GET_ALL_MESSAGE_BY_CONVERSATIONID_QUERY, {
        variables: { conversationid: selectedConversation?.id },
    })
    const messageMap = dataAllMessage?.getAllMessageByConversationId || [];

    const handleEnterSearch = () => {
        setIsMessageChatOpen(false)
        if(searchInput === ""){
            setIsSearching(false);
        }else{
            setIsSearching(true)
            
        }
    };

    const handleChooseAllFriend = () => {
        setIsCreateChatOpen(!isCreateChatOpen);
    };

    const handleCreateMessage = async () => {
        if (!textChat && !selectedPhoto) {
            return; 
        }

        if(isPhotoSelected){
            console.log("image")
            const formData = new FormData();
            formData.append("file", selectedPhoto[0])
            formData.append("upload_preset","orsgh758")
            let apiUrl = 'https://api.cloudinary.com/v1_1/dnl7josxn/';
            if (selectedPhoto[0].type.includes('image')) {
                apiUrl += 'image/upload';
            } else {
                console.log(`Unsupported file type: ${selectedPhoto[0].type}`);
            }


            let photoUrl;

            try {
                const response = await Axios.post(apiUrl, formData);
                const secureUrl = response.data.secure_url;
                photoUrl = secureUrl;
            } catch (error) {
                console.error('Error uploading file:', error);
            }

            const inputMessage = {
                conversationid: selectedConversation.id,
                senderid: userId,
                content: photoUrl
            };

            try {
                const response = await createMessageMutation({
                    variables: {
                        inputMessage: inputMessage,
                    },
                });
            
                console.log("Message created:", response.data);
            } catch (error) {
                console.error("Error creating Message:", error);
            }

        }else {
            const inputMessage = {
                conversationid: selectedConversation.id,
                senderid: userId,
                content: textChat
            };

            try {
                const response = await createMessageMutation({
                    variables: {
                        inputMessage: inputMessage,
                    },
                });
            
                console.log("Message created:", response.data);
            } catch (error) {
                console.error("Error creating Message:", error);
            }
        }

        const inputNotification = {
            userid: selectedConversation.user1.id === userId ? selectedConversation.user2.id : selectedConversation.user1.id,
            username: currUser?.getUserIdByToken?.firstname + " " + currUser?.getUserIdByToken?.surname,
            text: currUser?.getUserIdByToken?.firstname + " " + currUser?.getUserIdByToken?.surname + " chat you",
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
        
        setIsPhotoSelected(false)
        setSelectedPhoto("")
        setTextChat("")
    };

    useEffect(() => {
        // Create and initialize the WebSocket connection
        const ws = new WebSocket('ws://localhost:7778/websocket');

        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            
            refetchDataMessage();
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    const handleInputPhotoClick = () => {
        const mediaInput = document.getElementById('media-input');
        if (mediaInput) {
          mediaInput.click();
        }
    };

    const handleMediaChange = (e: any) => {
        const selectedFiles = e.target.files;
        setSelectedPhoto(selectedFiles);
        setIsPhotoSelected(true)
    };

    const handleSelectConversation = async (conversation: ConversationHeader) => {
        setSelectedConversation("")
        setIsMessageChatOpen(true)
        setSelectedConversation(conversation)
    };
    
    if(!currUser) return null

    return (
        <div className="messenger-container">
            <div className="messenger-left-sidebar">
                <div className="sidebar-people-messenger">
                    <div className="sidebar-header">
                        <h2>Chats</h2>
                        <div className="create-chat-icon" onClick={handleChooseAllFriend}>
                            <IoIosCreate size={30} color="black" />
                            {isCreateChatOpen && (  
                                <div className="create-chat-container">
                                    {friends.map((friend: User) => (
                                        <div className="choose-friend-mapping" key={friend.id}>
                                            <div className="choose-friend-each-card">
                                                <img src={friend.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                                                {friend.firstname + " " + friend.surname}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                   
                    <div className="sidebar-search">
                        <div className="navbar-search">
                            <input 
                                type="text" 
                                placeholder="Search Messenger" 
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
                    <div className="sidebar-chat-header">
                        {conversations.map((conversation: ConversationHeader) => (
                            <div className="choose-friend-mapping" key={conversation.id}>
                                <div className="choose-friend-each-card" onClick={() => handleSelectConversation(conversation)} >
                                    {conversation.user1.id === userId ? (
                                        <>
                                        <img src={conversation.user2.profilepic} alt="" />
                                        <div>{conversation.user2.firstname + " " + conversation.user2.surname}</div>
                                        </>
                                    ) : (
                                        <>
                                        <img src={conversation.user1.profilepic} alt="" />
                                        <div>{conversation.user1.firstname + " " + conversation.user1.surname}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="messenger-main-content">
                <div className="messenger-view">
                    {isMessageChatOpen && (
                        <div>
                            {messageMap.map((message: Message) => (
                                <div
                                className="chat-card-person"
                                key={message.id}>
                                    {message.senderid !== userId && (
                                        <BsPersonCircle size={30} color="grey" />
                                    )}
                                    <div className={`popup-chat ${message.senderid === userId ? "sent-message" : "received-message"}`}>
                                        {message.content.includes('/image/') ? (
                                            <img src={message.content} alt="Image" />
                                        ) : (
                                            <div className="chat-text">{message.content}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {isMessageChatOpen && (
                    <div className="messenger-input">
                        <div className="input-image" onClick={handleInputPhotoClick}>
                            <FaImages size={30} color="black" />
                            <input
                                id="media-input"
                                type="file"
                                accept=".jpg, .jpeg, .png"
                                className="media-input"
                                multiple
                                onChange={handleMediaChange} 
                                />
                        </div>
                        <div className="input-text">
                            <input
                                type="text"
                                placeholder="Aa"
                                className="message-input"
                                value={textChat}
                                onChange={(e) => setTextChat(e.target.value)}
                            />
                            <button className="comment-button" onClick={handleCreateMessage}>Send</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Messenger;