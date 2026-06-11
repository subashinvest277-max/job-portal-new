import React, { useEffect, useState } from 'react';
import './Header.css';
import { Link, NavLink, useLocation } from 'react-router-dom';
import breifcase from '../assets/header_case.png';
import chat from '../assets/header_message.png';
import bell from '../assets/header_bell.png';
import bell_dot from '../assets/header_bell_dot.png';
import home_icon from '../assets/home_icon.png';
import { AvatarMenu } from '../Components-Jobseeker/AvatarMenu';
import { JNotification } from '../Components-Jobseeker/JNotification';
import { useJobs } from '../JobContext';
// import api from "../api/axios";


export const Header = () => {
  const location = useLocation();
  // const [showNotification, setShowNotification] = useState(false);
  // const [notificationsData, setNotificationsData] = useState([]);

  // Get notifications from JobContext
  const { notificationsData, showNotification, setShowNotification, fetchNotifications, chats, currentUserId } = useJobs();

  const newNotificationsCount = Array.isArray(notificationsData)
    ? notificationsData.filter(n => !n.is_read).length
    : 0;

  const unreadMessagesCount = chats.filter(
    chat => (chat.unread_count || 0) > 0
  ).length;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPortalDropdown, setShowPortalDropdown] = useState(false);

  const isLoggedIn =
    location.pathname.includes('/jobseeker') &&
    !location.pathname.includes('/login') &&
    !location.pathname.includes('/signup');

  const navLinks = [
    { name: 'Home', path: '/Job-portal/jobseeker' },
    { name: 'Jobs', path: '/Job-portal/jobseeker/jobs' },
    { name: 'Companies', path: '/Job-portal/jobseeker/companies' },
  ];

  const navIcons = [
    { image: breifcase, path: '/Job-portal/jobseeker/myjobs', label: 'My Jobs' },
    { image: chat, path: '/Job-portal/jobseeker/chat', label: 'Chat' },
  ];

  // const refreshNotifications = async () => {
  //   try {
  //     const res = await api.get("notifications/");
  //     setNotificationsData(
  //       res.data.map(n => ({
  //         id: n.id,
  //         message: n.message,
  //         created_at: n.created_at,
  //         is_read: n.is_read,
  //       }))
  //     );
  //   } catch (err) {
  //     console.error("Failed to refresh notifications", err);
  //   }
  // };  

  const refreshNotifications = async () => {
    if (fetchNotifications) {
      await fetchNotifications();
    }
  };

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     refreshNotifications();
  //   }
  // }, [isLoggedIn]);  


  useEffect(() => {
    if (isLoggedIn && fetchNotifications) {
      fetchNotifications();
    }
  }, [isLoggedIn]);


  ///const handleNavClick = (e) => {
  ///    setActiveItem(e);
  //}

  // const newNotificationsCount = notificationsData
  //   ? notificationsData.filter(n => n.isRead).length
  //   : 0;

  const preventNav = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
        </Link>
        {!isLoggedIn && (
          <div
            className="hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </div>
        )}
      </div>
      <nav className="nav-links">
        {navLinks.map(n => {
          let isActive = location.pathname === n.path;
          if (n.name === 'Home' && !isActive) {
            isActive = location.pathname === n.path + '/';
          }

          return (
            <NavLink
              key={n.name}
              to={isLoggedIn ? n.path : '#'}
              onClick={!isLoggedIn ? preventNav : undefined}
              className={isActive ? 'nav-item nav-active' : 'nav-item'}
            >
              {n.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="auth-links">
        {isLoggedIn ? (
          <>
            <Link to="/Job-portal/jobseeker" className="mobile-home-icon">
              <img
                src={home_icon}
                alt="Home"
                className={
                  location.pathname === '/Job-portal/jobseeker'
                    ? 'jheader-icons-active'
                    : 'jheader-icons'
                }
              />
            </Link>

            {navIcons.map((IC, index) => {
              const isActive = location.pathname === IC.path;
              return (
                <Link
                  key={index}
                  to={IC.path}
                  style={{ position: "relative" }}
                >
                  <img
                    src={IC.image}
                    alt={IC.label}
                    title={IC.label}
                    className={isActive ? 'jheader-icons-active' : 'jheader-icons'}
                  />
                  {/* Message Count Badge */}
                  {IC.label === "Chat" && unreadMessagesCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#007bff",
                        color: "white",
                        borderRadius: "50%",
                        minWidth: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        padding: "0 5px"
                      }}
                    >
                      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                  )}
                </Link>
              );
            })}

            <div onClick={() => setShowNotification(!showNotification)} title="Notifications">
              <img
                src={newNotificationsCount > 0 ? bell_dot : bell}
                alt="Notifications"
                className="jheader-icons"
              />
            </div>

            <AvatarMenu />

            {/* <JNotification
              notificationsData={notificationsData.map(n => ({
                id: n.id,
                text: n.message,
                time: new Date(n.created_at).toLocaleString(),
                isRead: n.is_read,
              }))}
              showNotification={showNotification}
              setShowNotification={setShowNotification}
              refreshNotifications={refreshNotifications}
            /> */}

            <JNotification />
          </>
        ) : (
          <>
            <div className="auth-action-links">
              <Link to="/Job-portal/role-selection" className="login-btn">Login</Link>
              <Link to="/Job-portal/role-selection" className="signup-btn">Sign up</Link>
            </div>
          </>
        )}
      </div>
      {!isLoggedIn && mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            <a href="#" onClick={preventNav} className="active">Home</a>
            <a href="#" onClick={preventNav}>Jobs</a>
            <a href="#" onClick={preventNav}>Companies</a>
            <Link to="/Job-portal/role-selection" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/Job-portal/role-selection" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
            <Link to="/Job-portal/role-selection" onClick={() => setMobileMenuOpen(false)}>Choose Role</Link>
          </div>
        </div>
      )}

    </header>
  );
};