import { BsPersonCircle } from "react-icons/bs";
import '../styles/storyView.css';
import { getCurrentUser } from "../component/getCurrentUser";
import { useEffect, useState } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import React from "react";
import StoryEach from "./storyEach";
import { FaGreaterThan, FaLessThan } from "react-icons/fa";
import StoryProgress from "./storyProgress";
import { differenceInDays } from "date-fns";

const GET_ALL_STORY_BY_USERID_QUERY = gql`
  query GetAllStoryByUserID($id:ID!){
    getAllStoryByUserId(id: $id) {
        id
        userid
        username
        image
        text
        backgroundColor
        date
        font
    }
  }
`;

const GET_ALL_FRIEND_QUERY = gql`
    query GetAllFriendByUserIDWithStory($userid:ID!){
      getAllFriendByUserIdWithStory(userid: $userid) {
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

const StoryView = () => {
    const apolloClient = useApolloClient();
    const currUser = getCurrentUser()
    const userId = currUser?.getUserIdByToken?.id;
    const [selectedId, setSelectedId] = useState<any>("");
    const [storyMap, setStoryMap] = useState<any>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const { loading: loadingAllFriend, error: errorAllFriend, data: dataAllFriend} =  useQuery(GET_ALL_FRIEND_QUERY, {
      variables: { userid: userId },
    })
    const friends = dataAllFriend?.getAllFriendByUserIdWithStory || [];

    useEffect(() => {
        if(selectedId){
            fetchStoryByUserId(selectedId)
        }
        setSelectedId("")
    }, [selectedId]);

    useEffect(() => {
      if(storyMap){
          console.log(storyMap)
      }
    }, [storyMap]);
    
    if(!currUser) return null
    // console.log(currUser.getUserIdByToken.id)

    const closeStory = () => {
        window.location.href = "/"
    };

    const handleSelectedPerson = (id: any) => {
        setSelectedId(id)
    };

    async function fetchStoryByUserId(userId: any) {
        try {
          await apolloClient.query({
            query: GET_ALL_STORY_BY_USERID_QUERY,
            variables: { id: userId },
          }).then(async response => {
            if (!response.error) {
                setStoryMap("")
                const currentDate = new Date();
                const filteredStories = response.data.getAllStoryByUserId.filter((story: any) => {
                  const daysDifference = differenceInDays(currentDate, new Date(story.date));
                  return daysDifference <= 1;
                });
                setStoryMap(filteredStories)
            }
          });
        } catch (error) {
          console.error("Error fetching mediaa:", error);
          return [];
        }
    }

    const prevSlide = () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        const storiesCount = storyMap.length;
        setCurrentIndex(storiesCount - 1);
      }
    };

    const nextSlide = () => {
      if (currentIndex < storyMap.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    };
    
    return (
      <div className="storyview-container">
          <div className="story-left-sidebar">
              <div className="icon-info">
                  <button onClick={closeStory} className="close-button-story">
                      &times;
                  </button>
                  <img src='iconsfb.svg' className='logo-img'></img>
              </div>

              <div className="sidebar-people-story">
                  <div className="sidebar-header">
                      <h2>Stories</h2>
                  </div>
                  <div className="sidebar-user">
                      
                    <div className="story-person" onClick={() => handleSelectedPerson(currUser?.getUserIdByToken.id)}>
                        <div className="story-view-icon-profile">
                          <img src={currUser?.getUserIdByToken.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                        </div>
                        <h3>{currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname}</h3>
                    </div>

                      {friends.map((friend: User) => (
                        <div className="story-person" key={friend.id} onClick={() => handleSelectedPerson(friend.id)}>
                            <div className="story-view-icon-profile">
                              <img src={friend.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                            </div>
                            <h3>{friend.firstname + " " + friend.surname}</h3>
                        </div>
                      ))}
                  </div>
                  
              </div>
          </div>

          <div className="storyview-main-container">
            <div className="carousel-prev" onClick={prevSlide}>
              <FaLessThan />
            </div>
            <div className="storyview-content">
              <div className="progress-story-bar">
                {storyMap.map((story: Story, index: number) => (
                    <StoryProgress key={story.id} isActive={index === currentIndex} nextSlide={nextSlide} />
                ))} 
              </div>
              {storyMap.map((story: Story, index: number) => (
                <React.Fragment key={story.id}>
                  <StoryEach key={story.id} story={story} isActive={index === currentIndex} />
                </React.Fragment>
              ))}
            </div>
            <div className="carousel-next" onClick={nextSlide}>
              <FaGreaterThan />
            </div>
          </div>
      </div>
    )
}

export default StoryView