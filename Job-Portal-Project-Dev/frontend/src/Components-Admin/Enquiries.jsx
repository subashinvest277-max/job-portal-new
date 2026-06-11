import React, { useState, useEffect } from 'react'
import './Enquiries.css'
import ViewButton from '../assets/AdminAssets/EyeIcon.png';
import Enquiry from '../assets/AdminAssets/Enquires.png';
import Delete from '../assets/AdminAssets/DeleteIcon.png';
import pencil from '../assets/AdminAssets/Edit.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
import { useJobs } from '../JobContext';
import api from '../api/axios';

export const Enquiries = () => {
    const { enquiries, setEnquiries, fetchEnquiries, enquiriesLoading } = useJobs()
    const [selectedEnquiry, setSelectedEnquiry] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "May 15, 2026";
        try {
            if (dateStr.includes('T')) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };
   
    const getSortedEnquiries = () => {
        if (!enquiries || enquiries.length === 0) return [];
        return [...enquiries].sort((a, b) => {
            if (a.status === "Pending" && b.status !== "Pending") return -1;
            if (a.status !== "Pending" && b.status === "Pending") return 1;
            return 0;
        });
    };
 
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this enquiry?")) {
            try {
                setActionLoading(true);
                await api.delete(`/contact-messages/${id}/delete/`);
                const updatedEnquiries = enquiries.filter(item => item.id !== id);
                setEnquiries(updatedEnquiries);
                setSelectedEnquiry(null);
                alert("Enquiry deleted successfully!");
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Failed to delete enquiry. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleStatusSelection = async (newStatus) => {
        try {
            setActionLoading(true);
            
            await api.patch(`/contact/update/${selectedEnquiry.id}/`, {
                status: newStatus
            });
            
            setSelectedEnquiry((prev) => ({ 
                ...prev, 
                status: newStatus 
            }));
            
            setEnquiries((prevList) =>
                prevList.map((enquiry) =>
                    enquiry.id === selectedEnquiry.id 
                        ? { ...enquiry, status: newStatus } 
                        : enquiry
                )
            );
            
            setIsModalOpen(false);
            alert(`Status changed to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Update failed:", error);
            alert(error.response?.data?.message || "Failed to update status.");
        } finally {
            setActionLoading(false);
        }
    };
 
    const sortedData = getSortedEnquiries();

    const formatEnquiryId = (id, index) => {
        if (!id) return `ENQ-${index + 1}`;
        if (typeof id === 'string' && id.startsWith('#ENQ')) {
            return `CT-2026-00${index + 1}`;
        }
        return id;
    };

    if (enquiriesLoading && enquiries.length === 0) {
        return (
            <div className="Enquiries-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>Loading enquiries...</h3>
                </div>
            </div>
        );
    }

    // ✅ DETAILS VIEW - Status on Right Side (Like Escalation)
    if (selectedEnquiry) {
        return (
            <div className="Enquiries-container">
                <div className="Enquiries-header">
                    <div>
                        <h2>Enquiry Details</h2>
                    </div>
                </div>
                
                <div className="enq-details-actions-bar">
                    <button 
                        className="enq-back-to-contact-btn" 
                        onClick={() => setSelectedEnquiry(null)}
                        disabled={actionLoading}
                    >
                        Back to Contact Us
                    </button>
                    <button 
                        className="enq-delete-action-btn" 
                        onClick={() => handleDelete(selectedEnquiry.id)}
                        disabled={actionLoading}
                    >
                        <img src={Delete} alt="Delete" /> Delete
                    </button>
                </div>
 
                <div className="enq-details-main-content">
                    <div className="enq-details-left-pane">
                        {/* Header Card with Icon and Right Side Status */}
                        <div style={{
                            border: "1px solid #e5e7eb",
                            padding: "20px",
                            margin: "15px 0",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <img src={Enquiry} alt="Enquiry" style={{ width: "50px", height: "50px" }} />
                                <div>
                                    <h3 style={{ margin: 0 }}>
                                        {formatEnquiryId(selectedEnquiry.id, 0)}
                                    </h3>
                                    <p style={{ margin: "5px 0 0 0", color: "#666" }}>
                                        Created on : {selectedEnquiry.created_at 
                                            ? formatDate(selectedEnquiry.created_at)
                                            : (selectedEnquiry.date || 'Date not available')}
                                    </p>
                                </div>
                            </div>
                            
                            {/* ✅ Status on Right Side - Like Escalation */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 20px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                minWidth: "150px"
                            }}>
                                <img src={AdminStatus} width={18} height={18} alt="Status" />
                                <span style={{ fontWeight: "500" }}>Status :</span>
                                <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    fontWeight: "bold",
                                    backgroundColor: selectedEnquiry.status === "Pending" ? "#ffc107" : "#28a745",
                                    color: selectedEnquiry.status === "Pending" ? "#000" : "#fff"
                                }}>
                                    {selectedEnquiry.status || "Pending"}
                                </span>
                            </div>
                        </div>
                        
                        {/* User Information Section */}
                        <div style={{marginTop:"25px"}} className="Adm-tic-user-section">
                            <h2 className="Adm-tic-section-title">User Information</h2>
                            <div className="Adm-tic-user-grid">
                                <div className="Adm-tic-grid-row">
                                    <span className="Adm-tic-grid-label">Name :</span> 
                                    <input type="text" disabled value={selectedEnquiry.name || 'N/A'} />
                                </div>
                                <div className="Adm-tic-grid-row">
                                    <span className="Adm-tic-grid-label">Mobile number :</span>
                                    <input type='text' disabled value={selectedEnquiry.contact || selectedEnquiry.mobile || 'N/A'}/>
                                </div>
                                <div className="Adm-tic-grid-row">
                                    <span className="Adm-tic-grid-label">Mail ID :</span>
                                    <input disabled value={selectedEnquiry.email || 'N/A'}/>
                                </div>
                            </div>
                        </div>

                        {/* Enquiry Details Section */}
                        <div className="Adm-tic-main-content">
                            <div className="Adm-tic-left-panel">
                                <div className="Adm-tic-details-section">
                                    <h2 className="Adm-tic-section-title">Enquiry details :</h2>
                                    <p className="Adm-tic-description">
                                        {selectedEnquiry.message || selectedEnquiry.reason || 'No message provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="Adm-tic-top-actions">
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="Adm-tic-btn-action"
                        disabled={actionLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <img src={pencil} alt="edit" style={{ width: '14px' }} /> Edit Status
                    </button>
                    <button 
                        onClick={() => handleDelete(selectedEnquiry.id)} 
                        className="Adm-tic-btn-action Adm-tic-btn-delete"
                        disabled={actionLoading}
                    >
                        Delete
                    </button>
                </div>

                {/* Status Modal */}
                {isModalOpen && (
                    <div className="status-modal-overlay">
                        <div className="status-modal-content">
                            <h3>Select Status</h3>
                            <p>Current Status: <strong>{selectedEnquiry.status || "Pending"}</strong></p>
                           
                            <div className="status-modal-options">
                                <button 
                                    onClick={() => handleStatusSelection("Pending")}
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#ffc107', color: '#000' }}
                                >
                                    Pending
                                </button>
                                <button 
                                    onClick={() => handleStatusSelection("Contacted")}
                                    disabled={actionLoading}
                                    style={{ backgroundColor: '#28a745', color: '#fff' }}
                                >
                                    Contacted
                                </button>
                            </div>

                            <button 
                                className="status-modal-cancel" 
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
 
    // LIST VIEW
    return (
        <div className="Enquiries-container">
            <div className="Enquiries-header" style={{ marginTop: '30px' }}>
                <div>
                    <h2>Newly received enquiry</h2>
                    <p>List of newly received enquiries on this portal</p>
                </div>
                {/* <button 
                    onClick={() => fetchEnquiries()} 
                    disabled={enquiriesLoading}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#1E88E5",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    {enquiriesLoading ? "Refreshing..." : "Refresh"}
                </button> */}
            </div>
 
            <div className="Enquiries-table-wrapper">
                <table className="Enquiries-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Enquiry</th>
                            <th>User</th>
                            <th>Received at</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.length > 0 ? (
                            sortedData.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td style={{ fontWeight: '600' }}>
                                        {formatEnquiryId(item.id, index)}
                                    </td>
                                    <td>{item.message || item.reason || 'No message'}</td>
                                    <td style={{ fontWeight: '600' }}>
                                        {item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500', color: '#111827' }}>
                                            {formatDate(item.created_at || item.date)}
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '3px' }}>
                                            {item.time}
                                        </div>
                                    </td>
                                    <td>
                                        <button style={{
                                            background: "#1E88E5",
                                            color: "white",
                                            borderRadius: "5px",
                                            padding: "7px 10px",
                                            outline: "none",
                                            border: "none",
                                            cursor: "pointer"
                                        }} onClick={() => setSelectedEnquiry(item)}>
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                    {enquiriesLoading ? "Loading enquiries..." : "No Enquiries Found"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}