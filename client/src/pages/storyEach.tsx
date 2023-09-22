import '../styles/storyEach.css';

interface StoryProps {
  story: Story;
  isActive: boolean;
}

const StoryEach: React.FC<StoryProps> = ({ story, isActive }) => {

    const divStyle = story.image !== ""
    ? {
        backgroundImage: `url(${story.image})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: '100%',
        height: '100%',
        backgroundColor: '#445069',
        borderRadius: '15px',
      }
    : {
        backgroundColor: story.backgroundColor,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '15px',
        color: 'white',
      };
    
  return (
    <>
      <div style={divStyle} className={`story ${isActive ? "story-active" : ""}`}>
        <div style={{ fontFamily: story.font }}>
            {story.text}
        </div>
      </div>
    </>
  );
};

export default StoryEach;