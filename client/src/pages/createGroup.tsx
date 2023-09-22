import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { getCurrentUser } from '../component/getCurrentUser';
import '../styles/createGroup.css';

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

const CREATE_GROUP_MUTATION = gql`
    mutation CreateGroup($inputGroup:NewGroup!){
        createGroup(inputGroup:$inputGroup){
            id
            name
            privacy
            profilepic
            date
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

const CREATE_GROUP_INVITED_MUTATION = gql`
    mutation CreateGroupInvited($inputGroupInvited:NewGroupInvited!){
        createGroupInvited(inputGroupInvited:$inputGroupInvited){
            id
            groupid
            userid
        }
    } 
`;


const CreateGroup = () => {
    const currUser = getCurrentUser();
    const userId = currUser?.getUserIdByToken?.id;

    const [textGroupName, setTextGroupName] = useState("Group name");
    const [selectedPrivacyGroup, setSelectedPrivacyGroup] = useState('Public');
    const [selectedFriends, setSelectedFriends] = useState<User[]>([]); 
    const [errorMessage, setErrorMessage] = useState<string>(''); 
    const [createGroupMutation] = useMutation(CREATE_GROUP_MUTATION);
    const [createGroupMemberMutation] = useMutation(CREATE_GROUP_MEMBER_MUTATION);
    const [createGroupInvitedMutation] = useMutation(CREATE_GROUP_INVITED_MUTATION);

    const { loading: loadingAllFriend, error: errorAllFriend, data: dataAllFriend} =  useQuery(GET_ALL_FRIEND_QUERY, {
        variables: { userid: userId },
    })
    const friends = dataAllFriend?.getAllFriendByUserId || [];

    const closeCreateGroup = () => {
        window.location.href = "/group"
    };

    const addSelectedFriend = (friendIds: string) => {
        const selectedFriendsData = friends.filter((user: any) => friendIds.includes(user.id));
    
        const newSelectedFriends = selectedFriendsData.filter((friend: any) => !selectedFriends.some((selectedFriend: any) => selectedFriend.id === friend.id));
    
        setSelectedFriends((prevFriends: any) => [
            ...prevFriends,
            ...newSelectedFriends, 
        ]);
    };

    const handleCreateGroup = async () => {
        setErrorMessage("");
        if(textGroupName === "" || !textGroupName || textGroupName === "Group name"){
            setErrorMessage("Group name cannot be empty");
            return 
        }
        
        const inputGroup = {
            name: textGroupName,
            privacy: selectedPrivacyGroup,
        };

        const { data: dataGroup } = await createGroupMutation({
            variables: { inputGroup: inputGroup },
        });

        console.log(dataGroup.createGroup.id)

        const inputGroupMember = {
            groupid: dataGroup.createGroup.id,
            userid: userId,
            role: "Admin",
        };

        const { data: dataMember } = await createGroupMemberMutation({
            variables: { inputGroupMember: inputGroupMember },
        });

        console.log(dataMember.createGroupMember.id);

        if (selectedFriends.length > 0) {
            for (const selectedFriend of selectedFriends) {
                const inputGroupInvited = {
                    groupid: dataGroup.createGroup.id,
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

        setTextGroupName("Group name")
        setSelectedPrivacyGroup("Public")
        setSelectedFriends([]);
    }
    
    if(!currUser) return null

    return (
        <div className="create-group-container">
            <div className='create-group-left-sidebar'>
                <div className="icon-info">
                    <button onClick={closeCreateGroup} className="close-button-story">
                        &times;
                    </button>
                    <img src='iconsfb.svg' className='logo-img'></img>  
                </div>
                <div className="sidebar-header-create-group">
                    <div className="create-group-header">Groups {'>'} Create group</div>
                    <h2>Create Group</h2>
                </div>
                <div className="sidebar-curruser">
                    <div className="create-group-person">
                        <div className="create-group-icon-profile">
                            <img src={currUser?.getUserIdByToken.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                        </div>
                        <div className="create-group-name-profile">
                            <h3>{currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname}</h3>
                            <p>Admin</p>
                        </div>
                    </div>
                </div>
                <div className='create-group-sidebar-content'>  
                    <input
                        type="text"
                        placeholder="Group name"
                        className="group-name-input"
                        onChange={(e) => setTextGroupName(e.target.value)}
                    />
                    <select 
                        className="dropdown-menu-privacy-group"
                        onChange={(e) => {
                            if (e.target.value === 'Public') {
                                setSelectedPrivacyGroup('Public');
                            } else if (e.target.value === 'Private') {
                                setSelectedPrivacyGroup('Private');
                            }
                        }}
                        >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                    </select>

                    <select
                        className="dropdown-menu-friends-group"
                        onChange={(e) => {addSelectedFriend(e.target.value)}}
                        value={""}
                        >
                        <option value="" disabled>Invite Friends (Optional)</option>
                        {friends.map((friend: User) => (
                            <option key={friend.id} value={friend.id}>
                                {friend.firstname} {friend.surname}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='show-member-invited'>
                   {selectedFriends.map((friend: User) => (
                        <div className='member-invited'>
                            {friend.firstname + " " + friend.surname}
                        </div>
                   ))}
                </div>
                <div className="create-group-buttons">
                    {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}
                    <button className="reels-button-next" onClick={handleCreateGroup}>Create</button>
                </div>
            </div>

            <div className='create-group-main-content'>
                <div className="group-preview-container">
                    <div className="group-preview-header"><h2>Preview</h2></div>
                    <div className="group-preview">
                        <div className="group-preview-blank">
                            <img src="/createGroup.png" alt="" />
                            <h2>{textGroupName}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateGroup;