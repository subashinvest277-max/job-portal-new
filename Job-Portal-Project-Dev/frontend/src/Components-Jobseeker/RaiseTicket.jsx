import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reportsubmitted from '../assets/Report_Submitted.png'
import './RaiseTicket.css';
import { Footer } from '../Components-LandingPage/Footer';
import { FHeader } from '../Components-Jobseeker/FHeader';
import axios from 'axios';
import api from '../api/axios';

export const RaiseTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        name: '',
        email: '',
        phone: '',
        message: '',
        attachment: null,
    });

    const [fileError, setFileError] = useState('');
    const [step, setStep] = useState('form');
    const [showCategory, setShowCategory] = useState(false);
    const [showSubject, setShowSubject] = useState(false);
    const [errors, setErrors] = useState({});

    const subjects = [
        "Broken 'Apply' Button/Application Failure",
        "File Upload/Resume Parsing Errors",
        "Outdated or Ghost Job Listings",
        "Incorrect/Irrelevant Search Results & Filters",
        "Profile Update/Saved Data Not Saving",
        "Application Status Unchanged/Limbo",
        "Broken Job Alerts & Notifications",
        "Login/Registration Issues (Social Login Bugs)",
        "Site Incompatibility/Non-Responsive Mobile Layout",
        "Duplicate Job Listings (Spam)",
        "Others"
    ];

    // Allowed file types
    const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
    ];

    // Allowed file extensions
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];

    // Max file size (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Validate file
    const validateFile = (file) => {
        if (!file) return true; // No file is valid (optional field)

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File size exceeds 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
            return false;
        }

        // Check file type by MIME type
        if (!allowedFileTypes.includes(file.type)) {
            // Also check by extension as fallback
            const fileName = file.name.toLowerCase();
            const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!hasValidExtension) {
                setFileError(`Invalid file format. Allowed formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG`);
                return false;
            }
        }

        setFileError('');
        return true;
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.message.trim()) {
            errors.message = "Message is required";
        }

        if (!formData.category) {
            errors.category = "Category is required";
        }

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
            errors.name = "Name should contain only letters";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[a-zA-Z][a-zA-Z0-9]*@(gmail|yahoo|outlook|hotmail|fabaos)\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }

        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
            errors.phone = "Phone must be exactly 10 digits";
        } else if (/^(\d)\1{9}$/.test(formData.phone)) {
            errors.phone = "Phone cannot be all same digits";
        }

        if (!formData.subject) {
            errors.subject = "Subject is required";
        }

        // Validate attachment if present
        if (formData.attachment) {
            const isValid = validateFile(formData.attachment);
            if (!isValid) {
                errors.attachment = fileError;
            }
        }

        return errors;
    };

    const handleSubmitClick = (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            console.log(errors);
            setErrors(errors);
            return;
        }

        setStep('confirming');
    };

    const handleConfirm = async () => {
        try {
            setStep('loading');
            const data = new FormData();
            data.append("category", formData.category);
            data.append("subject", formData.subject);
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("message", formData.message || '');
            if (formData.attachment) {
                data.append("attachment", formData.attachment);
            }
            const response = await api.post("raise-ticket/", data);
            console.log("SUCCESS:", response.data);
            setTimeout(() => {
                setStep('success');
                setTimeout(() => {
                    navigate('/Job-portal/jobseeker/help-center');
                }, 2000);
            }, 1500);
        } catch (error) {
            console.error("ERROR:", error.response?.data || error);
            alert("Ticket submission failed");
            setStep('form');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setFormData({ ...formData, attachment: null });
            setFileError('');
            return;
        }

        // Validate file
        const isValid = validateFile(file);

        if (isValid) {
            setFormData({ ...formData, attachment: file });
            // Clear any existing file error from errors state
            if (errors.attachment) {
                setErrors(prev => ({ ...prev, attachment: null }));
            }
        } else {
            setFormData({ ...formData, attachment: null });
            // Clear the file input
            e.target.value = '';
        }
    };

    if (step === 'success') {
        return (
            <div>
                <FHeader />
                <div className="Raiseticket-status-container">
                    {step === 'loading' ? (
                        <div className="Raiseticket-loader"></div>
                    ) : (
                        <div className="Raiseticket-success-msg">
                            <img src={Reportsubmitted} alt="ReportSubmitted" />
                            <h2>Ticket Raised successfully</h2>
                        </div>
                    )}
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <FHeader />
            <div className="Raiseticket-main-wrapper">
                <div className="Raiseticket-page">
                    <div className="Raiseticket-header">
                        <h1>Ticket Raise</h1>
                        <p>We're here to help.</p>
                        <p>Raise a ticket and we'll get back to you soon</p>
                    </div>

                    <div className="Raiseticket-card">
                        <form onSubmit={handleSubmitClick}>

                            <div className="Raiseticket-form-group">
                                <label>Category*</label>
                                <div className={`Raiseticket-custom-select ${showCategory ? 'open' : ''} ${errors.category ? 'Raiseticket-custom-select-err' : ''}`}
                                    onClick={() => setShowCategory(!showCategory)}>
                                    {formData.category || "Select type"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showCategory && (
                                        <ul className="Raiseticket-options">
                                            <li onClick={() => setFormData({ ...formData, category: 'Jobseeker' })}>Jobseeker</li>
                                            <li onClick={() => setFormData({ ...formData, category: 'Employer' })}>Employer</li>
                                        </ul>
                                    )}
                                </div>
                                {errors.category && <span className='form-group-err'>{errors.category}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Subject*</label>
                                <div className={`Raiseticket-custom-select ${showSubject ? 'open' : ''} ${errors.subject ? 'Raiseticket-custom-select-err' : ''}`}
                                    onClick={() => setShowSubject(!showSubject)}>
                                    {formData.subject || "Select an issue"}
                                    <div className="Raiseticket-arrow-icon"></div>
                                    {showSubject && (
                                        <ul className="Raiseticket-options scrollable">
                                            {subjects.map(s => (
                                                <li key={s} onClick={() => setFormData({ ...formData, subject: s })}>{s}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {errors.subject && <span className='form-group-err'>{errors.subject}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Name*</label>
                                <input
                                    className={`${errors.name ? 'Raiseticket-form-group-err' : ''}`}
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(value)) {
                                            setFormData({ ...formData, name: value });
                                        }
                                    }}
                                />
                                {errors.name && <span className='form-group-err'>{errors.name}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Email*</label>
                                <input
                                    type="email"
                                    placeholder="Enter email ID"
                                    className={`${errors.email ? 'Raiseticket-form-group-err' : ''}`}
                                    value={formData.email}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormData({ ...formData, email: value });
                                    }}
                                />
                                {errors.email && <span className='form-group-err'>{errors.email}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Phone number*</label>
                                <input
                                    type='tel'
                                    placeholder="Enter phone number"
                                    className={`${errors.phone ? 'Raiseticket-form-group-err' : ''}`}
                                    value={formData.phone}
                                    maxLength={10}
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, "");
                                        if (value.length === 0) {
                                            setFormData({ ...formData, phone: "" });
                                            return;
                                        }
                                        if (!/^[6-9]/.test(value)) {
                                            return;
                                        }
                                        if (value.length <= 10) {
                                            setFormData({ ...formData, phone: value });
                                        }
                                    }}
                                />
                                {errors.phone && <span className='form-group-err'>{errors.phone}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Message*</label>
                                <textarea
                                    placeholder="Describe the issue here..."
                                    rows="4"
                                    className={`${errors.message ? 'Raiseticket-form-group-err' : ''}`}
                                    maxLength={500}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                                {errors.message && <span className='form-group-err'>{errors.message}</span>}
                            </div>

                            <div className="Raiseticket-form-group">
                                <label>Attachment (Optional)</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                <div
                                    className={`Raiseticket-file-input ${fileError ? 'Raiseticket-file-input-error' : ''}`}
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    {formData.attachment ? (
                                        <span style={{ color: '#2563eb', fontWeight: '500' }}>
                                            {formData.attachment.name}
                                        </span>
                                    ) : (
                                        "Click to attach a file (Optional)"
                                    )}
                                </div>
                                {(fileError || errors.attachment) && (
                                    <span className='form-group-err' style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                        {fileError || errors.attachment}
                                    </span>
                                )}
                                <small className="file-info">
                                    Accepted formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG (Max 10MB)
                                </small>
                            </div>

                            <div className="Raiseticket-form-actions">
                                <button type="button" className="Raiseticket-btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                                <button type="submit" className="Raiseticket-btn-submit">Submit</button>
                            </div>
                        </form>
                    </div>

                    {step === 'confirming' && (
                        <div className="Raiseticket-modal-overlay">
                            <div className="Raiseticket-modal">
                                <h3>Please confirm before submit</h3>
                                <div className="Raiseticket-modal-buttons">
                                    <button className="Raiseticket-btn-yes" onClick={handleConfirm}>Yes</button>
                                    <button className="Raiseticket-btn-no" onClick={() => setStep('form')}>No</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};