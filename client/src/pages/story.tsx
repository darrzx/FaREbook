import { Link } from "react-router-dom";
import '../styles/story.css';
import { getCurrentUser } from "../component/getCurrentUser";
import { useEffect, useState } from "react";
import { BsPersonCircle } from 'react-icons/bs';
import { MdAddToPhotos } from 'react-icons/md';
import { IoText } from 'react-icons/io5';
import Axios from 'axios';
import { gql, useMutation } from "@apollo/client";

const CREATE_STORY_MUTATION = gql`
  mutation CreateStory($inputStory: NewStory!) {
    createStory(inputStory: $inputStory) {
        id
        userid
        username
        image
        text
        backgroundColor
        date
    }
  }
`;

const colorOptions = [
    '#00ffff', '#00ff00', '#0000ff', '#ffff00', '#ff0000', '#ff00ff',
    '#800000', '#008000', '#000080', '#808000', '#008080', '#800080',
    '#ff8c00', '#00ff8c', '#8c00ff', '#ffc000', '#00ffc0', '#c000ff',
    '#ff6347', '#7fffd4', '#9370db', '#32cd32', '#d2691e', '#ba55d3'
];

const Story = () => {
    const currUser = getCurrentUser()
    const [isPhotoSelected, setIsPhotoSelected] = useState(false);
    const [isTextSelected, setIsTextSelected] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<any>([]);
    const [createStoryMutation] = useMutation(CREATE_STORY_MUTATION);
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
    const [textStory, setTextStory] = useState("Start typing");
    const [selectedStyle, setSelectedStyle] = useState('Arial');

    if(!currUser) return null
    // console.log(currUser.getUserIdByToken.id)

    const closeStory = () => {
        window.location.href = "/"
    };

    const handleCreateStoryPhotoClick = () => {
        const mediaInput = document.getElementById('media-input');
        if (mediaInput) {
          mediaInput.click();
        }
    };

    const handleCreateStoryTextClick = () => {
        setIsTextSelected(true)
        setIsPhotoSelected(false)
    };

    const handleMediaChange = (e: any) => {
        const selectedFiles = e.target.files;
        setSelectedPhoto(selectedFiles);
        setIsPhotoSelected(true)
        setIsTextSelected(false)
    };

    const handleDiscardStory = () => {
        setIsPhotoSelected(false)
        setIsTextSelected(false)
        setSelectedPhoto("")
    };

    const handleCreateStory = async () => {
        if(isPhotoSelected){
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

            const inputStory = {
                userid: currUser?.getUserIdByToken.id,
                username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
                image: photoUrl,
                text: "",
                backgroundColor: "", 
                font: selectedStyle
            };

            try {
                const response = await createStoryMutation({
                    variables: {
                        inputStory: inputStory,
                    },
                });
                console.log("Post created:", response.data.createStory);
            } catch (error) {
                console.error("Error creating post:", error);
            }
        }else if(isTextSelected) {
            const inputStory = {
                userid: currUser?.getUserIdByToken.id,
                username: currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname,
                image: "",
                text: textStory,
                backgroundColor: selectedColor, 
                font: selectedStyle
            };

            try {
                const response = await createStoryMutation({
                    variables: {
                        inputStory: inputStory,
                    },
                });
                console.log("Post created:", response.data.createStory);
            } catch (error) {
                console.error("Error creating post:", error);
            }
        }

        

        setIsPhotoSelected(false)
        setIsTextSelected(false)
        setSelectedPhoto("")
        setTextStory("Start typing")
        setSelectedColor(colorOptions[0])
    };

    const handleColorChange = (color : any) => {
        setSelectedColor(color);
    };

    return (
        <div className="story-container">
            <div className="story-left-sidebar">
                <div className="icon-info">
                    <button onClick={closeStory} className="close-button-story">
                        &times;
                    </button>
                    <img src='iconsfb.svg' className='logo-img'></img>
                </div>

                <div className="sidebar-people-story">
                    <div className="sidebar-header">
                        <h2>Your Story</h2>
                    </div>
                    <div className="sidebar-curruser">
                        <div className="story-person">
                            <div className="story-icon-profile">
                                <BsPersonCircle size={30} color="grey" style={{marginTop: '8px'}}/>
                            </div>
                            <h3>{currUser?.getUserIdByToken.firstname + " " + currUser?.getUserIdByToken.surname}</h3>
                        </div>
                    </div>
                    {isTextSelected && (
                        <div className="text-story-content">
                            <textarea
                            className="text-area-story"
                            placeholder="Start typing"
                            // value={textStory} 
                            onChange={(e) => setTextStory(e.target.value)}
                            />
                            <select 
                            className="dropdown-menu-inside"
                            // value={selectedStyle}
                            onChange={(e) => {
                                if (e.target.value === 'simple') {
                                    setSelectedStyle('Arial');
                                } else if (e.target.value === 'clean') {
                                    setSelectedStyle('Consolas');
                                } else if (e.target.value === 'casual') {
                                    setSelectedStyle('Palatino Linotype');
                                } else if (e.target.value === 'fancy') {
                                    setSelectedStyle('Courier New');
                                } else if (e.target.value === 'headline') {
                                    setSelectedStyle('Georgia');
                                }
                            }}
                            >
                                <option value="simple">Simple</option>
                                <option value="clean">Clean</option>
                                <option value="casual">Casual</option>
                                <option value="fancy">Fancy</option>
                                <option value="headline">Headline</option>
                            </select>
                            <div className='story-color-picker'>
                                <div className="colors-header">Backgrounds</div> 
                                <div className='colors-container'>
                                    {colorOptions.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`color-option ${selectedColor === color ? 'selected-color' : ''}`}
                                        style={{ backgroundColor: color, width: "1.5em", height: "1.5em", borderRadius: "50%", margin: "5px" }}
                                        onClick={() => handleColorChange(color)}
                                    ></div>
                                    ))}
                                </div> 
                            </div>
                        </div>
                    )}
                    {(isPhotoSelected || isTextSelected) && (
                        <div className="story-buttons">
                        <button className="story-button-discard" onClick={handleDiscardStory}>Discard</button>
                        <button className="story-button-share" onClick={handleCreateStory}>Share to story</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="story-main-content">
                {!isPhotoSelected && !isTextSelected && (
                <>
                    <div className="create-photo-story" onClick={handleCreateStoryPhotoClick}>
                        <div className="create-photo-header">
                            <MdAddToPhotos size={24} color="white" />
                            <h4>Create a photo story</h4>
                        </div>
                        <input
                            id="media-input"
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            className="media-input"
                            multiple
                            onChange={handleMediaChange} />
                    </div>

                    <div className="create-text-story" onClick={handleCreateStoryTextClick}>
                        <div className="create-text-header">
                            <IoText size={24} color="white" />
                            <h4>Create a text story</h4>
                        </div>
                    </div>
                </>
                )}
                {isPhotoSelected && (
                    <div className="selected-photo-container">
                        <div className="selected-photo">
                            <img src={URL.createObjectURL(selectedPhoto[0])} alt="" />
                        </div>
                    </div>
                )}
                {isTextSelected && (
                    <div className="selected-text-container">
                        <div className="selected-text-header"><h2>Preview</h2></div>
                        <div className="selected-text">
                            <div className="text-story-preview" 
                                style={{ background: selectedColor}}>
                                <div className="create-text-header">
                                    <h3 
                                    style={{ fontFamily: selectedStyle}}
                                    >{textStory}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Story;