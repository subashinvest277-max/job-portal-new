
import React, { useState, useEffect } from "react";
import "./JobsThroughCompany.css";
import { useNavigate, useParams } from "react-router-dom";
import { OpportunitiesCard } from './OpportunitiesCard';
import { Footer } from "../Components-LandingPage/Footer";
import starIcon from "../assets/Star_icon.png";
import { Header } from "../Components-LandingPage/Header";
import api from "../api/axios";

export const JobsThroughCompany = () => {
    // const { jobs } = useJobs();
    const { companyId } = useParams();

    // const filteredJobs = jobs.filter(comp => comp.companyId === companyId);

    // console.log(filteredJobs)

    // const findbyCompaniesNameList = CompaniesList.slice(0, 8);
    // const CompanyTitle = findbyCompaniesNameList.find(comp => comp.companyId === companyId);
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // const indexofLastjob = currentPage * displayCount;
    // const indexoffirstjob = indexofLastjob - displayCount;

    // const currentJobCards = filteredJobs.slice(indexoffirstjob, indexofLastjob);
    const displayCount = 10;
    // ✅ SINGLE CORRECT API CALL
    const fetchCompanyAndJobs = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ STEP 1: Fetch company details first
            const companyRes = await api.get(`/companies/${companyId}/`);
            const companyData = companyRes.data;

            setCompany(companyData);

            // ✅ STEP 2: If no jobs → stop here
            if (companyData.total_jobs === 0) {
                setJobs([]);
                return;
            }

            // ✅ STEP 3: Fetch all jobs
            const jobsRes = await api.get("/jobs/all/");

            // ✅ Handle response safely
            const jobsData = Array.isArray(jobsRes.data.jobs)
                ? jobsRes.data.jobs
                : [];

            // ✅ STEP 4: Filter jobs by companyId
            const filteredJobs = jobsData.filter(
                (job) => String(job.company?.id) === String(companyId)
            );

            console.log("Filtered Jobs:", filteredJobs); // debug

            setJobs(filteredJobs);
            setCurrentPage(1);

        } catch (err) {
            console.error("Error fetching company/jobs:", err);
            setError("Failed to load company or jobs");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!companyId) {
            setError("Company ID missing");
            setLoading(false);
            return;
        }
        fetchCompanyAndJobs();
    }, [companyId]);


    /* ---------- PAGINATION ---------- */

    const totalPages = Math.max(1, Math.ceil(jobs.length / displayCount));
    const indexOfLastJob = currentPage * displayCount;
    const indexOfFirstJob = indexOfLastJob - displayCount;
    const currentJobCards = jobs.slice(
        indexOfFirstJob,
        indexOfLastJob
    );

    const HandlePrev = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    const HandleNext = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    };

    /* ---------- STATES ---------- */

    if (loading) {
        return (
            <>
                <Header />
                <p style={{ textAlign: "center", padding: 40 }}>
                    Loading...
                </p>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <p style={{ color: "red", textAlign: "center" }}>
                    {error}
                </p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </>
        );
    }

    if (!company) {
        return (
            <>
                <Header />
                <p style={{ textAlign: "center" }}>
                    Company not found
                </p>
            </>
        );
    }

    // const renderPageNumbers = () => {
    //     const pageNumbers = [];
    //     const siblingCount = 1;

    //     if (totalpages <= 5) {
    //         for (let i = 1; i <= totalpages; i++) {
    //             pageNumbers.push(i);
    //         }
    //     } else {
    //         pageNumbers.push(1);

    //         let startPage = Math.max(2, currentPage - siblingCount);
    //         let endPage = Math.min(totalpages - 1, currentPage + siblingCount);


    //         if (currentPage <= 3) {
    //             endPage = 4;
    //         }

    //         if (currentPage >= totalpages - 2) {
    //             startPage = totalpages - 3;
    //         }

    //         if (startPage > 2) {
    //             pageNumbers.push('...');
    //         }

    //         for (let i = startPage; i <= endPage; i++) {
    //             pageNumbers.push(i);
    //         }

    //         if (endPage < totalpages - 1) {
    //             pageNumbers.push('...');
    //         }

    //         pageNumbers.push(totalpages);
    //     }

    //     return pageNumbers.map((number, index) => {
    //         if (number === '...') {
    //             return <span key={`dots-${index}`} className="dots">...</span>;
    //         }
    //         return (
    //             <button
    //                 key={number}
    //                 className={`page-btn ${currentPage === number ? "active" : ""}`}
    //                 onClick={() => setCurrentPage(number)}>
    //                 {number}
    //             </button>
    //         );
    //     });
    // };

    return (

        <>
            <Header />
            <div className='job-search-companies'>
                <section className='Opportunities-section'>
                    <div className="company-header-container">

                        <div className="company-details-section">
                            <button
                                className="back-btn"
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </button>
                        </div>

                        <div className="company-main-section">
                            <div className="company-logo-container">
                                {company.logo || company.company_logo ? (
                                    <img
                                        className="company-logo"
                                        src={company.logo || company.company_logo}
                                        alt={company.company_name}
                                    />
                                ) : (
                                    <div className="company-logo-placeholder">
                                        {company.company_name?.charAt(0).toUpperCase()}
                                    </div>
                                )}



                            </div>

                            <div className="company-info-card">
                                <h2>{company.company_name}</h2>
                                <div className="company-title-container">
                                    <span className="star">
                                        <img src={starIcon} alt="rating" />{" "}
                                        {company.rating || 0}
                                    </span>
                                    <span className="company-divider">|</span>
                                    <span>{company.review_count || 0} reviews</span>
                                </div>
                            </div>

                            <p className="company-moto">
                                {company.company_moto || "No company description available."}
                            </p>



                        </div>
                    </div>

                    <div className="Opportunities-job-list">
                        {currentJobCards.length === 0 ? (
                            <p>No jobs available</p>
                        ) : (
                            currentJobCards.map((job) => (
                                <OpportunitiesCard key={job.id} job={job} />
                            ))

                        )}
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="Navigation-job-Tab">
                            <button
                                onClick={HandlePrev}
                                disabled={currentPage === 1}
                                className='Navigation-btn'
                            >
                                Previous
                            </button>

                            {/* <div className="page-numbers">
                                {renderPageNumbers()}
                            </div> */}
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={HandleNext}
                                disabled={currentPage === totalPages}
                                className='Navigation-btn'
                            >
                                Next
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <Footer />
        </>
    );
};

