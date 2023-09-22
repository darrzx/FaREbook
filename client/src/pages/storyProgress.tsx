import { useEffect, useState } from "react";
import '../styles/storyProgress.css';

interface StoryLifelineProps {
  isActive?: boolean;
  nextSlide: () => void;
}

const StoryProgress: React.FC<StoryLifelineProps> = ({ isActive, nextSlide }) => {
  const [progress, setProgress] = useState(0);
  const progressInterval = 100;
  const totalDuration = 5000;
  const totalSteps = totalDuration / progressInterval;
  let timeout: number | null = null;

  useEffect(() => {
    // Reset progress to 0 and clear the timeout when isActive changes
    setProgress(0);
    if (timeout) {
      clearTimeout(timeout);
    }

    if (isActive) {
      timeout = setTimeout(nextSlide, totalDuration);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isActive, nextSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 100 / totalSteps;
        return newProgress <= 100 ? newProgress : 100;
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [totalSteps]);

  return (
    <div className="progress-bar-story">
      <div style={{ width: isActive ? `${progress}%` : "0", backgroundColor: 'white' }} className="progress-bar-progress"></div>
    </div>
  );
};

export default StoryProgress;