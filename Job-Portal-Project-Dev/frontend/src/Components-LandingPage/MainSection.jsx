import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainSection.css';
import search from '../assets/icon_search.png';
import location from '../assets/icon_location.png';
import tick from '../assets/icon_tick.png';
 
export const MainSection = () => {
  const navigate = useNavigate();
 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
 
  const searchResultsPath = '/Job-portal/jobseeker/searchresults';
 
  const saveSearchData = () => {
    const searchData = {
      query: searchQuery,
      location: searchLocation,
      experience: searchExperience,
      timestamp: Date.now()
    };
 
    sessionStorage.setItem('pendingSearch', JSON.stringify(searchData));
    sessionStorage.setItem('savedSearch', JSON.stringify(searchData));
 
    return searchData;
  };
 
  const handleSearch = () => {
    const access = sessionStorage.getItem('access');
    const userRole = sessionStorage.getItem('userRole');
    const isLoggedIn = Boolean(access) && userRole === 'jobseeker';
 
    if (isLoggedIn) {
      navigate(searchResultsPath, {
        state: {
          query: searchQuery,
          location: searchLocation,
          experience: searchExperience,
        }
      });
      return;
    }
 
    sessionStorage.removeItem('pendingSearch');
    sessionStorage.removeItem('savedSearch');
    setShowLoginPopup(true);
  };
 
  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };
 
  const handleLoginClick = () => {
    const searchData = saveSearchData();
 
    setShowLoginPopup(false);
    navigate('/Job-portal/jobseeker/login', {
      state: {
        fromSearch: true,
        searchQuery: searchData.query,
        searchLocation: searchData.location,
        searchExperience: searchData.experience,
        redirectTo: searchResultsPath
      }
    });
  };
 
  const handleSignupClick = () => {
    const searchData = saveSearchData();
 
    setShowLoginPopup(false);
    navigate('/Job-portal/jobseeker/signup', {
      state: {
        fromSearch: true,
        searchQuery: searchData.query,
        searchLocation: searchData.location,
        searchExperience: searchData.experience,
        redirectTo: searchResultsPath
      }
    });
  };
 
  return (
    <>
      <main className="main-section">
        <h1 className="headline">"Your Dream Job Is Just A Click Away"</h1>
        <p className="subheading">Explore 5 Lakh+ Openings Now</p>
 
        <div className="search-bar">
          <div className="search-field">
            <span>
              <img src={search} className="icon-size" alt="search_icon" />
            </span>
            <input
              type="text"
              placeholder="Search by Skills, company or job title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
 
          <div className="separator"></div>
 
          <div className="search-field">
            <span>
              <img src={location} className="icon-size" alt="location_icon" />
            </span>
            <input
              type="text"
              placeholder="Enter Location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
 
          <div className="separator"></div>
 
          <div className="search-field">
            <span>
              <img src={tick} className="icon-size" alt="search_tick" />
            </span>
            <select
              value={searchExperience}
              onChange={(e) => setSearchExperience(e.target.value)}
            >
              <option value="" disabled hidden>Enter Experience</option>
              <option value="fresher">Fresher</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>
 
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </main>
 
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleClosePopup}>
          <div
            className="login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Login or sign up to search jobs</h3>
 
            <div className="login-popup-actions">
              <button
                className="login-popup-login-btn"
                onClick={handleLoginClick}
              >
                Login
              </button>
 
              <button
                className="login-popup-signup-btn"
                onClick={handleSignupClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
 