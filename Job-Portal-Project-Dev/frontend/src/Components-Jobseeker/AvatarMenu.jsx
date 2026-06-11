import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import avatarIcon from "../assets/header_profile.png";
import profileIcon from "../assets/icon_profile.png";
import reviewIcon from "../assets/icon_reviews.png";
import settingsIcon from "../assets/icon_settings.png";
import helpIcon from "../assets/icon_help.png";
import "./AvatarMenu.css";
import api from "../api/axios";
import { LogoutModal } from "./LogoutModal";


export const AvatarMenu = () => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
   const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);
  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      const refresh = sessionStorage.getItem("refresh");

      if (!refresh) {
        throw new Error("No refresh token");
      }

      await api.post("logout/", {
        refresh: refresh,
      });

    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      sessionStorage.removeItem("access");
      sessionStorage.removeItem("refresh");
      sessionStorage.removeItem("userRole");
      setOpen(false);
      navigate("/");
    }
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="avatar-container" ref={menuRef} >

      <img
        src={avatarIcon}
        alt="avatar"
        className="avatar-icon"
        title="Menu"
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="avatar-menu">
          <Link to="/Job-portal/jobseeker/myprofile" className="menu-items">
            <img src={profileIcon} className="menu-icon" alt="profile" />
            Profile
          </Link>

          {/* <Link to="/Job-portal/jobseeker/myreviews"
            onClick={() => setOpen(false)} className="menu-items">
            <img src={reviewIcon} className="menu-icon" alt="reviews" />
            My reviews
          </Link> */}

          <Link to="/Job-portal/jobseeker/Settings" className="menu-items" onClick={() => setOpen(false)}>
            <img src={settingsIcon} className="menu-icon" alt="settings" />
            Settings
          </Link>

          <Link to="/Job-portal/jobseeker/help-center" className="menu-items" onClick={() => setOpen(false)}>
            <img src={helpIcon} className="menu-icon" alt="help" />
            Help Centre
          </Link>


          <div className="menu-divider"></div>

          <button
            onClick={() => {
              setShowLogoutModal(true);
              setOpen(false);
            }}
            className="avatar-logout-btn"
          >
            Logout
          </button>
        </div>
      )}
      <LogoutModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};