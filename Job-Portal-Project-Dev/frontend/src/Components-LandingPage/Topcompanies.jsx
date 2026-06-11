import React, { useEffect, useMemo, useState } from 'react';
import './Topcompanies.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import api from "../api/axios";
import starIcon from '../assets/Star_icon.png';
import left from '../assets/left_arrow.png';
import right from '../assets/right_arrow.png';

const CustomPrevArrow = ({ onClick }) => (
  <div className="custom-arrow prev" onClick={onClick}>
    <img src={left} alt="Previous" />
  </div>
);

const CustomNextArrow = ({ onClick }) => (
  <div className="custom-arrow next" onClick={onClick}>
    <img src={right} alt="Next" />
  </div>
);

export const Topcompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("/Job-portal/jobseeker/");

  useEffect(() => {
    api.get("/companies/")
      .then((res) => {
        setCompanies(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching companies:", err));
  }, []);

  const handleOpenPopup = (type, companyId = null) => {
    const isLoggedIn =
      !!sessionStorage.getItem("access") &&
      sessionStorage.getItem("userRole") === "jobseeker";

    const path =
      type === "jobs" && companyId
        ? `/Job-portal/jobseeker/companies/${companyId}`
        : "/Job-portal/jobseeker/companies";

    if (isLoggedIn) {
      navigate(path);
      return;
    }

    if (type === "jobs" && companyId) {
      setPopupMessage("Login or sign up to view job opportunities");
    } else {
      setPopupMessage("Login or sign up to explore all companies");
    }

    setRedirectPath(path);
    setShowLoginPopup(true);
  };

  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };

  const handleLoginClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/login", {
      state: { redirectTo: redirectPath }
    });
  };

  const handleSignupClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/signup", {
      state: { redirectTo: redirectPath }
    });
  };

  // const companyPriority = ["google", "wipro", "stackly", "cognizant", "amazon", "apple"];

  // const topCompanies = useMemo(() => {
  //   return companyPriority
  //     .map((name) =>
  //       companies.find((company) =>
  //         company.company_name?.toLowerCase().includes(name)
  //       )
  //     )
  //     .filter(Boolean);
  // }, [companies]);

  const topCompanies = useMemo(() => {
  if (!Array.isArray(companies)) return [];
 
  return companies.slice(0, 10);
}, [companies]);

  const settings = {
    dots: false,
    infinite: topCompanies.length > 4,
    speed: 500,
    slidesToShow: topCompanies.length > 0 ? Math.min(4, topCompanies.length) : 1,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: topCompanies.length > 0 ? Math.min(3, topCompanies.length) : 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: topCompanies.length > 0 ? Math.min(2, topCompanies.length) : 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <>
      <section className="carousel-wrapper">
        <h2 className="carousel-title">Top Companies Hiring Now</h2>

        <Slider {...settings}>
          {topCompanies.map((company) => (
            <div className="carousel-card" key={company.id}>
              {company.company_logo ? (
                <img
                  className="carousel-company-logo"
                  src={company.company_logo}
                  alt={company.company_name}
                />
              ) : (
                <div className="carousel-company-logo placeholder">
                  {company.company_name?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="carousel-card-header">
                <h3>{company.company_name}</h3>
                <p className="carousel-company-rating">
                  <span className="star">
                    <img src={starIcon} alt="rating" />
                  </span>
                  {company.rating || 0} | {company.review_count || 0} reviews
                </p>
              </div>

              <div className='carousel-dis-btn'>
                <p className="carousel-des">
                {company.company_moto || "No description available"}
              </p>

              <button
                className="carousel-view-jobs"
                onClick={() => handleOpenPopup("jobs", company.id)}
              >
                View jobs
              </button>
              </div>

              
            </div>
          ))}
        </Slider>

        <div className="carousel-view-all-wrapper">
          <button
            className="carousel-view-all"
            onClick={() => handleOpenPopup("companies")}
          >
            View All Companies
          </button>
        </div>
      </section>

      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleClosePopup}>
          <div
            className="login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{popupMessage}</h3>

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
