import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import { getCurrentUser } from '../component/getCurrentUser';
import '../styles/notification.css';


const GET_ALL_NOTIF_QUERY = gql`
    query GetAllNotificationByUserID($id:ID!, $isAll:Boolean!){
        getAllNotificationByUserId(id: $id, isAll: $isAll) {
            id
            userid
            username
            text
            date
            status
        }
    }
`;

const Notification = () => {
    const currUser = getCurrentUser()
    const [activeLink, setActiveLink] = useState("All");
    const [isAll, setIsAll] = useState(true);

    const user = currUser?.getUserIdByToken || [];
    
    const { loading: loadingAllNotif, error: errorAllNotif, data: dataAllNotif} =  useQuery(GET_ALL_NOTIF_QUERY, {
        variables: { id: user.id, isAll: isAll },
    })
    
    const notifications = dataAllNotif?.getAllNotificationByUserId || [];

    const handleActiveLinkClick = (linkName: string) => {
        setActiveLink(linkName);
        if(linkName === "All") {
            setIsAll(true)
        }else{
            setIsAll(false)
        }
    };

    if(!currUser) return null
    
    return (
        <div className='notification-container'>
            <div className='notification-main'>
                <div className='notification-header'>
                    <h2>Notifications</h2>
                    <div className='notification-buttons'>
                        <div className={`notification-button ${activeLink === 'All' ? "notification-button-active" : ""}`} onClick={() => handleActiveLinkClick('All')}>All</div>
                        <div className={`notification-button ${activeLink === 'Unread' ? "notification-button-active" : ""}`} onClick={() => handleActiveLinkClick('Unread')}>Unread</div>
                    </div>
                </div>
                <div className='notiffication-content'>
                    <div className='notification-all'>
                        {activeLink === "All" && ( 
                            notifications.map((notification: UserNotification) => (
                                <div key={notification.id}>
                                    {notification.text}
                                </div>
                            ))
                        )}
                        {activeLink === "Unread" && (
                            notifications.map((notification: UserNotification) => (
                                <div key={notification.id}>
                                    {notification.text}
                                </div>
                            ))
                        )}
                    </div>
                    <div className='notification-unread'>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notification