import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { encryptStorage, Login } from "./pages/auth/login"
import { Register } from "./pages/auth/register"
import { Home } from "./pages/home"
import { Activate } from "./pages/activate"
import { ForgotAccount } from "./pages/forgotAccount"
import { ResetPassword } from "./pages/resetPassword"
import Story from "./pages/story"
import Header from "./component/layout/header";
import Footer from "./component/layout/footer";
import StoryView from "./pages/storyView";
import Search from "./pages/search";
import Reels from "./pages/reels";
import ReelsView from "./pages/reelsView";
import Friends from "./pages/friends";
import Notification from "./pages/notification";
import Profile from "./pages/profile";
import Messenger from "./pages/messenger";
import CreateGroup from "./pages/createGroup";
import Group from "./pages/group";
import GroupProfile from "./pages/groupProfile";
import { useEffect, useState } from "react";
import LoadingAnimation from "./component/loadingAnimation";


function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const jwtToken = encryptStorage.getItem("jwtToken");
    setIsUserLoggedIn(!(jwtToken == null));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div><LoadingAnimation loading={isLoading}/></div>;
  }
  
  return (
    <Router>
      <Header />
      <Routes>
            <Route path="/" element={isUserLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
            <Route path="/register" element={!isUserLoggedIn ? <Register /> : <Navigate to="/" replace />} />
            <Route path="/login" element={!isUserLoggedIn ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/activate/:id" element={!isUserLoggedIn ? <Activate /> : <Navigate to="/" replace />} />
            <Route path="/forgotAccount" element={!isUserLoggedIn ? <ForgotAccount /> : <Navigate to="/" replace />} />
            <Route path="/story" element={isUserLoggedIn ? <Story /> : <Navigate to="/login" replace />} />
            <Route path="/storyView" element={isUserLoggedIn ? <StoryView /> : <Navigate to="/login" replace />} />
            <Route path="/reels" element={isUserLoggedIn ? <Reels /> : <Navigate to="/login" replace />} />
            <Route path="/reelsView" element={isUserLoggedIn ? <ReelsView /> : <Navigate to="/login" replace />} />
            <Route path="/friends" element={isUserLoggedIn ? <Friends /> : <Navigate to="/login" replace />} />
            <Route path="/notification" element={isUserLoggedIn ? <Notification /> : <Navigate to="/login" replace />} />
            <Route path="/messenger" element={isUserLoggedIn ? <Messenger /> : <Navigate to="/login" replace />} />
            <Route path="/createGroup" element={isUserLoggedIn ? <CreateGroup /> : <Navigate to="/login" replace />} />
            <Route path="/group" element={isUserLoggedIn ? <Group /> : <Navigate to="/login" replace />} />
            <Route path="/groupProfile/:groupId" element={isUserLoggedIn ? <GroupProfile /> : <Navigate to="/login" replace />} />
            <Route path="/search/:searchQuery" element={isUserLoggedIn ? <Search /> : <Navigate to="/login" replace />} />
            <Route path="/profile/:userId" element={isUserLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
            <Route path="/resetPassword/:id" element={!isUserLoggedIn ? <ResetPassword /> : <Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;