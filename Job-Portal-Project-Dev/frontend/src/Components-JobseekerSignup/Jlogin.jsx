import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import manSitting from '../assets/Illustration_1.png';
import eye from '../assets/show_password.png';
import eyeHide from '../assets/eye-hide.png';
import Email from '../assets/icon_email_id.png';
import Google from '../assets/GOOG.png';
import mobile from '../assets/icon_mobile_otp.png';
import './Jlogin.css';
import api from '../api/axios';
import { useJobs } from '../JobContext';

export const Jlogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchAllJobs } = useJobs();

  const redirectTo = location.state?.redirectTo || "/Job-portal/jobseeker/";

  const [view, setView] = useState('default');
  const [passwordShow, setPasswordShow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const initialValues = {
    username: "",
    password: "",
    phone: "",
    email: ""
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev);
  };

  useEffect(() => {
    const savedUsername = sessionStorage.getItem("rememberedUsername");
    const savedPassword = sessionStorage.getItem("rememberedPassword");

    if (savedUsername && savedPassword) {
      setFormValues((prev) => ({
        ...prev,
        username: savedUsername,
        password: savedPassword
      }));
      setRememberMe(true);
    } else if (savedUsername) {
      setFormValues((prev) => ({
        ...prev,
        username: savedUsername
      }));
      setRememberMe(true);
    }
  }, []);

  const handleForm = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) {
        setFormValues({ ...formValues, [name]: onlyNums });
        setErrors({ ...errors, [name]: "" });
      }
      return;
    }

    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.username.trim()) {
      newErrors.username = "Username or Email is required";
    }

    if (!formValues.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendEmailOTP = async () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formValues.username.trim()) {
      newErrors.username = "Email ID is required";
    } else if (!emailRegex.test(formValues.username)) {
      newErrors.username = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      console.log('Sending OTP to email:', formValues.username);

      const response = await api.post('send-login-otp/', {
        email: formValues.username,
        purpose: 'login',
        user_type: 'jobseeker'
      });

      console.log('OTP Response:', response.data);
      setOtpData(response.data);
      setOtpSent(true);
      alert(`OTP sent to ${formValues.username}. Please check your email.`);

      navigate('/Job-portal/login/otpverification', {
        state: {
          email: formValues.username,
          purpose: 'login',
          otpId: response.data.otp_id,
          otpToken: response.data.token,
          redirectTo,
          fromSearch: location.state?.fromSearch || false,
          searchQuery: location.state?.searchQuery || "",
          searchLocation: location.state?.searchLocation || "",
          searchExperience: location.state?.searchExperience || ""
        }
      });
    } catch (error) {
      console.error('Error sending OTP:', error);

      if (error.response) {
        if (error.response.status === 400) {
          const errorData = error.response.data;

          if (errorData.email) {
            setErrors({
              username: Array.isArray(errorData.email)
                ? errorData.email[0]
                : errorData.email
            });
          } else if (errorData.detail) {
            setErrors({ username: errorData.detail });
          } else if (errorData.error) {
            setErrors({ username: errorData.error });
          } else {
            setErrors({ username: "Invalid email address" });
          }
        } else if (error.response.status === 404) {
          setErrors({ username: "Email not registered. Please sign up first." });
        } else if (error.response.status === 429) {
          setErrors({ username: "Too many attempts. Please try again later." });
        } else {
          setErrors({
            username: error.response.data?.error || "Failed to send OTP"
          });
        }
      } else {
        setErrors({ username: "Network error. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMobileOTP = () => {
    const newErrors = {};
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!formValues.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (!mobileRegex.test(formValues.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert(`Mock OTP sent to ${formValues.phone}. For demo, use OTP: 123456`);
      navigate('/Job-portal/login/otpverification', {
        state: {
          phone: formValues.phone,
          purpose: 'login_mobile',
          isMock: true,
          redirectTo,
          fromSearch: location.state?.fromSearch || false,
          searchQuery: location.state?.searchQuery || "",
          searchLocation: location.state?.searchLocation || "",
          searchExperience: location.state?.searchExperience || ""
        }
      });

      setLoading(false);
    }, 1000);
  };

  const handleGetOtp = () => {
    if (view === 'email-otp') {
      handleSendEmailOTP();
    } else if (view === 'mobile-otp') {
      handleSendMobileOTP();
    }
  };

  const getRedirectAfterLogin = () => {
    if (location.state?.fromSearch) {
      return {
        type: "search",
        data: {
          query: location.state?.searchQuery || "",
          location: location.state?.searchLocation || "",
          experience: location.state?.searchExperience || ""
        }
      };
    }

    sessionStorage.removeItem("pendingSearch");
    sessionStorage.removeItem("savedSearch");

    return {
      type: "redirect",
      path: redirectTo
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const isEmail = formValues.username.includes('@');

      const loginData = isEmail
        ? { email: formValues.username, password: formValues.password }
        : { username: formValues.username, password: formValues.password };

      const response = await api.post('login/', loginData);

      if (response.data.user.user_type !== 'jobseeker') {
        setErrors({ general: "Only jobseeker credentials should be used here" });
        setLoading(false);
        return;
      }
      if (response.data.access && response.data.refresh) {
        sessionStorage.setItem('access', response.data.access);
        sessionStorage.setItem('refresh', response.data.refresh);
        sessionStorage.setItem('user_type', 'jobseeker');

        if (response.data.user) {
          sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
          sessionStorage.setItem('user_id', response.data.user.id);
        }

        sessionStorage.setItem("userRole", "jobseeker");

        if (rememberMe) {
          sessionStorage.setItem("rememberedUsername", formValues.username);
          sessionStorage.setItem("rememberedPassword", formValues.password);
        } else {
          sessionStorage.removeItem("rememberedUsername");
          sessionStorage.removeItem("rememberedPassword");
        }

        await fetchAllJobs();

        const nextStep = getRedirectAfterLogin();

        if (nextStep.type === "search") {
          sessionStorage.removeItem('pendingSearch');
          sessionStorage.removeItem('savedSearch');

          navigate('/Job-portal/jobseeker/searchresults', {
            replace: true,
            state: {
              query: nextStep.data.query,
              location: nextStep.data.location,
              experience: nextStep.data.experience
            }
          });
        } else {
          navigate(location.state?.intendedPath || nextStep.path, {
            replace: true,
            state: {
              targetTab: location.state?.targetTab || "Profile"
            }
          });
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Login Error:', error);

      if (error.response) {
        console.error('📡 Backend response:', error.response.status, error.response.data);

        if (error.response.status === 400 || error.response.status === 401) {
          const errorData = error.response.data;

          const getErrorMessage = (errorField) => {
            if (!errorField) return null;
            if (Array.isArray(errorField)) return errorField[0];
            return errorField;
          };

          if (errorData.detail) {
            const errorMessage = getErrorMessage(errorData.detail);

            console.log('📝 Error message:', errorMessage);

            if (errorMessage && typeof errorMessage === 'string') {
              const lowerMsg = errorMessage.toLowerCase();

              if (lowerMsg.includes('password') || lowerMsg.includes('incorrect')) {
                setErrors({ password: errorMessage });
              } else if (
                lowerMsg.includes('account') ||
                lowerMsg.includes('found') ||
                lowerMsg.includes('email') ||
                lowerMsg.includes('username')
              ) {
                setErrors({ username: errorMessage });
              } else {
                setErrors({ password: errorMessage });
              }
            } else {
              setErrors({ password: "Invalid username/email or password" });
            }
          }
          // Handle field-specific errors
          else if (errorData.email) {
            const errorMessage = getErrorMessage(errorData.email);
            setErrors({ username: errorMessage });
          }
          else if (errorData.username) {
            const errorMessage = getErrorMessage(errorData.username);
            setErrors({ username: errorMessage });
          }
          else if (errorData.password) {
            const errorMessage = getErrorMessage(errorData.password);
            setErrors({ password: errorMessage });
          }
          else if (errorData.non_field_errors) {
            const errorMessage = getErrorMessage(errorData.non_field_errors);
            setErrors({ password: errorMessage });
          }
          else {
            setErrors({ password: "Invalid username/email or password" });
          }
        } else {
          setErrors({ password: error.response.data?.error || "Login failed. Please try again." });
        }
      } else if (error.request) {
        console.error('🌐 No response from server');
        setErrors({ password: "No response from server. Please check your connection." });
      } else {
        console.error('❌ Error:', error.message);
        setErrors({ password: "Login failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="logo">
          <span className="logo-text">Job portal</span>
          <span className="subtext">For Jobseekers</span>
        </Link>

        <div className="login-header-actions">
          <span className="no-account">Don't have an account?</span>

          <Link
            to="/Job-portal/jobseeker/signup"
            state={{
              redirectTo,
              fromSearch: location.state?.fromSearch || false,
              searchQuery: location.state?.searchQuery || "",
              searchLocation: location.state?.searchLocation || "",
              searchExperience: location.state?.searchExperience || ""
            }}
            className="signup-btn"
          >
            Sign up
          </Link>

          <Link to="/Job-portal/role-selection" className="login-header-back-btn">
            ← Back
          </Link>
        </div>
      </header>

      <div className="login-body">
        <div className="login-illustration">
          <img src={manSitting} alt="Login Illustration" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {view !== 'default' && (
            <button
              type="button"
              className="back-to-login"
              onClick={() => {
                setView('default');
                setErrors({});
                setOtpSent(false);
                setFormValues((prev) => ({
                  ...prev,
                  username: '',
                  phone: ''
                }));
              }}
            >
              ← Back
            </button>
          )}

          <h2>Login to continue</h2>

          {errors.general && (
            <span className="error-msg" style={{ color: 'red', marginBottom: '10px', display: 'block' }}>
              {errors.general}
            </span>
          )}


          {/* VIEW 1: DEFAULT USERNAME & PASSWORD */}
          {view === 'default' && (
            <>
              <label>Username / Email</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username or email"
                value={formValues.username}
                onChange={handleForm}
                className={errors.username ? "input-error" : ""}
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && <span className="error-msg">{errors.username}</span>}

              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={passwordShow ? "password" : "text"}
                  placeholder="Enter your password"
                  name="password"
                  value={formValues.password}
                  onChange={handleForm}
                  className={errors.password ? "input-error" : ""}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <span className="eye-icon" onClick={togglePasswordView}>
                  <img
                    src={passwordShow ? eyeHide : eye}
                    className="show-icon"
                    alt="show"
                  />
                </span>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}

              <div className="form-options">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  Remember me
                </label>

                <Link
                  to="/Job-portal/jobseeker/login/forgotpassword"
                  className="forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="j-login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="divider">Or Continue with</div>

              <button
                type="button"
                className="google-btn-outline"
                onClick={() => setView('email-otp')}
                disabled={loading}
              >
                <img src={Email} alt="Email" /> Email ID
              </button>

              <div className="divider"> Or </div>

              <button
                type="button"
                className="mobile-btn-outline"
                onClick={() => setView('mobile-otp')}
                disabled={loading}
              >
                <img src={mobile} alt="mobile" /> Mobile number
              </button>
            </>
          )}

          {view === 'email-otp' && (
            <>
              <label>Email ID</label>
              <input
                type="email"
                name="username"
                placeholder="johnsmith@gmail.com"
                value={formValues.username}
                onChange={handleForm}
                className={errors.username ? "input-error" : ""}
                disabled={loading}
                autoComplete="email"
              />
              {errors.username && <span className="error-msg">{errors.username}</span>}

              <button
                type="button"
                className="j-login-btn"
                onClick={handleGetOtp}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>

              <div className="divider">Or Continue with</div>

              <button
                type="button"
                className="mobile-btn-outline"
                onClick={() => setView('mobile-otp')}
                disabled={loading}
              >
                <img src={mobile} alt="mobile" /> Phone number
              </button>
            </>
          )}

          {view === 'mobile-otp' && (
            <>
              <label>Mobile number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your Mobile number"
                value={formValues.phone}
                onChange={handleForm}
                inputMode="numeric"
                maxLength="10"
                className={errors.phone ? "input-error" : ""}
                disabled={loading}
                autoComplete="tel"
              />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}

              <button
                type="button"
                className="j-login-btn"
                onClick={handleGetOtp}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>

              <div className="divider">Or Continue with</div>

              <button
                type="button"
                className="google-btn-outline"
                onClick={() => setView('email-otp')}
                disabled={loading}
              >
                <img src={Email} alt="Email" /> Email ID
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};