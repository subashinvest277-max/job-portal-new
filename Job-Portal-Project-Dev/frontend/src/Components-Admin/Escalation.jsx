import React, { useState, useEffect } from 'react';
import './Escalation.css';
import { useJobs } from '../JobContext';
import api from '../api/axios';
import pencil from '../assets/AdminAssets/Edit.png';
import backIcon from '../assets/AdminAssets/BackBtn.png';
import victor from '../assets/AdminAssets/ReportJob.png';
import docIcon from '../assets/AdminAssets/InProgress.png';
import deleteIcon from '../assets/AdminAssets/DeleteIcon.png';
import eye from '../assets/AdminAssets/EyeIcon.png';
import Priority from '../assets/AdminAssets/Priority.png';
import AdminCategory from '../assets/AdminAssets/AdminCategory.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
import { JobMonitorOverview } from './JobMonitorOverview';

export const Escalation = () => {

    const { reports, setReports, fetchReports, reportsLoading } = useJobs();
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showJobOverviewId, setShowJobOverviewId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);



    useEffect(() => {
        fetchReports();
    }, []);

    // Helper to format any ISO or DB datetime string into Local Indian Time format
    const formatToLocalTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const dateObj = new Date(dateString);
            if (isNaN(dateObj.getTime())) return dateString;

            return dateObj.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (e) {
            return dateString;
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            setActionLoading(true);
            console.log(`🔄 Updating report ${reportId} to ${newStatus}...`);

            // Map frontend display status to backend database values
            let backendStatus;
            switch (newStatus) {
                case "Pending":
                    backendStatus = "pending";
                    break;
                case "In Progress":
                    backendStatus = "investigating";
                    break;
                case "Resolved":
                    backendStatus = "resolved";
                    break;
                default:
                    backendStatus = "pending";
            }

            console.log(`Sending to backend: "${backendStatus}"`);

            const response = await api.patch(`/admin/complaints/${reportId}/`, {
                status: newStatus
            });

            console.log("Update response:", response.data);

            // Update local state with display status
            setReports((prev) =>
                prev.map((item) =>
                    item.id === reportId ? { ...item, status: newStatus } : item
                )
            );

            if (selectedReport && selectedReport.id === reportId) {
                setSelectedReport((prev) => ({ ...prev, status: newStatus }));
            }

            setIsModalOpen(false);
            alert(`Status changed to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Update failed:", error);
            console.error("Error response:", error.response?.data);

            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert("Failed to update status. Please try again.");
            }
        } finally {
            setActionLoading(false);
        }
    };


    const handleDeleteReport = async (reportId) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            try {
                setActionLoading(true);
                console.log(`🗑️ Deleting report ${reportId}...`);

                // API call to delete
                await api.delete(`/admin/complaints/${reportId}/`);

                // Update local state
                setReports((prev) => prev.filter((item) => item.id !== reportId));
                setSelectedReport(null);
                setIsModalOpen(false);
                alert("Report deleted successfully!");
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete report. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    // Loading state
    if (reportsLoading && reports.length === 0) {
        return (
            <div className="RepAJob-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Loading reports...</h3>
                </div>
            </div>
        );
    }

    if (showJobOverviewId) {
        return (
            <div className="RepAJob-detail-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="RepAJob-main-title">Job ID: {showJobOverviewId}</h2>
                    <button
                        className="RepAJob-btn-back"
                        onClick={() => setShowJobOverviewId(null)}
                        style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Back to Report Details
                    </button>
                </div>

                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <JobMonitorOverview jobId={showJobOverviewId} setSelectedJobId={setShowJobOverviewId} />
                </div>
            </div>
        );
    }

    if (selectedReport) {
        const currentStatus = selectedReport.status;
        const currentPriority = selectedReport.priority;

        return (
            <div className="RepAJob-detail-container">
                <h2 className="RepAJob-main-title">Report Information</h2>

                <div className="RepAJob-detail-actions">
                    <button
                        className="RepAJob-btn-back"
                        onClick={() => { setSelectedReport(null); setIsModalOpen(false); }}
                        disabled={actionLoading}
                    >
                        Back to Reports
                    </button>
                </div>

                <div className="RepAJob-detail-card">
                    <div className="RepAJob-card-left">
                        <div className="RepAJob-doc-icon-box">
                            <img src={victor} alt="document" className="RepAJob-svg-icon" />
                        </div>
                        <div className="RepAJob-ticket-header">
                            <h3>{selectedReport.reason || "Unable to submit the project status"}</h3>
                            <span className="RepAJob-ticket-id">{selectedReport.RepId || `REP-${selectedReport.id}`}</span>
                            <p className="RepAJob-timestamp">
                                Created on : {formatToLocalTime(selectedReport.created_at || selectedReport.date)}
                            </p>
                        </div>
                    </div>

                    <div className="RepAJob-card-right">
                        <div className="RepAJob-meta-row">
                            <img src={Priority} width={15} height={15} alt="Priority" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">Priority</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value-priority" data-priority={currentPriority?.toLowerCase() || 'medium'}>
                                {currentPriority || "Medium"}
                            </span>
                        </div>
                        <div className="RepAJob-meta-row">
                            <img src={AdminStatus} width={15} height={15} alt="AdminStatus" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">Status</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value status-text">
                                <img src={docIcon} alt="status-doc" style={{ width: '14px', marginRight: '6px', verticalAlign: 'middle' }} />
                                {currentStatus || "Pending"}
                            </span>
                        </div>
                        <div className="RepAJob-meta-row">
                            <img src={Priority} width={15} height={15} alt="Priority" />
                            <span style={{ paddingLeft: "15px" }} className="meta-label">JobId</span>
                            <span className="meta-separator">:</span>
                            <span className="meta-value-priority">
                                {selectedReport.JobId || selectedReport.jobId || selectedReport.id}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="RepAJob-grid-details">
                    <div className="RepAJob-user-section">
                        <h2 className="RepAJob-section-title">User Information</h2>
                        <div className="RepAJob-user-grid">
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">Name :</span>
                                <input type="text" disabled value={`${selectedReport.firstName || ''} ${selectedReport.lastName || ''}`.trim() || selectedReport.name || 'N/A'} />
                            </div>
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">Mobile number :</span>
                                <input type='text' disabled value={selectedReport.mobile || selectedReport.contact || 'N/A'} />
                            </div>
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">Mail ID :</span>
                                <input type='text' disabled value={selectedReport.email || 'N/A'} />
                            </div>
                            <div className="RepAJob-grid-row">
                                <span className="RepAJob-grid-label">User :</span>
                                <input type='text' disabled value={selectedReport.category || 'Report'} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="RepAJob-section">
                    <h4>Report details</h4>
                    <p>Job Id: {selectedReport.JobId || selectedReport.jobId || selectedReport.id}</p>
                    <p className="RepAJob-description-text">
                        {selectedReport.explanation || selectedReport.message || 'No details provided'}
                    </p>
                </div>

                <div className="RepAJob-top-actions">
                    <button
                        onClick={() => setIsModalOpen(!isModalOpen)}
                        className="RepAJob-btn-action"
                        disabled={actionLoading}
                    >
                        <img src={pencil} alt="edit-icon" className="RepAJob-btn-icon-img" style={{ marginRight: '6px' }} />
                        Edit Status
                    </button>
                    <button
                        onClick={() => handleDeleteReport(selectedReport.id)}
                        className="RepAJob-btn-action RepAJob-btn-delete"
                        disabled={actionLoading}
                    >
                        <img src={deleteIcon} alt="delete-icon" className="RepAJob-btn-icon-img" style={{ marginRight: '6px' }} />
                        Delete
                    </button>
                    <button
                        style={{ background: "#2b8bf9" }}
                        onClick={() => setShowJobOverviewId(selectedReport.JobId || selectedReport.jobId)}
                        className="RepAJob-btn-action"
                        disabled={actionLoading}
                    >
                        View this Job
                    </button>
                </div>

                {/* ✅ Status Update Modal - Like AdminTickets */}
                {isModalOpen && (
                    <div className="RepAJob-status-modal-overlay">
                        <div className="RepAJob-status-modal-content">
                            <h3>Select Status</h3>
                            <p>Current Status: <strong>{currentStatus || "Pending"}</strong></p>

                            <div className="RepAJob-status-modal-options">
                                <button
                                    onClick={() => handleStatusChange(selectedReport.id, "Pending")}
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#ffc107', color: '#000' }}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedReport.id, "In Progress")}
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#17a2b8', color: '#fff' }}
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedReport.id, "Resolved")}
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#28a745', color: '#fff' }}
                                >
                                    Resolved
                                </button>
                            </div>

                            <button
                                className="RepAJob-status-modal-cancel"
                                onClick={() => setIsModalOpen(false)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ✅ LIST VIEW with Refresh button
    return (
        <div className="RepAJob-container">
            <div className="RepAJob-header">
                <div>
                    <h2>Newly received reports</h2>
                    <p>List of newly received reports for the job</p>
                </div>
                {/* ✅ Refresh button */}
                {/* <button
                    onClick={() => fetchReports()}
                    disabled={reportsLoading}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#1E88E5",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    {reportsLoading ? "Refreshing..." : "Refresh"}
                </button> */}
            </div>
            <div className="RepAJob-table-wrapper">
                <table className="RepAJob-table">
                    <thead>
                        <tr>
                            <th>REPORT ID</th>
                            <th>SUBJECT</th>
                            <th>JOB ID</th>
                            <th>USER</th>
                            <th>CATEGORY</th>
                            <th style={{ paddingLeft: "40px" }}>PRIORITY</th>
                            <th>RECEIVED AT</th>
                            <th>STATUS / TIME</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports && reports.length > 0 ? (
                            reports.map((item, index) => {
                                const itemPriority = item.priority || 'Medium';
                                return (
                                    <tr key={item.id || index}>
                                        <td>{item.RepId || `REP-${item.id}`}</td>
                                        <td>{item.reason || "Progress, project & status reports"}</td>
                                        <td>{item.JobId || item.jobId || item.id}</td>
                                        <td>{item.firstName || item.name || 'N/A'} {item.lastName || ''}</td>
                                        <td>{item.category || 'Report'}</td>
                                        <td>
                                            <span
                                                style={{ display: "flex", justifyContent: "center" }}
                                                className={`Escalation-priority ${itemPriority}`}
                                            >
                                                {itemPriority}
                                            </span>
                                        </td>
                                        <td>{formatToLocalTime(item.created_at || item.date)}</td>
                                        <td>{item.status || "Pending"}</td>
                                        <td>
                                            <button
                                                style={{
                                                    background: "#1E88E5",
                                                    color: "white",
                                                    borderRadius: "5px",
                                                    padding: "7px 10px",
                                                    outline: "none",
                                                    border: "none",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => setSelectedReport(item)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                                    {reportsLoading ? "Loading reports..." : "No Reports Found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};