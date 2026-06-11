import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";
import workTime from '../assets/WorkTime.png';
import Google from '../assets/icon_email_id.png';
import eye from '../assets/show_password.png';
import eyeHide from '../assets/eye-hide.png';
import emailIcon from '../assets/icon_email_otp.png';
import mobileIcon from '../assets/icon_mobile_otp.png';
import Verified from '../assets/verified-otpimage.png';
import './Jsignup.css';
import './OtpModal.css';
import api from '../api/axios';

export const Jsignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo || "/Job-portal/jobseeker/";

  const [isLoading, setIsLoading] = useState(false);
  const [passwordShow, setPasswordShow] = useState(true);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(true);

  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpValues, setOtpValues] = useState({ emailOtp: "", mobileOtp: "" });
  const [timer, setTimer] = useState(0);
  const [emailForOtp, setEmailForOtp] = useState("");
  const [mobileForOtp, setMobileForOtp] = useState("");

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && (showEmailOtp || showMobileOtp)) {
      if (timer === 0 && (showEmailOtp || showMobileOtp)) {
        clearInterval(interval);
      }
    }
    return () => clearInterval(interval);
  }, [timer, showEmailOtp, showMobileOtp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev);
  };

  const toggleConfirmPasswordView = () => {
    setConfirmPasswordShow((prev) => !prev);
  };

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    phone: ""
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleForm = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "")
      if (onlyNums.length <= 10) {
        setFormValues({ ...formValues, [name]: onlyNums });
        setErrors({ ...errors, [name]: "" });
      }
      return;
    }
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const sendEmailOtp = async () => {
    const email = formValues.email;

    if (!email) {
      alert("Please enter your email first");
      return;
    }

    const emailRegex = /^(?=[^a-zA-Z]*[a-zA-Z])[a-zA-Z0-9]+@(gmail|yahoo|outlook|hotmail|fabaos)\.[a-zA-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('send-email-otp/', {
        email: email
      });

      if (response.status === 200 || response.status === 201) {
        alert(`OTP sent to ${email}`);
        setTimer(180);
        setEmailForOtp(email);
        setShowEmailOtp(true);
        setOtpValues((prev) => ({ ...prev, emailOtp: "" }));

        if (response.data.otp) {
          console.log('Test OTP:', response.data.otp);
        }
      } else {
        alert(response.data.message || response.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      console.log('Full error response:', err.response);

      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message;
        if (errorMsg && errorMsg.includes('already registered')) {
          setErrors({ ...errors, email: "This email is already registered. Please login instead." });
        } else {
          alert(errorMsg || 'Failed to send OTP. Please try again.');
        }
      } else if (err.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to send OTP. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    const code = otpValues.emailOtp;

    if (!code || code.length !== 6) {
      alert("Please enter complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/verify-email-otp/', {
        email: emailForOtp,
        otp: code
      });

      if (response.status === 200 || response.status === 201) {
        setIsEmailVerified(true);

        setTimeout(() => {
          setShowEmailOtp(false);
          setTimer(0);
          setOtpValues((prev) => ({ ...prev, emailOtp: "" }));
        }, 3000);

        alert('Email verified successfully!');
      } else {
        alert(response.data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      console.log('Full error response:', err.response);

      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Verification failed. Please try again.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMobileOtp = async () => {
    const phone = formValues.phone;

    if (!phone) {
      alert("Please enter your mobile number first");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setErrors({ ...errors, phone: "Please enter a valid 10-digit mobile number" });
      return;
    }

    setIsLoading(true);

    try {
      setTimeout(() => {
        alert(`OTP sent to ${phone}`);
        setTimer(180);
        setMobileForOtp(phone);
        setShowMobileOtp(true);
        setOtpValues((prev) => ({ ...prev, mobileOtp: "" }));
        setIsLoading(false);
      }, 1000);

      console.log('Test OTP for mobile: 123456');
    } catch (err) {
      console.error('Send Mobile OTP error:', err);
      alert('Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    const code = otpValues.mobileOtp;

    if (!code || code.length !== 6) {
      alert("Please enter complete 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      if (code === "123456") {
        setIsMobileVerified(true);

        setTimeout(() => {
          setShowMobileOtp(false);
          setTimer(0);
          setOtpValues((prev) => ({ ...prev, mobileOtp: "" }));
        }, 3000);

        alert('Mobile number verified successfully!');
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error('Verify Mobile OTP error:', err);
      alert("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const regexOfMail = /^[a-zA-Z][a-zA-Z0-9]*@(gmail|yahoo|outlook|hotmail|fabaos)\.[a-zA-Z]{2,}$/;
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^?&*]{8,}$/;
    const regexofUppercase = /^(?=.*[A-Z]).+$/;
    const regexofNumber = /^(?=.*\d).+$/;
    const regexofSpecialChar = /^(?=.*[!@#$%^&*]).+$/;
    const regexofUserName = /^[A-Za-z_][A-Za-z0-9_]{3,19}$/;
    const regexofMobile = /^[6-9]\d{9}$/;

    if (!formValues.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!regexofUserName.test(formValues.username)) {
      newErrors.username = "Start with letter, 4-20 characters, letters & numbers only";
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!regexOfMail.test(formValues.email)) {
      newErrors.email = "Email must start with a letter and valid email";
    } else if (!isEmailVerified) {
      newErrors.email = "Please verify your email via OTP";
    }

    if (!formValues.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!strongPasswordRegex.test(formValues.password)) {
      newErrors.password = "Must be 8+ chars with 1 Uppercase, 1 Lowercase, 1 Number, and 1 Special character";
    } else if (formValues.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!regexofUppercase.test(formValues.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!regexofNumber.test(formValues.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!regexofSpecialChar.test(formValues.password)) {
      newErrors.password = "Password must contain at least one special character";
    }

    if (!formValues.confirmpassword.trim()) {
      newErrors.confirmpassword = "Confirm Password is required";
    } else if (formValues.password !== formValues.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    if (!formValues.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!regexofMobile.test(formValues.phone)) {
      newErrors.phone = "Invalid mobile number format (Must starts with 6-9)";
    } else if (!isMobileVerified) {
      newErrors.phone = "Please verify your mobile number via OTP";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return false;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/register/jobseeker/', {
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        password_confirm: formValues.confirmpassword,
        phone: formValues.phone
      });

      if (response.status === 201 || response.status === 200) {
        alert("Signup successful! Please login to continue.");
        console.log("Signed up successfully", formValues);

        sessionStorage.setItem('temp_user_email', formValues.email);

        setFormValues(initialValues);
        setIsEmailVerified(false);
        setIsMobileVerified(false);

        setTimeout(() => {
          navigate("/Job-portal/jobseeker/login", {
            state: { redirectTo }
          });
        }, 2000);
      } else {
        alert("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error('Signup error:', err);

      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.email) {
          setErrors((prev) => ({
            ...prev,
            email: Array.isArray(errorData.email) ? errorData.email[0] : errorData.email
          }));
        }
        if (errorData.username) {
          setErrors((prev) => ({
            ...prev,
            username: Array.isArray(errorData.username) ? errorData.username[0] : errorData.username
          }));
        }
        if (errorData.phone) {
          setErrors((prev) => ({
            ...prev,
            phone: Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone
          }));
        }
        if (errorData.password) {
          setErrors((prev) => ({
            ...prev,
            password: Array.isArray(errorData.password) ? errorData.password[0] : errorData.password
          }));
        }
        if (errorData.message) {
          alert(errorData.message);
        }
        if (errorData.error) {
          alert(errorData.error);
        }
      } else {
        alert("Signup failed. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true)

      const response = await api.post(
        "/google-login/",
        {
          token: credentialResponse.credential,
          user_type: "jobseeker"
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      sessionStorage.setItem("access", response.data.access)
      sessionStorage.setItem("refresh", response.data.refresh)
      sessionStorage.setItem("user", JSON.stringify(response.data.user))
      sessionStorage.setItem("user_type", response.data.user.user_type)

      alert("Google Signup Successful")

      navigate("/Job-portal/jobseeker")

    } catch (error) {
      alert(error.response?.data?.error || "Google Login Failed")
    } finally {
      setIsLoading(false)
    }
  }



  const renderOtpModal = (type) => {
    const isEmail = type === 'email';
    const targetValue = isEmail ? formValues.email : formValues.phone;
    const otpKey = isEmail ? "emailOtp" : "mobileOtp";
    const isCurrentlyVerified = isEmail ? isEmailVerified : isMobileVerified;

    if (isCurrentlyVerified) {
      return (
        <div className="otp-modal-overlay">
          <div className="otp-modal-content success-popup-content">
            <div className="verified-container">
              <img
                src={Verified}
                alt="Verified Success"
                className="verified-popup-img"
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="otp-modal-overlay">
        <div className="otp-modal-content">
          <button
            className="back-arrow"
            onClick={() => {
              setTimer(0);
              setOtpValues({ ...otpValues, [otpKey]: "" });
              isEmail ? setShowEmailOtp(false) : setShowMobileOtp(false);
            }}
          >
            Back
          </button>
          <div className="otp-icon-container">
            <img
              src={isEmail ? emailIcon : mobileIcon}
              alt={isEmail ? "Email Verification" : "Mobile Verification"}
              className="otp-status-icon"
            />
          </div>
          <h3>{isEmail ? "Email Verification" : "Mobile Verification"}</h3>
          {timer > 0 ? (
            <>
              <p>We've sent a code to <strong>{targetValue}</strong>. Please enter it below.</p>

              <div className="otp-input-group">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    id={`otp-${type}-${index}`}
                    maxLength="1"
                    value={otpValues[otpKey]?.[index] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[0-9]$/.test(val) || val === "") {
                        const newOtp = (otpValues[otpKey] || "").split("");
                        newOtp[index] = val;
                        const combinedOtp = newOtp.join("");

                        setOtpValues({ ...otpValues, [otpKey]: combinedOtp });

                        if (val && index < 5) {
                          document.getElementById(`otp-${type}-${index + 1}`).focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpValues[otpKey]?.[index] && index > 0) {
                        document.getElementById(`otp-${type}-${index - 1}`).focus();
                      }
                    }}
                    autoFocus={index === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <div className="resend-timer">
                Did not receive code?{" "}
                <span
                  className="resend-link"
                  style={{ cursor: 'pointer', color: '#0081FF' }}
                  onClick={() => isEmail ? sendEmailOtp() : sendMobileOtp()}
                >
                  Resend OTP
                </span>
                {timer > 0 && <span> in {formatTime(timer)}</span>}
              </div>

              <button
                type="button"
                className="verify-final-btn"
                onClick={() => isEmail ? verifyEmailOtp() : verifyMobileOtp()}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </>
          ) : (
            <div className="expired-state">
              <p className="error-msg-otp">OTP Session Expired</p>
              <p>The verification code is no longer valid. Please request a new one.</p>
              <button
                type="button"
                className="verify-final-btn"
                onClick={() => isEmail ? sendEmailOtp() : sendMobileOtp()}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend New OTP"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="j-sign-up-page">
        {showEmailOtp && renderOtpModal('email')}
        {showMobileOtp && renderOtpModal('mobile')}

        <header className="j-sign-up-header">
          <Link to="/" className="logo">
            <span className="logo-text">Job portal</span>
            <span className="subtext">For Jobseekers</span>
          </Link>

          <div className="j-sign-up-header-links">
            <span className="no-account">Already have an account?</span>

            <Link
              to="/Job-portal/jobseeker/login"
              state={{
                redirectTo,
                fromSearch: location.state?.fromSearch || false,
                searchQuery: location.state?.searchQuery || "",
                searchLocation: location.state?.searchLocation || "",
                searchExperience: location.state?.searchExperience || ""
              }}
              className="signup-btn"
            >
              Login
            </Link>
            <Link to="/Job-portal/role-selection" className="header-back-btn">
              ← Back
            </Link>
          </div>
        </header>

        <div className="j-sign-up-body">
          <div className="signup-illustration">
            <img src={workTime} alt="Signup Illustration" />
          </div>

          <form onSubmit={handleSubmit} className="j-sign-up-form">
            <h2>Sign up for Jobseeker</h2>
            <label>User name</label>
            <input
              type="text"
              name="username"
              value={formValues.username}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[A-Za-z][A-Za-z0-9_]{0,19}$/.test(value) || value === "") {
                  handleForm(e);
                }
              }}
              placeholder="Create your Username"
              className={errors.username ? "input-error" : ""}
              disabled={isLoading}
            />
            {errors.username && <span className="error-msg">{errors.username}</span>}

            <label>Email ID</label>
            <div className="input-container">
              <input
                type="text"
                name="email"
                value={formValues.email}
                onChange={handleForm}
                placeholder="Enter Email"
                className={errors.email ? "input-error" : ""}
                disabled={isEmailVerified || isLoading}
              />
              {!isEmailVerified && formValues.email.length > 0 && (
                <button
                  type="button"
                  className="jsignup-small-verify-btn"
                  disabled={isLoading}
                  onClick={() => {
                    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@(gmail|yahoo|outlook|hotmail|fabaos)\.com$/;

                    if (!formValues.email.trim()) {
                      setErrors({
                        ...errors,
                        email: "Email is required"
                      });
                      return;
                    }

                    if (!emailRegex.test(formValues.email)) {
                      setErrors({
                        ...errors,
                        email: "Enter valid email (gmail, yahoo, outlook, hotmail)"
                      });
                      return;
                    }

                    setErrors({
                      ...errors,
                      email: ""
                    });

                    sendEmailOtp("email");
                  }}
                >
                  Verify
                </button>
              )}
              {isEmailVerified && <span className="verified-badge"> Verified</span>}
            </div>
            {errors.email && <span className="error-msg">{errors.email}</span>}

            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={passwordShow ? "password" : "text"}
                name="password"
                value={formValues.password}
                onChange={handleForm}
                placeholder="Create a new password"
                className={errors.password ? "input-error" : ""}
                disabled={isLoading}
              />
              <span className="eye-icon" onClick={togglePasswordView}>
                <img src={passwordShow ? eyeHide : eye} className='show-icon' alt='show' />
              </span>
            </div>
            {errors.password && <span className="error-msg">{errors.password}</span>}

            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={confirmPasswordShow ? "password" : "text"}
                name="confirmpassword"
                value={formValues.confirmpassword}
                onChange={handleForm}
                placeholder="Confirm password"
                className={errors.confirmpassword ? "input-error" : ""}
                disabled={isLoading}
              />
              <span className="eye-icon" onClick={toggleConfirmPasswordView}>
                <img src={confirmPasswordShow ? eyeHide : eye} className='show-icon' alt='show' />
              </span>
            </div>
            {errors.confirmpassword && <span className="error-msg">{errors.confirmpassword}</span>}

            <label>Mobile number</label>
            <div className="input-container">
              <input
                type="tel"
                name="phone"
                value={formValues.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormValues({ ...formValues, phone: value.slice(0, 10) });
                  setErrors({ ...errors, phone: "" });
                }}
                placeholder="Enter mobile number"
                className={errors.phone ? "input-error" : ""}
                disabled={isMobileVerified || isLoading}
              />
              {!isMobileVerified && /^[6-9]\d{9}$/.test(formValues.phone) && (
                <button
                  type="button"
                  className="jsignup-small-verify-btn"
                  disabled={isLoading}
                  onClick={() => {
                    const phoneRegex = /^[6-9]\d{9}$/;

                    if (!formValues.phone.trim()) {
                      setErrors((prev) => ({
                        ...prev,
                        phone: "Mobile number is required"
                      }));
                      return;
                    }

                    if (!phoneRegex.test(formValues.phone)) {
                      setErrors((prev) => ({
                        ...prev,
                        phone: "Enter valid 10-digit mobile number"
                      }));
                      return;
                    }

                    setErrors((prev) => ({ ...prev, phone: "" }));

                    sendMobileOtp();
                  }}
                >
                  Verify
                </button>
              )}
              {isMobileVerified && <span className="verified-badge">Verified</span>}
            </div>
            {errors.phone && <span className="error-msg">{errors.phone}</span>}

            <button type="submit" className="j-sign-up-submit" disabled={isLoading}>
              {isLoading ? "Signing up..." : "Signup"}
            </button>

            <div className="divider">Or Continue with</div>

            <div className="google-btn">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google Login Failed")}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
