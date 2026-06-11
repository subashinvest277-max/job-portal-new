import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import manSitting from '../assets/Illustration_1.png';
import eye from '../assets/show_password.png';
import eyeHide from '../assets/eye-hide.png';
import './AdminLogin.css'
import api from '../api/axios'; // Add this line

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [passwordShow, setPasswordShow] = useState(true);
    // 1. Added mobile to formValues
    const [formValues, setFormValues] = useState({ adminID: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);  // ← ADDED


    // const AdminID = "Admin5122";
    // const AdminPwd = "Admin@123";

    const togglePasswordView = () => {
        setPasswordShow((prev) => !prev);
    };

    const handleForm = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
        setErrors({ ...errors, [name]: "" });
        setServerError("");
    };

    // ADDED after handleForm:
    useEffect(() => {
        const savedRemember = sessionStorage.getItem("admin_remember_me") === "true";
        if (savedRemember) {
            const savedAdminID = sessionStorage.getItem("admin_saved_id") || "";
            const savedPassword = sessionStorage.getItem("admin_saved_password") || "";
            setFormValues({ adminID: savedAdminID, password: savedPassword });
            setRememberMe(true);
        }
    }, []);

    const handleRememberMe = (e) => {
        const checked = e.target.checked;
        setRememberMe(checked);
        if (!checked) {
            sessionStorage.removeItem("admin_remember_me");
            sessionStorage.removeItem("admin_saved_id");
            sessionStorage.removeItem("admin_saved_password");
        }
    };

    // 2. Function for Verify Button
    // const handleVerify = () => {
    //     const mobileRegex = /^[6-9]\d{9}$/;
    //     if (!formValues.mobile) {
    //         setErrors(prev => ({ ...prev, mobile: "Mobile number is required for verification" }));
    //     } else if (!mobileRegex.test(formValues.mobile)) {
    //         setErrors(prev => ({ ...prev, mobile: "Enter a valid 10-digit number" }));
    //     } else {
    //         alert("Verification OTP sent to " + formValues.mobile);
    //         navigate('/Job-portal/login/otpverification', {
    //     state: {
    //         mobile: formValues.mobile,
    //         sentTo: formValues.mobile,
    //         role: "admin"
    //     }
    // });
    //     }
    // };

    const validateForm = () => {
        const newErrors = {};
        if (!formValues.adminID.trim()) {
            newErrors.adminID = "Admin ID or Email is required";
        } else if (formValues.adminID.trim().length < 3) {
            newErrors.adminID = "Admin ID must be at least 3 characters";
        }
        if (!formValues.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formValues.password.trim().length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     if (validateForm()) {
    //         console.log("Admin Login Data:", formValues);
    //         navigate("/Job-portal/admin/dashboard");
    //     }
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setServerError("");

        try {
            const response = await api.post('admin-login/', {
                email: formValues.adminID,
                password: formValues.password
            });

            //  if (response.data.status === "success") {
            //     if (response.data.access) {
            //         sessionStorage.setItem("access", response.data.access);
            //     }
            //     if (response.data.refresh) {
            //         sessionStorage.setItem("refresh", response.data.refresh);
            //     }
            //     sessionStorage.setItem("user_type", response.data.user_type || "admin");
            //     sessionStorage.setItem("admin_id", response.data.admin_id || formValues.adminID);

            //     console.log("Admin Login Data:", formValues);
            //     navigate("/Job-portal/admin/dashboard");
            // } else {
            //     setServerError(response.data.message || "Login failed");
            // }


            // AFTER:
            if (response.data.access) {
                sessionStorage.setItem("access", response.data.access);
                sessionStorage.setItem("refresh", response.data.refresh);
                sessionStorage.setItem("user_type", response.data.user?.user_type || "admin");
                sessionStorage.setItem("admin_id", response.data.user?.id || formValues.adminID);
                sessionStorage.setItem('token', response.data.access);
                sessionStorage.setItem('access_token', response.data.access);
                // AFTER:
                if (rememberMe) {
                    sessionStorage.setItem("admin_remember_me", "true");
                    sessionStorage.setItem("admin_saved_id", formValues.adminID);
                    sessionStorage.setItem("admin_saved_password", formValues.password);
                } else {
                    sessionStorage.removeItem("admin_remember_me");
                    sessionStorage.removeItem("admin_saved_id");
                    sessionStorage.removeItem("admin_saved_password");
                }
                navigate("/Job-portal/admin/dashboard");
            } else {
                setServerError(response.data.message || "Login failed");
            }
        } catch (error) {
            console.error("Admin login error:", error);
            if (!error.response) {
                setServerError("Network error. Please check your connection.");
            } else {
                const status = error.response.status;
                const message =
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.response?.data?.non_field_errors?.[0] ||
                    error.response?.data?.username?.[0] ||
                    error.response?.data?.password?.[0] ||
                    null;
                if (status === 400) {
                    setServerError(message || "Invalid input. Please check your credentials.");
                } else if (status === 401) {
                    setServerError(message || "Invalid Admin ID or Password.");
                } else if (status === 403) {
                    setServerError("Access denied. You are not authorized.");
                } else if (status === 404) {
                    setServerError("Login service not found. Contact support.");
                } else if (status === 500) {
                    setServerError("Server error. Please try again later.");
                } else {
                    setServerError(message || "Something went wrong. Please try again.");
                }
            }
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <header className="login-header">
                <Link to="/" className="logo">
                    <span className="logo-text">Job portal</span>
                    <span className='subtext'> For Administrator</span>
                </Link>
                <div className="header-links">
                    <p className="employer-redirect-link" >Login to manage users and postings</p>
                </div>
            </header>

            <div className="Admin-Login-Module">
                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-login-title-row">
                        <Link to="/Job-portal/role-selection" className="auth-back-btn">
                            ← Back
                        </Link>

                        <h2>Login as Administrator</h2>
                    </div>
                    
                    <p style={{ color: '#666', textAlign: "center", fontSize: '14px' }}>Login to manage users and postings</p>
                    {serverError && (
                        <div className="server-error" style={{
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {serverError}
                        </div>
                    )}
                    <label>Admin ID / Email</label>
                    <input
                        type="text"
                        name="adminID"
                        placeholder="Enter Admin ID"
                        value={formValues.adminID}
                        onChange={handleForm}
                        className={errors.adminID ? "input-error" : ""}
                    />
                    {errors.adminID && <span className="error-msg">{errors.adminID}</span>}

                    <label>Password</label>
                    <div className="password-wrapper">
                        <input
                            type={passwordShow ? "password" : "text"}
                            placeholder="Admin@123"
                            name='password'
                            value={formValues.password}
                            onChange={handleForm}
                            className={errors.password ? "input-error" : ""}
                        />
                        <span className="eye-icon" onClick={togglePasswordView}>
                            <img src={passwordShow ? eyeHide : eye} className='show-icon' alt='toggle' />
                        </span>
                    </div>
                    {errors.password && <span className="error-msg">{errors.password}</span>}

                    <div className="form-options">
                        <label>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={handleRememberMe}
                            />
                            {' '}Remember Session
                        </label>                    </div>


                    {/* <button style={{ marginBottom: "10px" }} type="submit" className="j-login-btn">Admin Login</button> */}
                    <button style={{ marginBottom: "10px" }} type="submit" className="j-login-btn" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Admin Login"}
                    </button>

                    {/* <div className="divider">Or Continue with</div> */}

                    {/* <h3 style={{textAlign:"center"}}>Login With Mobile</h3> */}
                    {/* <div>
                   
                    <div className="mobile-input-wrapper" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Enter Mobile Number"
                            value={formValues.mobile}
                            onChange={handleForm}
                            className={errors.mobile ? "input-error" : ""}
                            style={{ flex: 1, marginTop:"10px" }}
                        />
                        <button
                            type="button"
                            className="verify-btn"
                            onClick={handleVerify}
                            style={{ padding: '0 15px', marginTop:"10px",backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Verify
                        </button>
                    </div>
                    {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
                </div> */}

                </form>

            </div>
        </div>
    );
};

