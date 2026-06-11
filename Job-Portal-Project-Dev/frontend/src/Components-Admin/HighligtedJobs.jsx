import React, { useState } from 'react'
import { useJobs } from '../JobContext'
import Highlight from '../assets/Employer/HighLight-Active.png'

export const HighligtedJobs = ({highlightedJobsData = [] }) => {
    // const { jobs } = useJobs()
    // const jobAds = jobs.filter(job => job.isHighlighted === true)
     const jobAds = Array.isArray(highlightedJobsData) ? highlightedJobsData : [];
    
    // Debug: Console lo check chesukondi
    console.log("HighlightedJobs received data:", highlightedJobsData);
    console.log("Is array?", Array.isArray(highlightedJobsData));
    console.log("jobAds length:", jobAds.length);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentJobs = jobAds.slice(firstIndex, lastIndex);
    const npage = Math.ceil(jobAds.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const siblingCount = 1;

        if (npage <= 5) {
            for (let i = 1; i <= npage; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);

            let startPage = Math.max(2, currentPage - siblingCount);
            let endPage = Math.min(npage - 1, currentPage + siblingCount);


            if (currentPage <= 3) {
                endPage = 4;
            }

            if (currentPage >= npage - 2) {
                startPage = npage - 3;
            }

            if (startPage > 2) {
                pageNumbers.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < npage - 1) {
                pageNumbers.push('...');
            }

            pageNumbers.push(npage);
        }

        return pageNumbers.map((number, index) => {
            if (number === '...') {
                return <span key={`dots-${index}`} className="dots">...</span>;
            }
            return (
                <button
                    key={number}
                    className={`page-btn ${currentPage === number ? "active" : ""}`}
                    onClick={() => setCurrentPage(number)}>
                    {number}
                </button>
            );
        });
    };

    const prePage = () => {
        if (currentPage !== 1) setCurrentPage(currentPage - 1);
    }

    const changeCPage = (id) => {
        setCurrentPage(id);
    }

    const nextPage = () => {
        if (currentPage !== npage) setCurrentPage(currentPage + 1);
    }

    return (

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px', justifyContent: 'space-between', border: "0.5px solid #adadad", marginTop: "5px", borderRadius: "10px" }}>
            <div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", border: "0.5px solid #adadad", margin: "15px", borderRadius: "10px" }}>
                    <h2 style={{ textAlign: "center" }}>Highlighted Jobs</h2>
                    <img src={Highlight} width={22} alt="" />
                </div>

                <div style={{ display: "flex", margin: "5px", flexDirection: "column", padding: "15px" }}>
                    {currentJobs.length > 0 ? (
                        currentJobs.map((job, index) => (
                            <div className="Admin-job-card" key={index}>
                                <div className="Admin-job-left">
                                    <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                                    <p className="Admin-job-title">{job.title}</p>
                                    <img src={Highlight} width={15} alt="" />
                                    </div>
                                    <span className="Admin-job-under">{job.company}</span>
                                </div>
                                <div className="Admin-job-right">
                                    <div className="Ads-Count-Cont">
                                        <span className="Ads-Count">Posted On</span>
                                        <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }} >{job.posted}</p>
                                    </div>
                                    <div className="Ads-Count-Cont">
                                        <span className="Ads-Count">Highlighted on</span>
                                        <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }}>{job.highlightOn}</p>
                                    </div>
                                    <div className="Ads-Count-Cont">
                                        <span className="Ads-Count">Expired on</span>
                                        <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }}>N/A</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center' }}>No highlighted jobs found.</p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px', marginTop: "auto" }}>
                <ul style={{ display: 'flex', listStyle: 'none', gap: '10px', alignItems: 'center', visibility: jobAds.length > 0 ? 'visible' : 'hidden' }}>
                    <li>
                        <button onClick={prePage} disabled={currentPage === 1} className='Navigation-btn'>
                            Prev
                        </button>
                    </li>
                    {/* {numbers.map((n, i) => (
                        <li key={i}>
                            <button onClick={() => changeCPage(n)} 
                                style={{ 
                                    backgroundColor: currentPage === n ? '#007bff' : '#fff', 
                                    color: currentPage === n ? '#fff' : '#000', 
                                    border: '1px solid #ccc', 
                                    padding: '5px 10px', 
                                    cursor: 'pointer', 
                                    borderRadius: '4px' 
                                }}>
                                {n}
                            </button>
                        </li>
                    ))} */}
                    <div className="page-numbers">
                    {renderPageNumbers()}
                </div>
                    <li>
                        <button onClick={nextPage} disabled={currentPage === npage || npage === 0} className='Navigation-btn'>
                            Next
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    )
}