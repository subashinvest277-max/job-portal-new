import React, { useState, useEffect } from 'react'
import './JobsTab.css'
import { Footer } from '../Components-LandingPage/Footer'
import { OpportunitiesCard } from './OpportunitiesCard';
import { Header } from "../Components-LandingPage/Header";
import { useNavigate } from "react-router-dom"
import { SearchBar } from './SearchBar'
import api from '../api/axios'

const scrollToJobsTop = () => {
    requestAnimationFrame(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });

            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 0);
    });
};

export const JobsTab = () => {
    // const { jobs } = useJobs();

    const displayCount = 10;
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [query, setQuery] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [experience, setExperience] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get("/jobs/all/");
                setJobs(Array.isArray(res.data.jobs) ? res.data.jobs : []);
                setCurrentPage(1);
            } catch (err) {
                console.error(
                    "Failed to load jobs:",
                    err.response?.data || err.message
                );
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        scrollToJobsTop();
    }, [currentPage]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / displayCount));
    const indexOfLast = currentPage * displayCount;
    const indexOfFirst = indexOfLast - displayCount;
    const currentJobCards = jobs.slice(indexOfFirst, indexOfLast);

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisibleButtons = 5;

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);


        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }


        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages.map((p) => (
            <button
                key={p}
                type="button"
                className={`page-btn ${currentPage === p ? "active" : ""}`}
                onClick={() => handlePageClick(p)}
            >
                {p}
            </button>
        ));
    };

    const handleInitialSearch = () => {
        navigate('/Job-portal/jobseeker/searchresults', {
            state: {
                query,
                location: jobLocation,
                experience
            }
        });
    };

    return (
        <>
            <Header />

            <div className='jobs-tab-search-bar'>
                <SearchBar
                    searchQuery={query}
                    setSearchQuery={setQuery}
                    searchLocation={jobLocation}
                    setSearchLocation={setJobLocation}
                    searchExp={experience}
                    setSearchExp={setExperience}
                    onSearch={handleInitialSearch}
                />
            </div>

            <section className='Opportunities-section'>
                <div className='Opportunities-section'>
                    <h2 className='Opportunities-title'>Jobs For You</h2>

                    <div className="Opportunities-job-list">
                        {currentJobCards.length > 0 ? (
                            currentJobCards.map((job) => (
                                <OpportunitiesCard key={job.id} job={job} />
                            ))
                        ) : (
                            <p>No jobs available at the moment.</p>
                        )}
                    </div>
                </div>
            </section>

            <div className="Navigation-job-Tab">
                <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className='Navigation-btn'
                >
                    Previous
                </button>

                <div className="page-numbers">
                    {renderPageNumbers()}
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className='Navigation-btn'
                >
                    Next
                </button>
            </div>

            <Footer />
        </>
    )
}
