import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Header } from '../Components-LandingPage/Header';
import { Footer } from '../Components-LandingPage/Footer';
import api from '../api/axios'; // base api

// Style
import './ReportAJob.css';

// Named export to match your App.jsx import
export const ReportAJob = () => {
    const navigate = useNavigate();
    const initialValues = {
        job_id: "",
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        reason: "",
        explanation: ""
    };

    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const { id } = useParams();
    const EXPLANATION_MAX_LENGTH = 100;

    useEffect(() => {
        if (id) {
            setFormValues(prev => ({
                ...prev,
                job_id: id
            }));
        }
    }, [id]);

    // Validation for alphabets only (no spaces, no numbers, no special characters)
    const isValidName = (name) => {
        // Only letters A-Z and a-z allowed
        const nameRegex = /^[A-Za-z]+$/;
        return nameRegex.test(name);
    };

    // Validation for alphabets with spaces (for reason and explanation)
    const isValidTextWithSpaces = (text) => {
        // Only letters A-Z, a-z, and spaces allowed
        const textRegex = /^[A-Za-z\s]*$/;
        return textRegex.test(text);
    };

    const validate = () => {
        let newErrors = {};

        const emailRegex = /^[a-zA-Z][a-zA-Z0-9]*@(gmail|yahoo|outlook|hotmail|fabaos)\.[a-zA-Z]{2,}$/;
        if (!formValues.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formValues.email)) {
            newErrors.email = "Invalid email format";
        } else if (formValues.email.length > 100) {
            newErrors.email = "Email cannot exceed 100 characters";
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!formValues.mobile) {
            newErrors.mobile = "Phone number is required";
        } else if (!phoneRegex.test(formValues.mobile)) {
            newErrors.mobile = "Number must start with 6, 7, 8, or 9 and be 10 digits";
        }

        // First Name validation - alphabets only
        if (!formValues.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (!isValidName(formValues.firstName)) {
            newErrors.firstName = "Only alphabets allowed";
        } else if (formValues.firstName.length > 15) {
            newErrors.firstName = "First name cannot exceed 15 characters";
        }

        // Last Name validation - alphabets only
        if (!formValues.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (!isValidName(formValues.lastName)) {
            newErrors.lastName = "Only alphabets allowed";
        } else if (formValues.lastName.length > 15) {
            newErrors.lastName = "Last name cannot exceed 15 characters";
        }

        // Reason validation - alphabets and spaces only
        if (!formValues.reason.trim()) {
            newErrors.reason = "Reason for complaint is required";
        } else if (!isValidTextWithSpaces(formValues.reason)) {
            newErrors.reason = "Only alphabets and spaces allowed";
        } else if (formValues.reason.length > 100) {
            newErrors.reason = "Reason cannot exceed 100 characters";
        }

        // Explanation validation - alphabets and spaces only
        if (!formValues.explanation.trim()) {
            newErrors.explanation = "Please provide an explanation";
        } else if (!isValidTextWithSpaces(formValues.explanation)) {
            newErrors.explanation = "Only alphabets and spaces allowed";
        } else if (formValues.explanation.length > EXPLANATION_MAX_LENGTH) {
            newErrors.explanation = `Explanation cannot exceed ${EXPLANATION_MAX_LENGTH} characters`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle First Name - Only alphabets, max 15 characters
        if (name === "firstName") {
            // Remove any non-alphabetic characters
            const onlyAlpha = value.replace(/[^A-Za-z]/g, "");
            // Limit to 15 characters
            const limitedValue = onlyAlpha.slice(0, 15);
            setFormValues({ ...formValues, [name]: limitedValue });
        }
        // Handle Last Name - Only alphabets, max 15 characters
        else if (name === "lastName") {
            // Remove any non-alphabetic characters
            const onlyAlpha = value.replace(/[^A-Za-z]/g, "");
            // Limit to 15 characters
            const limitedValue = onlyAlpha.slice(0, 15);
            setFormValues({ ...formValues, [name]: limitedValue });
        }
        // Handle Reason - Only alphabets and spaces
        else if (name === "reason") {
            // Remove numbers and special characters, keep alphabets and spaces
            const onlyAlphaAndSpace = value.replace(/[^A-Za-z\s]/g, "");
            // Limit to 100 characters
            const limitedValue = onlyAlphaAndSpace.slice(0, 100);
            setFormValues({ ...formValues, [name]: limitedValue });
        }
        //  Handle Explanation - Only alphabets and spaces
        else if (name === "explanation") {
            const onlyAlphaAndSpace = value.replace(/[^A-Za-z\s]/g, "");
            const limitedValue = onlyAlphaAndSpace.slice(0, EXPLANATION_MAX_LENGTH);
            setFormValues({ ...formValues, [name]: limitedValue });
        }
        // Handle mobile number
        else if (name === "mobile") {
            // Only allow numbers and restrict to 10 digits
            const onlyNums = value.replace(/[^0-9]/g, "");
            if (onlyNums.length <= 10) {
                setFormValues({ ...formValues, [name]: onlyNums });
            }
        }
        // Handle email with length restriction
        else if (name === "email") {
            const limitedValue = value.slice(0, 100);
            setFormValues({ ...formValues, [name]: limitedValue });
        }
        // Handle all other fields
        else {
            setFormValues({ ...formValues, [name]: value });
        }

        if (errors[name]) setErrors({ ...errors, [name]: "" });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (validate()) {
    //         try {
    //             console.log(formValues)
    //             const responseData = await api.post('complaints/submit/', formValues)
    //             console.log(responseData)
    //             alert("Report submitted successfully!");
    //             navigate("/Job-portal/jobseeker");
    //             setFormValues(initialValues);
    //         } catch (error) {
    //             const errData = error.response?.data;

    //             console.log(errData);

    //             if (errData?.non_field_errors) {
    //                 if (errData.non_field_errors[0]) {
    //                     alert(errData.non_field_errors[0]);
    //                 }
    //             }

    //             if (errData?.job_id && errData.job_id[0]) {
    //                 alert(errData.job_id[0])
    //             }
    //         }
    //     }
    // }; 


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                console.log("Submitting complaint for job:", formValues.job_id);
                
               
                const responseData = await api.post(`complaints/submit/${formValues.job_id}/`, {
                    firstName: formValues.firstName,
                    lastName: formValues.lastName,
                    mobile: formValues.mobile,
                    email: formValues.email,
                    reason: formValues.reason,
                    explanation: formValues.explanation
                });
                
                console.log("Response:", responseData);
                alert("Report submitted successfully!");
                navigate("/Job-portal/jobseeker");
                setFormValues(initialValues);
            } catch (error) {
                const errData = error.response?.data;
                console.log("Error:", errData);

                if (errData?.non_field_errors) {
                    if (errData.non_field_errors[0]) {
                        alert(errData.non_field_errors[0]);
                    }
                } else if (errData?.job_id && errData.job_id[0]) {
                    alert(errData.job_id[0]);
                } else if (errData?.detail) {
                    alert(errData.detail);
                } else if (errData?.error) {
                    alert(errData.error);
                } else {
                    alert("Failed to submit report. Please try again.");
                }
            }
        }
    };

    // Auto-capitalize first letter of each name
    const handleBlur = (e) => {
        const { name, value } = e.target;
        if ((name === "firstName" || name === "lastName") && value) {
            const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            if (value !== capitalized) {
                setFormValues({ ...formValues, [name]: capitalized });
            }
        }
    };

    return (
        <>
            <Header />
            <div className="report-container">
                <h2 className="report-title">Complaint Form</h2>
                <form className="report-card" onSubmit={handleSubmit}>
                    <div className="report-row">
                        <label>Name</label>
                        <div className="report-input-value">
                            <div className="report-input-split">
                                {/* First Name Group */}
                                <div className="report-input-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First name"
                                        value={formValues.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        maxLength={15}
                                        className={errors.firstName ? "error-field" : ""}
                                    />
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>

                                {/* Last Name Group */}
                                <div className="report-input-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last name"
                                        value={formValues.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        maxLength={15}
                                        className={errors.lastName ? "error-field" : ""}
                                    />
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Mobile number</label>
                        <div className="report-input-value">
                            <input
                                type="text"
                                name="mobile"
                                placeholder="9145******"
                                value={formValues.mobile}
                                onChange={handleChange}
                                maxLength={10}
                                className={errors.mobile ? "error-field" : ""}
                            />
                            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Mail ID</label>
                        <div className="report-input-value">
                            <input
                                type="email"
                                name="email"
                                placeholder="e.g., name@gmail.com"
                                value={formValues.email}
                                onChange={handleChange}
                                maxLength={100}
                                className={errors.email ? "error-field" : ""}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="report-row">
                        <label>Reason for complaint</label>
                        <div className="report-input-value">
                            <input
                                type="text"
                                name="reason"
                                placeholder="Enter a subject"
                                value={formValues.reason}
                                onChange={handleChange}
                                maxLength={100}
                                className={errors.reason ? "error-field" : ""}
                            />
                            {errors.reason && <span className="error-text">{errors.reason}</span>}
                        </div>
                    </div>

                    <div className="report-row align-top">
                        <label>Explain</label>
                        <div className="report-input-value">
                            <textarea
                                name="explanation"
                                rows="4"
                                value={formValues.explanation}
                                onChange={handleChange}
                                maxLength={EXPLANATION_MAX_LENGTH}
                                placeholder="Please provide detailed explanation"
                                className={errors.explanation ? "error-field" : ""}
                            />
                            <div className="character-count">
                                Character limit: {formValues.explanation.length}/{EXPLANATION_MAX_LENGTH}
                            </div>

                            {errors.explanation && (
                                <span className="error-text">{errors.explanation}</span>
                            )}                        </div>
                    </div>

                    <div className="report-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn-submit">Submit</button>
                    </div>
                </form>
            </div>
            <Footer />
        </>
    );
};
