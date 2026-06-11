import React, { useEffect, useState } from 'react';
import './FAQ.css';
import faqImage from '../assets/FAQ.png';
import BackIcon from '../assets/BackICON.png';
import { Footer } from '../Components-LandingPage/Footer';
import { useLocation } from 'react-router-dom';
import { FHeader } from '../Components-Jobseeker/FHeader'

export const FAQ = () => {
    const FAQ_DATA = [
        { id: 1, question: "Who can use your platform?", answer: "Our platform is open to both job seekers looking for new opportunities and employers seeking top talent." },
        { id: 2, question: "How do I create an account?", answer: "Click the 'Sign Up' button in the top right corner and follow the prompts to create your profile." },
        { id: 3, question: "What if I forget my password?", answer: "You can reset your password by clicking 'Forgot Password' on the login screen." },
        { id: 4, question: "Can I update my profile?", answer: "Yes, you can edit your profile details at any time from your account settings." },
        { id: 5, question: "How do I search for jobs?", answer: "Use the 'Jobs' tab in the navigation bar or the search tool on the homepage." },
        { id: 6, question: "How do I know if my application was received?", answer: "You will receive an email confirmation and see a status update in your dashboard." },
        { id: 7, question: "Can I upload multiple versions of my resume?", answer: "Yes, our platform allows you to manage and select different resumes for different applications." },
    ];
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);

    useEffect(() => {
        if (
            location.state?.faqId !== undefined &&
            location.state.faqId >= 0 &&
            location.state.faqId < FAQ_DATA.length
        ) {
            setActiveIndex(location.state.faqId);
        }
    }, [location.state]);

    return (
        <div>
            <FHeader />
            <div className="FAQpage-main-wrapper">
                <div className="faq-page-content">
                    <img
                        src={faqImage}
                        alt=""
                        loading="eager"
                        fetchPriority="high"
                        style={{ display: 'none' }}
                    />

                    <section
                        className="FAQpage-section"

                        style={{ backgroundImage: `url(${faqImage})` }}
                    >
                        <div className="FAQpage-overlay-content">
                            <div className="FAQpage-stacked-container">
                                <h1 className="FAQpage-title">Hello, how can we support you?</h1>

                            </div>
                        </div>
                    </section>

                    <main className="FAQpage-main-content">
                        <aside className="FAQpage-sidebar">
                            <div className="FAQpage-support-nav">
                                <button className="FAQpage-back-btn" onClick={() => window.history.back()}>
                                    <img src={BackIcon} alt="Back" title="Go Back" />
                                </button>
                                <div className="FAQpage-support-label">Support</div>
                            </div>
                            <h2 className="faq-heading">FAQS</h2>
                            <p className="faq-description">
                                Have any questions? We've got answers! Check out our Frequently Asked
                                Questions (FAQs) to find quick solutions to common queries.
                                Save time and get the information you need right here.
                            </p>
                        </aside>

                        <div className="faq-list">
                            {FAQ_DATA.map((item, index) => (
                                <div
                                    key={index}
                                    className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                                >
                                    <div
                                        className="faq-question"
                                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                    >
                                        <span>{item.question}</span>
                                        <div className="faq-arrow-icon"></div>
                                    </div>
                                    {activeIndex === index && (
                                        <div className="faq-answer">
                                            <p>{item.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
};