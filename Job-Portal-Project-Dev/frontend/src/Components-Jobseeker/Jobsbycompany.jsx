import React, { useState, useEffect } from 'react';
import starIcon from '../assets/Star_icon.png';
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Slider from "react-slick";
import left from "../assets/left_arrow.png";
import right from "../assets/right_arrow.png";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import "./Jobsbycompany.css";



export const Jobsbycompany = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        api.get("/companies/")
            .then((res) => {
                setCompanies(res.data);
            })
            .catch((err) => console.error("Error fetching companies:", err));
    }, []);



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

    const settings = {
        dots: false,
        infinite: companies.length > 4,
        speed: 500,
        slidesToShow: companies.length > 0 ? Math.min(4, companies.length) : 1,
        slidesToScroll: 1,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: companies.length > 0 ? Math.min(3, companies.length) : 1,
                    infinite: companies.length > 3,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: companies.length > 0 ? Math.min(2, companies.length) : 1,
                    infinite: companies.length > 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    infinite: companies.length > 1,
                },
            },
        ],
    };



    return (
        <section className="carousel-wrapper">
            <h2 className="carousel-title">Find Jobs By Company</h2>
            {companies.length === 0 && (
                <p style={{ textAlign: "center", color: "gray" }}>
                    No companies available
                </p>
            )}

            <Slider {...settings}>
                {companies.map((company) => (
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

                        <p className="carousel-desc">
                            {company.company_moto
                                ? company.company_moto.slice(0, 80)
                                : "No description available"}

                        </p>

                        <button
                            onClick={() =>
                                navigate(`/Job-portal/jobseeker/companies/${company.id}`)
                            }
                            className="carousel-view-jobs"
                        >
                            View jobs
                        </button>
                    </div>
                ))}
            </Slider>

            <div className="carousel-view-all-wrapper">
                <button
                    onClick={() => navigate('/Job-portal/jobseeker/companies')}
                    className="carousel-view-all"
                >
                    View All Companies
                </button>
            </div>
        </section>
    );
};
