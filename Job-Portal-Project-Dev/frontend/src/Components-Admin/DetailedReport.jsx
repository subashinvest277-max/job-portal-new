import React, { useState } from 'react'
import './DetailedReport.css'
import { useNavigate } from 'react-router-dom';
import fullStack from '../assets/AdminAssets/Fullstack.png'
import ProductDesign from '../assets/AdminAssets/ProductDesign.png'
import CloudArc from '../assets/AdminAssets/CloudArc.png'
import Others from '../assets/AdminAssets/Others.png'
import LblueCircle from '../assets/AdminAssets/LblueCircle.png'
import MblueCircle from '../assets/AdminAssets/MblueCircle.png'
import DblueCircle from '../assets/AdminAssets/DblueCircle.png'
import IntegrityProfile from '../assets/AdminAssets/IntegrityProfile.png'
import IntergrityWatch from '../assets/AdminAssets/IntergrityWatch.png'
import Increasing from '../assets/AdminAssets/Increasing.png'
import Submitted from '../assets/AdminAssets/Submitted.png'
import ClosedJobs from '../assets/AdminAssets/ClosedJobs.png'
import LiveJobs from '../assets/AdminAssets/LiveJobs.png'
import { textAlign } from '@mui/system';
import { FinancialReport } from './FinancialReport';
import { UserRegistrationRep } from './UserRegistrationRep';

export const DetailedReport = ({ SetMode }) => {

    const [showMore, setShowMore] = useState(false);

    const funnelData = [
        {
            department: "TECHNOLOGY & ENGINEERING",
            totalApps: "8,420",
            appliedPct: 60,
            interviewedPct: 35,
            offeredPct: 15
        },
        {
            department: "SALES & OPERATIONS",
            totalApps: "5,100",
            appliedPct: 65,
            interviewedPct: 35,
            offeredPct: 10
        },
        {
            department: "DESIGN & CREATIVE",
            totalApps: "2,800",
            appliedPct: 50,
            interviewedPct: 35,
            offeredPct: 15
        }
    ];

    const categories = [
        { id: 1, name: 'Fullstack Dev', percentage: 32, icon: fullStack },
        { id: 2, name: 'Cloud Architect', percentage: 24, icon: CloudArc },
        { id: 3, name: 'Product Design', percentage: 18, icon: ProductDesign },
        { id: 4, name: 'Other', percentage: 26, icon: Others },
    ];

    const tableData = [
        {
            id: '#USR-9821',
            jobId: '#JOB-1104',
            reason: 'IP CONFLICT',
            method: 'Multi-region geolocation mismatch',
            risk: 'CRITICAL',
        },
        {
            id: '#USR-2245',
            jobId: '#JOB-4412',
            reason: 'RESUME BOT',
            method: 'Pattern detection in cover letter text',
            risk: 'MODERATE',
        },
        {
            id: '#USR-0051',
            jobId: '#JOB-0922',
            reason: 'FRAUDULENT CREDS',
            method: 'Verification API mismatch',
            risk: 'HIGH',
        },
        {
            id: '#USR-9821',
            jobId: '#JOB-1104',
            reason: 'IP CONFLICT',
            method: 'Multi-region geolocation mismatch',
            risk: 'CRITICAL',
        },
        {
            id: '#USR-2245',
            jobId: '#JOB-4412',
            reason: 'RESUME BOT',
            method: 'Pattern detection in cover letter text',
            risk: 'MODERATE',
        },
        {
            id: '#USR-9821',
            jobId: '#JOB-1104',
            reason: 'IP CONFLICT',
            method: 'Multi-region geolocation mismatch',
            risk: 'CRITICAL',
        },
        {
            id: '#USR-2245',
            jobId: '#JOB-4412',
            reason: 'RESUME BOT',
            method: 'Pattern detection in cover letter text',
            risk: 'MODERATE',
        },
        {
            id: '#USR-9821',
            jobId: '#JOB-1104',
            reason: 'IP CONFLICT',
            method: 'Multi-region geolocation mismatch',
            risk: 'CRITICAL',
        },
        {
            id: '#USR-2245',
            jobId: '#JOB-4412',
            reason: 'RESUME BOT',
            method: 'Pattern detection in cover letter text',
            risk: 'MODERATE',
        },
    ];

    const [Data, SetData] = useState(tableData.slice(0, 3))

    const stats = [
        {
            label: 'Live Job Postings',
            value: '1,284',
            change: '+12% vs LY',
            icon: LiveJobs,
        },
        {
            label: 'Closed (Last 30d)',
            value: '492',
            change: 'Neutral',
            icon: ClosedJobs,
        },
        {
            label: 'Applications Submitted',
            value: '18,402',
            change: '+24% vs LY',
            icon: Submitted,
        },
    ];

    const [activeTab, setActiveTab] = useState("Job and Application Report");

    return (
        <>
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "25px 15px" }}>
                    <button style={{ backgroundColor: '#1E88E5', padding: "5px 15px", borderRadius: "7px", color: "#fff", border: "none", cursor: "pointer" }}
                        onClick={() => SetMode("Reports and Analytics")}>Back</button>
                    <div style={{ marginLeft: "20px" }} >
                        <div style={{ display: "flex", justifyContent: "space-around", gap: "25px", border: "1px solid rgba(0, 0, 0, 0.15)", padding: "28px 45px", borderRadius: "10px" }}>
                            <button
                                className={`Reports-select ${activeTab === "Job and Application Report" ? "Reports-active" : ""}`}
                                onClick={() => setActiveTab("Job and Application Report")}
                            >Job and Application Report</button>

                            <button
                                className={`Reports-select ${activeTab === "Financial Report" ? "Reports-active" : ""}`}
                                onClick={() => setActiveTab("Financial Report")}
                            >Financial Report</button>

                            <button
                                className={`Reports-select ${activeTab === "User Registration" ? "Reports-active" : ""}`}
                                onClick={() => setActiveTab("User Registration")}
                            >User Registration</button>
                        </div>
                    </div>
                </div>

                {activeTab === "Job and Application Report" && (
                    <div style={{ margin: "20px" }}>
                        <div style={{ margin: "20px 0" }}>
                            <h2 style={{ margin: "0" }}>Job and Application Report</h2>
                            <span className='reports-integrity-subtitle'>Real-time performance metrics and application funnel integrity.</span>
                        </div>
                        <div className="job-reports">
                            <div className="job-reports-metrics-container">
                                {stats.map((stat, index) => (
                                    <div key={index} className="job-reports-stat-card">
                                        <img src={stat.icon} alt={stat.label} height={40} width={40} />
                                        <div className="job-reports-stat-content">
                                            <span className="job-reports-stat-badge">{stat.change}</span>
                                            <p className="job-reports-stat-label">{stat.label}</p>
                                            <h2 className="job-reports-stat-value">{stat.value}</h2>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="job-reports-highlight-card">
                                <div className="job-reports-highlight-header">
                                    <img src={Increasing} width={40} alt="" />
                                    <span className="job-reports-high-badge">High</span>
                                </div>
                                <div className="job-reports-highlight-body">
                                    <p>Offer Conversion Rate</p>
                                    <h2 className="job-reports-rate-value">6.4%</h2>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>

                            <div className="reports-container">
                                <div className="reports-header-section">
                                    <div className="reports-title-area">
                                        <h2 className="reports-title">Application Funnel Integrity</h2>
                                        <p className="reports-subtitle">Ratio of applications to interviews and final offers</p>
                                    </div>
                                    <div className="reports-legend">
                                        <div className="reports-legend-item">

                                            <img src={LblueCircle} alt="" width={15} />
                                            <span>Applied</span>
                                        </div>
                                        <div className="reports-legend-item">
                                            <img src={MblueCircle} alt="" width={15} />
                                            <span>Interviewed</span>
                                        </div>
                                        <div className="reports-legend-item">
                                            <img src={DblueCircle} alt="" width={15} />
                                            <span>Offered</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="reports-data-section">
                                    {funnelData.map((item, index) => (
                                        <div key={index} className="reports-row">
                                            <div className="reports-row-header">
                                                <span className="reports-dept-name">{item.department}</span>
                                                <span className="reports-total-apps">{item.totalApps} TOTAL APPS</span>
                                            </div>
                                            <div className="reports-bar-wrapper">
                                                <div
                                                    className="reports-bar-segment reports-bg-applied"
                                                    style={{ width: `${item.appliedPct}%` }}
                                                ></div>
                                                <div
                                                    className="reports-bar-segment reports-bg-interviewed"
                                                    style={{ width: `${item.interviewedPct}%` }}
                                                ></div>
                                                <div
                                                    className="reports-bar-segment reports-bg-offered"
                                                    style={{ width: `${item.offeredPct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='reports-category-container'>

                                <h2 className="reports-category-title">Popular Categories</h2>

                                <div className="reports-category-list">
                                    {categories.map((item) => (
                                        <div key={item.id} className="reports-category-item">
                                            <div className="reports-category-header">
                                                <div className="reports-category-icon-box">
                                                    <img src={item.icon} width={50} alt="" />
                                                </div>
                                                <span className="reports-category-name">{item.name}</span>
                                                <span className="reports-category-percentage">{item.percentage}%</span>
                                            </div>

                                            <div className="reports-category-progress-bar">
                                                <div
                                                    className="reports-category-progress-fill"
                                                    style={{ width: `${item.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                        <div className="reports-integrity-card">
                            <div className="reports-integrity-header">
                                <div className="reports-integrity-title-sec">
                                    
                                    <div>
                                        <div style={{display:"flex",alignItems:"center",gap:"5px"}}> 
                                        <img src={IntergrityWatch} width={25} height={25} alt="" />
                                        <h3 className="reports-integrity-title">Integrity Watch: Flagged Applications</h3></div>
                                        <p className="reports-integrity-subtitle">Detected suspicious activity, bot behaviors, or duplicate profiles.</p>
                                    </div>
                                </div>
                                <div className="reports-integrity-actions-top">
                                    <span className="reports-integrity-badge-new">12 New Flags</span>
                                    <a href="#" className="reports-integrity-link">Review Policy</a>
                                </div>
                            </div>


                            <div className="reports-integrity-table-div">

                                <div className="reports-integrity-thead">
                                    <div className="reports-integrity-th">APPLICANT ID</div>
                                    <div className="reports-integrity-th">LINKED JOB ID</div>
                                    <div className="reports-integrity-th">FLAG REASON</div>
                                    <div className="reports-integrity-th">DETECTED METHOD</div>
                                    <div className="reports-integrity-th">RISK LEVEL</div>
                                    <div className="reports-integrity-th ">ACTIONS</div>
                                </div>


                                <div className="reports-integrity-tbody">
                                    {Data.map((row, index) => (
                                        <div className="reports-integrity-tr" key={index}>
                                            <div className="reports-integrity-td reports-integrity-user-cell">
                                                <div className="reports-integrity-user-icon-box">
                                                    <img src={IntegrityProfile} alt="" width={40} />
                                                    <strong className="reports-integrity-id-text">{row.id}</strong>
                                                </div>

                                            </div>
                                            <div className="reports-integrity-td">{row.jobId}</div>
                                            <div className="reports-integrity-td">
                                                <div style={{display:"flex",textAlign:"start",width:"120px",paddingLeft:"25px"}}>
                                                <span className={`reports-integrity-reason-tag is-${row.risk.toLowerCase()}`}>
                                                    {row.reason}
                                                </span>
                                                </div>
                                            </div>
                                            <div className="reports-integrity-td reports-integrity-method-text">{row.method}</div>
                                            <div  className="reports-integrity-td">
                                                <div style={{display:"flex",textAlign:"start",width:"120px",paddingLeft:"25px"}}>
                                                <span style={{textAlign:"start"}} className={`reports-integrity-dot is-${row.risk.toLowerCase()}`}></span>
                                                <span className={`reports-integrity-risk-text is-${row.risk.toLowerCase()}`}>
                                                    {row.risk}
                                                </span>
                                                </div>
                                            </div>
                                            <div className="reports-integrity-td">
                                                <button className="reports-integrity-more-btn">⋮</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="reports-integrity-footer">
                                {Data.length <= 3 ?
                                    <div onClick={() => { SetData(tableData) }} className="reports-integrity-footer-link">
                                        View Detailed Audit Log <span className="reports-integrity-arrow">→</span>
                                    </div>
                                    : <div onClick={() => SetData(tableData.slice(0, 3))} className="reports-integrity-footer-link">
                                       View Less <span className="reports-integrity-arrow">↑</span>     
                                    </div>}
                                        
                                    
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Financial Report" && (
                    <FinancialReport/>
                )}
                {activeTab === "User Registration" && (
                    <UserRegistrationRep/>
                )}

            </div>

        </>
    );
};