import React, { useState } from 'react'
import { Footer } from '../Components-LandingPage/Footer'
import "./HelpCenter.css";
import Helpcenterimg from "../assets/Helpcenter.png";
import search from '../assets/icon_search.png'
import { Link, useNavigate } from 'react-router-dom';
import { FHeader } from './FHeader';


export const HelpCenter = () => {

    const [searchText, setSearchText] = useState("");
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();

    const helpLinks = [
        {
            title: "Profile creation",
            path: "/Job-portal/jobseeker/help-center/profile-creation-help"
        },
        {
            title: "Resume upload",
            path: "/Job-portal/jobseeker/help-center/resume-upload-help"
        },
        {
            title: "Job apply issues",
            path: "/Job-portal/jobseeker/help-center/job-apply-help"
        },
        {
            title: "Interview scheduling",
            path: "/Job-portal/jobseeker/help-center/interview-scheduling-help"
        },
        {
            title: "Job posting",
            path: "/Job-portal/jobseeker/help-center/job-posting-help"
        },
        {
            title: "Candidate search",
            path: "/Job-portal/jobseeker/help-center/candidate-search-help"
        },
        {
            title: "Subscription issues",
            path: "/Job-portal/jobseeker/help-center/subscription-issue-help"
        },
        {
            title: "Invoice & payment",
            path: "/Job-portal/jobseeker/help-center/invoice-payment-help"
        },
        {
            title: "Login issues",
            path: "/Job-portal/jobseeker/help-center/login-issue-help"
        },
        {
            title: "Page errors",
            path: "/Job-portal/jobseeker/help-center/page-error-help"
        },
        {
            title: "File upload problems",
            path: "/Job-portal/jobseeker/help-center/file-upload-help"
        }
    ];

    const FAQ_DATA = [
        { question: "Who can use your platform?" },
        { question: "How do I create an account?" },
        { question: "What if I forget my password?" },
        { question: "Can I update my profile?" },
        { question: "How do I search for jobs?" },
        { question: "How do I know if my application was received?" },
        { question: "Can I upload multiple versions of my resume?" }
    ];


    const faqSearchLinks = FAQ_DATA.map((faq, index) => ({
        title: faq.question,
        path: "/Job-portal/jobseeker/help-center/help-FAQs",
        state: { faqId: index }
    }));


    const supportLinks = [
        {
            title: "Raise a Ticket",
            path: "/Job-portal/jobseeker/help-center/raise-a-ticket"
        },
        {
            title: "Live Chat",
            path: "/Job-portal/jobseeker/help-center/live-chat"
        }
    ];

    const allSearchLinks = [
        ...helpLinks,
        ...faqSearchLinks,
        ...supportLinks
    ];




    const filteredLinks = allSearchLinks.filter(link =>
        link.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const [activeIndex, setActiveIndex] = useState(-1);

    const [openIndex, setOpenIndex] = useState(null);

    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    return (
        <>
            <FHeader />
            <div className='Helpcenter-page'>
                <div className="helpcenter-container">
                    <img src={Helpcenterimg} alt="helpcenter" className="Helpcenter-Img" />

                    <div className="Helpcenter-Img-content">
                        <h2>Hello, how can we support you?</h2>
                        <p>
                            Welcome to our help center! Here, you'll find answers to frequently asked
                            questions, helpful guides, and useful tips to assist you in getting the
                            most out of our platform.
                        </p>

                        <div className="helpcenter-search-wrapper">
                            <div className="Helpcenter-search-box">

                                <input
                                    type="text"
                                    placeholder="Enter a keyword search"
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (!filteredLinks.length) return;

                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setActiveIndex((prev) =>
                                                prev < filteredLinks.length - 1 ? prev + 1 : 0
                                            );
                                        }

                                        if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setActiveIndex((prev) =>
                                                prev > 0 ? prev - 1 : filteredLinks.length - 1
                                            );
                                        }

                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            const selected =
                                                activeIndex >= 0
                                                    ? filteredLinks[activeIndex]
                                                    : filteredLinks[0];

                                            navigate(selected.path, { state: selected.state });
                                            setSearchText("");
                                            setShowResults(false);
                                            setActiveIndex(-1);
                                        }
                                    }}
                                />

                                <button
                                    onClick={() => {
                                        if (filteredLinks.length > 0) {
                                            const first = filteredLinks[0];
                                            navigate(first.path, { state: first.state });
                                            setShowResults(false);
                                            setSearchText("");
                                        }
                                    }}
                                >
                                    <img src={search} alt="search" />
                                </button>
                            </div>

                            {showResults && searchText && (
                                <div className="helpcenter-search-dropdown">
                                    {filteredLinks.length > 0 ? (
                                        filteredLinks.map((item, index) => (
                                            <Link
                                                key={index}
                                                to={item.path}
                                                state={item.state}
                                                className={`helpcenter-search-item ${index === activeIndex ? "active" : ""
                                                    }`}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onClick={() => {
                                                    setShowResults(false);
                                                    setSearchText("");
                                                    setActiveIndex(-1);
                                                }}
                                            >
                                                {item.title}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="helpcenter-search-no-result">
                                            No results found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                    </div>
                </div>

                <div className="Helpcenter-section">
                    <h2 className="Helpcenter-section-title">Categories</h2>

                    <div className="Helpcenter-layout">

                        <div className="Helpcenter-sidebar">

                            {/* JOB SEEKERS */}
                            <div
                                className={`helpcenter-main-item ${openIndex === 0 ? "active-main open" : ""
                                    }`}
                                onClick={() => toggleItem(0)}
                            >
                                <span>For Job Seekers</span>
                                <i className="helpcenter-arrow"></i>
                            </div>

                            {openIndex === 0 && (
                                <div className="helpcenter-submenu">
                                    <Link to='/Job-portal/jobseeker/help-center/profile-creation-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Profile creation</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/resume-upload-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Resume upload</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/job-apply-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Job apply issues</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/interview-scheduling-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Interview scheduling</div>
                                    </Link>
                                </div>
                            )}

                            {/* EMPLOYERS */}
                            <div
                                className={`helpcenter-main-item ${openIndex === 1 ? "active-main open" : ""
                                    }`}
                                onClick={() => toggleItem(1)}
                            >
                                <span>For Employers</span>
                                <i className="helpcenter-arrow"></i>
                            </div>

                            {openIndex === 1 && (
                                <div className="helpcenter-submenu">
                                    <Link to='/Job-portal/jobseeker/help-center/job-posting-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Job posting</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/candidate-search-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Candidate search</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/subscription-issue-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Subscription issues</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/invoice-payment-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Invoice & payment</div>
                                    </Link>
                                </div>
                            )}

                            {/* TECHNICAL */}
                            <div
                                className={`helpcenter-main-item ${openIndex === 2 ? "active-main open" : ""
                                    }`}
                                onClick={() => toggleItem(2)}
                            >
                                <span>Technical issue</span>
                                <i className="helpcenter-arrow"></i>
                            </div>

                            {openIndex === 2 && (
                                <div className="helpcenter-submenu">
                                    <Link to='/Job-portal/jobseeker/help-center/login-issue-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Login issues</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/page-error-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">Page errors</div>
                                    </Link>
                                    <Link to='/Job-portal/jobseeker/help-center/file-upload-help' className="helpcenter-submenu-link" >
                                        <div className="helpcenter-submenu-item">File upload problems</div>
                                    </Link>
                                </div>
                            )}

                        </div>

                        <div className="helpcenter-support-options">
                            <Link to='/Job-portal/jobseeker/help-center/help-FAQs' className="helpcenter-support-item" ><div >Popular Articles / FAQs</div></Link>
                            <Link to='/Job-portal/jobseeker/help-center/raise-a-ticket' className="helpcenter-support-item" ><div >Raise a Ticket</div></Link>
                            <Link to='/Job-portal/jobseeker/help-center/live-chat' className="helpcenter-support-item" ><div >Live Chat</div></Link>

                        </div>
                    </div>
                </div>



            </div>

            <Footer />
        </>
    )
}