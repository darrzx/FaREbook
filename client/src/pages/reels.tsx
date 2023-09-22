import { Link } from "react-router-dom";
import '../styles/reels.css';
import { getCurrentUser } from "../component/getCurrentUser";
import { useEffect, useRef, useState } from "react";
import { MdAddToPhotos } from 'react-icons/md';
import Axios from 'axios';
import { gql, useMutation } from "@apollo/client";
import { FaVideo } from "react-icons/fa";

const CREATE_REELS_MUTATION = gql`
    mutation CreateReels($inputReels: NewReels!) {
        createReels(inputReels: $inputReels) {
            id
            userid
            username
            video
            text
            date
        }
    }
`;

const Reels = () => {
    const currUser = getCurrentUser()
    const [selectedVideo, setSelectedVideo] = useState<any>([]);
    const [isNext, setIsNext] = useState(false);
    const [textReel, setTextReel] = useState("");
    const [createReelsMutation] = useMutation(CREATE_REELS_MUTATION);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>(''); 

    if(!currUser) return null
    // console.log(currUser.getUserIdByToken.id)

    const closeStory = () => {
        window.location.href = "/"
    };

    const handleMediaChange = (e: any) => {
        const selectedFile = e.target.files[0];
        const selectedFiles = e.target.files;
        setSelectedVideo(selectedFiles);
        if (selectedFile) {
            const selectedFileURL = URL.createObjectURL(selectedFile);
      
            if (videoRef.current) {
              videoRef.current.src = selectedFileURL;
            }
        }
    };

    const handleNext = () => {
        setErrorMessage("");
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;
            
            if (videoDuration >= 1 && videoDuration <= 60) {
                if(selectedVideo.length != 0){
                    setIsNext(true)
                }
            } else {
                setErrorMessage("Video duration is not within the required range");
            }
        }

    };

    const handlePrev = () => {
        setIsNext(false)
        setErrorMessage("")
    };

    const removeAddedVideo = () => {
        setSelectedVideo("")
        setIsNext(false)
        setErrorMessage("")
    };

    const handleCreateReelsClick = () => {
        const mediaInput = document.getElementById('media-input');
        if (mediaInput) {
          mediaInput.click();
        }
    };

    const handleCreateReels = async () => {
        setErrorMessage("")
        if (!textReel) {
            setErrorMessage("Text content cannot be empty");
            return; 
        }

        const formData = new FormData();
        formData.append("file", selectedVideo[0])
        formData.append("upload_preset","orsgh758")
        let apiUrl = 'https://api.cloudinary.com/v1_1/dnl7josxn/';
        if (selectedVideo[0].type.includes('video')) {
            apiUrl += 'video/upload';
        } else {
            console.log(`Unsupported file type: ${selectedVideo[0].type}`);
        }

        let videoUrl;

        try {
            const response = await Axios.post(apiUrl, formData);
            const secureUrl = response.data.secure_url;
            videoUrl = secureUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        const inputReels = {
            userid: currUser?.getUserIdByToken.id,
            username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
            video: videoUrl,
            text: textReel,
        };

        try {
            const response = await createReelsMutation({
                variables: {
                    inputReels: inputReels,
                },
            });
            console.log("Reels created:", response.data.createReels);
        } catch (error) {
            console.error("Error creating Reels:", error);
        }
        window.location.href = "/"
    }

    return (
        <div className="reels-container">
            <div className="reels-left-sidebar">
                {!isNext && (
                <>
                <div className="icon-info">
                    <button onClick={closeStory} className="close-button-story">
                        &times;
                    </button>
                    <img src='iconsfb.svg' className='logo-img'></img>
                </div>
                <div className="sidebar-people-reels">
                    <div className="sidebar-header-reels">
                        <div className="create-reels-header">Create a reel</div>
                        <h2>Upload Video</h2>
                    </div>

                    <div className="create-video-reels" onClick={handleCreateReelsClick}>
                        <div className="create-video-header">
                            <FaVideo size={24} color="var(--font_color)" />
                            <h4>Add video</h4>
                        </div>
                        <input
                            id="media-input"
                            type="file"
                            accept="video/*"
                            className="media-input"
                            onChange={handleMediaChange} />
                    </div>
                </div>
                <div className="reels-buttons">
                    {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}
                    <button className="reels-button-next" onClick={handleNext}>Next</button>
                </div>
                </>
                )}
                {isNext && (
                <>
                <div className="icon-info">
                    <button onClick={closeStory} className="close-button-story">
                        &times;
                    </button>
                    <img src='iconsfb.svg' className='logo-img'></img>
                </div>

                <div className="sidebar-people-reels">
                    <div className="sidebar-header">
                        <div>Create a reel</div>
                        <h2>Add details</h2>
                    </div>
                    <div className="create-video-content" onClick={handleCreateReelsClick}>
                        <textarea
                            className="text-area-story"
                            placeholder="Describe your reel..."
                            value={textReel} 
                            onChange={(e) => setTextReel(e.target.value)}
                        />
                    </div>
                </div>
                {errorMessage && <p className="error-message" style={{color: 'red'}}>{errorMessage}</p>}
                <div className="reels-buttons-next">
                    <button className="reels-button-previous" onClick={handlePrev}>Previous</button>
                    <button className="reels-button-publish" onClick={handleCreateReels}>Publish</button>
                </div>
                </>
                )}
            </div>

            <div className="reels-main-content">
                <div className="selected-video-container">
                    <div className="selected-video-header"><h2>Preview</h2></div>
                        <div className="selected-video">
                            {selectedVideo.length === 0 ? (
                                <div className="video-story-blank">
                                    <h3>Your Video Preview</h3>
                                    <div>Upload your video in order to see a preview here.</div>
                                </div>
                            ) : (
                                <>
                                <div className="video-story-preview">
                                    <div className="video-story-result">
                                        <video ref={videoRef} src={URL.createObjectURL(selectedVideo[0])} controls></video>
                                    </div>
                                </div>
                                <button onClick={removeAddedVideo} className="close-button-story">
                                    &times;
                                </button>
                                </>
                            )}
                        </div>
                </div>
            </div>
        </div>
    )
}

export default Reels;