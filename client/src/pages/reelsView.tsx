import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useState } from 'react';
import { FaGreaterThan, FaLessThan, FaShare } from 'react-icons/fa';
import { IoIosCreate } from 'react-icons/io';
import '../styles/reelsView.css';
import ReelsEach from './reelsEach';

const GET_ALL_REELS_QUERY = gql`
  query GetAllReels{
    getAllReels {
        id
        userid
        username
        video
        text
        date
        commentcount
    }
  }
`;

const ReelsView = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { loading: loadingAllReels, error: errorAllReels, data: dataAllReels, refetch: refetchDataReels} =  useQuery(GET_ALL_REELS_QUERY)

    const reels = dataAllReels?.getAllReels || [];

    console.log(reels)

    const closeReels = () => {
        window.location.href = "/"
    };

    const goToCreateReels = () => {
        window.location.href = "/reels"
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        } else {
          const reelsCount = reels.length;
          setCurrentIndex(reelsCount - 1);
        }
    };

    const nextSlide = () => {
        if (currentIndex < reels.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    return (
        <div className="reelsview-container">
            <div className="reelsview-left-sidebar">
                <div className="reels-icon-info">
                    <button onClick={closeReels} className="close-button-story">
                        &times;
                    </button>
                    <img src='iconsfb.svg' className='logo-img'></img>
                    <h3>Reels</h3>
                </div>
            </div>

            <div className="reelsview-main-content">
                <div className="carousel-prev-reels" onClick={prevSlide}>
                    <FaLessThan />
                </div>
                <div className="reelsview-content">
                    {reels.map((reel: Reels, index: number) => (
                    <React.Fragment key={reel.id}>
                        <ReelsEach key={reel.id} reels={reel} isActive={index === currentIndex} />
                    </React.Fragment>
                    ))}
                </div>
                <div className="carousel-next" onClick={nextSlide}>
                    <FaGreaterThan />
                </div>
            </div>
            

            <div className="reelsview-right-sidebar">
                <div className='create-reels-icon' onClick={goToCreateReels}>
                    <IoIosCreate size={50} color="white" />
                </div>
            </div>
        </div>
    )
}

export default ReelsView