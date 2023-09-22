import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom"
import { encryptStorage } from "../../pages/auth/login";
import '../../styles/header.css';
import { AiFillHome } from 'react-icons/ai';
import { BsPersonCircle } from 'react-icons/bs';
import { FaUsers } from 'react-icons/fa';
import { MdPeopleOutline } from 'react-icons/md';
import { IoMdNotifications } from 'react-icons/io';
import { GrMenu } from 'react-icons/gr';
import { BsMessenger } from 'react-icons/bs';
import DarkMode from "../DarkMode/DarkMode"
import LoadingAnimation from "../loadingAnimation";

const GET_TOKEN_USER_MUTATION = gql`
  mutation GetUserIDByToken($token:String!){
    getUserIdByToken(token:$token){
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

const GET_NOTIF_COUNT_QUERY = gql`
    query GetNotificationCountByStatus($userid:ID!){
      getNotificationCountByStatus(userid: $userid)
    }
`;

export default function Header(){
    const [userData] = useMutation(GET_TOKEN_USER_MUTATION)
    const [isDropdownProfileOpen, setIsDropdownProfileOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>();
    const [searchInput, setSearchInput] = useState("");
    const navigate = useNavigate();
    const [loadingAnimation, setLoadingAnimation] = useState(false);

    const { loading: loadingNotifCount, error: errorNotifCount, data: dataNotifCount} =  useQuery(GET_NOTIF_COUNT_QUERY, {
      variables: { userid: selectedUser?.id },
  })
    const countNotif = dataNotifCount?.getNotificationCountByStatus || 0;

    const location = useLocation();
    const headerHiddenPaths = ["/login", "/register"];
    const hideHeader = headerHiddenPaths.includes(location.pathname);

    const user = selectedUser || [];

    useEffect(()=>{
      const reload = async() => {
        if(!hideHeader){
          await userData({
              variables: {
                  token: encryptStorage.getItem("jwtToken"),
              },
          }).then(async (result) => {
              // console.log(result.data.getUserIdByToken.id)
              setSelectedUser(result.data.getUserIdByToken)
              encryptStorage.setItem("idUser", result.data.getUserIdByToken.id)
              const selectedTheme = localStorage.getItem("selectedTheme");

              if(selectedTheme === "dark"){
                  console.log("masuk dark")
                  const body = document.querySelector("body");
                  if (body) {
                      body.setAttribute('data-theme', 'dark');
                      localStorage.setItem("selectedTheme", "dark")
                  }
              }
          })
        }
      }
      reload()
    },[])

    if (hideHeader) {
      return null; 
    }

    const isFindAccountPage = location.pathname === "/forgotAccount";
    const headerMain = location.pathname === "/" || location.pathname.startsWith("/search/") 
    || location.pathname === "/friends" || location.pathname === "/notification" 
    || location.pathname.startsWith("/profile/") || location.pathname === "/messenger" || location.pathname === "/group"
    || location.pathname.startsWith("/groupProfile/") ;
    // const headerHome = ["/", "/search/:searchQuery"];
    // const headerMain = headerHome.includes(location.pathname);

    let isHomePage = false;
    if (headerMain) {
      isHomePage = true;
    }

    const toggleDropdownProfile = () => {
      setIsDropdownProfileOpen(!isDropdownProfileOpen);
    };

    const handleLogout = () => {
      encryptStorage.removeItem("jwtToken");
      encryptStorage.removeItem("idUser");
      window.location.href = '/login'
    }

    const handleEnterSearch = () => {
      setLoadingAnimation(true);
      if (searchInput.trim() !== "") {
        setTimeout(() => {
          setLoadingAnimation(false);
          navigate(`/search/${encodeURIComponent(searchInput)}`);
        }, 1200);
      }
    };

    const handleMyProfile = () => {
      navigate(`/profile/${encodeURIComponent(selectedUser?.id)}`);
      setIsDropdownProfileOpen(false)
    };

    return (
      <header>
        {isFindAccountPage && (
          <nav className="navbar">
            <div className="find-account-header">
              <div className="logo">
                <img src='logofb.svg' className='fblogoheader'></img>
              </div>
              <div className="header-to-login">
                <button>Login</button>
                <div className="findAccount">Forgotten account?</div>
              </div>
            </div>
          </nav>
        )}
        {isHomePage && (
          <nav className="navbar">
            <div className="navbar-container">
              <div className="navbar-fb">
                <Link to="/" className="navbar-logo">
                  <img src='/iconsfb.svg' className='logo-img'></img>
                </Link>
                <div className="navbar-search">
                  <input 
                    type="text" 
                    placeholder="Search Facebook" 
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

              <div className="navbar-icons">
                <Link to="/" className="navbar-icon">
                  <AiFillHome size={30} color={(location.pathname === "/") ? '#1877f2' : 'grey'} />
                </Link>
                <Link to="/friends" className="navbar-icon">
                  <MdPeopleOutline size={30} color={(location.pathname === "/friends") ? '#1877f2' : 'grey'} />
                </Link>
                <Link to="/group" className="navbar-icon">
                  <FaUsers size={30} color={(location.pathname === "/group" || location.pathname.startsWith("/groupProfile/")) ? '#1877f2' : 'grey'} />
                </Link>
              </div>

              <div className="navbar-profile">
                <Link to="/" className="navbar-icon-profile">
                  <GrMenu size={30} color="grey" />
                </Link>
                <Link to="/messenger" className="navbar-icon-profile">
                  <BsMessenger size={30} color={(location.pathname === "/messenger") ? '#1877f2' : 'grey'} />
                </Link>
                <Link to="/notification" className="navbar-icon-profile-notification">
                  <IoMdNotifications size={30} color={(location.pathname === "/notification") ? '#1877f2' : 'grey'} />
                  <div className="count-notification">{countNotif}</div>
                </Link>
                <div className="navbar-icon-profile" onClick={toggleDropdownProfile}>
                  <img src={user?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                </div>
                {isDropdownProfileOpen && (
                  <div className="dropdown-menu"> 
                    <div className="dropdown-user-profile">
                      <img src={user?.profilepic} alt="" style={{ width: '40px', height: '40px', borderRadius: '25px' }} />
                      <p className="dropdown-username">{selectedUser?.firstname + " " + selectedUser?.surname}</p>
                    </div>
                    <button className="dropdown-button-profile" onClick={handleMyProfile}>My Profile</button>
                    <button className="dropdown-button-logout" onClick={handleLogout}>Logout</button>
                    <DarkMode />
                  </div>
                )}
              </div>
              <LoadingAnimation loading={loadingAnimation} />
            </div>
          </nav>  
        )}
      </header>
    );
}