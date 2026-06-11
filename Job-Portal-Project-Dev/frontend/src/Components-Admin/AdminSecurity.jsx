import React, { useEffect, useState } from "react";
import "./AdminSecurity.css";
import Tablet from '../assets/AdminAssets/Tablet.png';
import Mobile from '../assets/AdminAssets/Mobile.png';
import PC from '../assets/AdminAssets/PC.png';
import Logout from '../assets/AdminAssets/Logout.png';
import Mfa from '../assets/AdminAssets/MFA.png';
import AuthenticatorApp from '../assets/AdminAssets/Authenticator.png';
import Sms from '../assets/AdminAssets/Sms.png';
import VerifyTick from '../assets/AdminAssets/Verified.png';
import PasswordKey from '../assets/AdminAssets/PasswordKey.png';
import AdminAccess from '../assets/AdminAssets/AdminAccess.png';
import UpArrow from '../assets/UpArrow.png';
import showPassword from '../assets/show_password.png';
import hidePassword from '../assets/eye-hide.png';
import api from '../api/axios'
 
export const AdminSecurity = () => {
  const [status, setStatus] = useState('input');
  const [isPasswordChange, setisPasswordChange] = useState(false);
  const [errors, setErrors] = useState({})
  const [is2FAOpen, setis2FAOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isadminopen, setisAdminopen] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isVerified, setIsVerified] = useState({ sms: false, email: false });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState([]);
 
  const handleVerifyClick = (method) => {
    setSelectedMethod(method);
    setStatus('input');
    setShowModal(true);
    sendOTP(method);
  };
 
  const fetchAccessLogs = async () => {
  try {
    const response = await api.get('admin-access-log/');
    console.log("Logs response:", response.data);
   
    if (response?.data?.success && response?.data?.results) {
     
      const formattedLogs = response.data.results.map(log => ({
        date: new Date(log.timestamp).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).toUpperCase(),
        action: log.action.replace(/_/g, ' '),
        location: log.location || 'Unknown',
        ip: log.ip_address || 'Unknown',
        status: log.status
      }));
      setLogs(formattedLogs);
    }
  } catch (error) {
    console.error("Failed to fetch access logs:", error);
  }
};
 
 
 
 
const fetchTrustedDevices = async () => {
  try {
    const response = await api.get('admin-trusted-devices/');
    console.log("Trusted devices response:", response.data);
   
    if (response?.data?.success && response?.data?.results) {
      const formattedDevices = response.data.results.map(device => ({
        id: device.id.toString(),
        name: device.device_name,
        platform: device.platform,
        last_used: device.last_used_at
      }));
      setTrustedDevices(formattedDevices);
    }
  } catch (error) {
    console.error("Failed to fetch trusted devices:", error);
  }
};
 
  const handleOtpSubmit = async () => {
    try {
      setIs2FALoading(true);
      const response = await api.post('admin/2fa/verify-otp/', {
        otp: otpInput,
        method: selectedMethod
      })
 
      if (response?.data?.success) {
        // After successful OTP verification, update states
        setIsVerified({ ...isVerified, [selectedMethod.toLowerCase()]: true });
       
        // Fetch the updated status from backend
        await fetch2FAstatus();
       
        setStatus('success');
        setOtpInput('');
       
        // Add success log
        addAccessLog("Two-Factor Authentication", "ENABLED");
       
        setTimeout(() => {
          setShowModal(false);
          setStatus('input');
        }, 2000);
      } else {
        setStatus('error');
        setApiError(response?.data?.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setStatus('error');
      setApiError(error?.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIs2FALoading(false);
    }
  };
 
  const [logs, setLogs] = useState([
    { date: 'OCT 24, 14:20', action: 'LOGIN', location: 'INDIA, Chennai', ip: '192.168.1.1', status: 'SUCCESS' },
    { date: 'OCT 24, 10:05', action: '2FA ENABLED', location: 'INDIA, Coimbatore', ip: '192.168.1.1', status: 'SUCCESS' },
    { date: 'OCT 23, 23:45', action: 'PASSWORD CHANGE', location: 'INDIA, Chennai', ip: '192.168.1.1', status: 'FAILED' },
    { date: 'OCT 23, 23:45', action: 'PASSWORD CHANGE', location: 'INDIA, Salem', ip: '192.168.1.1', status: 'SUCCESS' },
    { date: 'OCT 23, 23:45', action: 'PASSWORD CHANGE', location: 'INDIA, Thirunelveli', ip: '192.168.1.1', status: 'FAILED' },
  ]);
 
  const addAccessLog = (action, status) => {
    const newLog = {
      date: new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }),
      action: action,
      location: "India, Chennai",
      ip: "106.200.x.x",
      status: status
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  };
 
  useEffect(() => {
    fetch2FAstatus();
    fetchAccessLogs();  
    fetchTrustedDevices();
  }, []);
 
  const fetch2FAstatus = async () => {
    try {
      const response = await api.get('admin/2fa/status/')
      if (response?.data) {
        const responseData = response?.data
        setIs2FAEnabled(responseData?.two_factor_enabled || false)
        setIsVerified({
          email: responseData?.email_verified || false,
          sms: responseData?.sms_verified || false
        })
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error?.response?.data || error.message)
    }
  }
 
  const sendOTP = async (method) => {
    try {
      setIs2FALoading(true);
      const response = await api.post("admin/2fa/send-otp/", {
        method: method
      })
      if (response?.data?.success) {
        console.log("OTP sent successfully");
      } else {
        setApiError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Failed to send OTP:", error?.response?.data || error.message)
      setApiError(error?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIs2FALoading(false);
    }
  }
 
  // Disable 2FA directly without verification
  const disable2FA = async () => {
    try {
      setIs2FALoading(true);
      const response = await api.patch("admin/2fa/disable/")
     
      if (response?.data?.success) {
        // Update local state based on API response
        setIs2FAEnabled(false);
        // Reset verification status when disabling 2FA
        setIsVerified({ sms: false, email: false });
        addAccessLog("Two-Factor Authentication", "DISABLED");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to disable 2FA:", error?.response?.data || error.message);
      addAccessLog("Two-Factor Authentication", "FAILED");
     
      const errorMessage = error?.response?.data?.message || "Failed to disable 2FA. Please try again.";
      setApiError(errorMessage);
      alert(errorMessage);
      return false;
    } finally {
      setIs2FALoading(false);
    }
  }
 
  // Handle 2FA toggle based on current state
  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      // Disable 2FA directly - no verification needed
      const confirmed = window.confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.");
      if (confirmed) {
        await disable2FA();
      }
    } else {
      // When 2FA is disabled, show a message that they need to verify first
      alert("Please verify your email or SMS to enable Two-Factor Authentication.");
      setis2FAOpen(true);
      // Scroll to 2FA section
      document.querySelector('.Ad-2fa-content-wrapper')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
 
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    expirationInterval: '30 Days'
  });
 
const handleRevoke = async (id) => {
  const isConfirm = window.confirm("Are you sure to remove this device from trusted devices?");
  if (isConfirm) {
    try {
      await api.delete(`admin-trusted-devices/${id}/`);
      setTrustedDevices(prev => prev.filter(device => device.id !== id));
      addAccessLog("DEVICE_REVOKED", "SUCCESS");
      alert("Device revoked successfully");
    } catch (error) {
      console.error("Failed to revoke device:", error);
      addAccessLog("DEVICE_REVOKED", "FAILED");
      alert(error?.response?.data?.message || "Failed to revoke device. Please try again.");
    }
  }
};
  const handleCancel = () => {
    setShowModal(false);
    setOtpInput('');
    setStatus('input');
    setApiError('');
  }
 
  const togglePasswordChange = () => {
    setisPasswordChange(!isPasswordChange);
    if (isPasswordChange) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        expirationInterval: '30 Days'
      });
      setErrors({});
      setApiError('');
    }
  };
 
  const toggle2FA = () => {
    setis2FAOpen(!is2FAOpen);
    if (!is2FAOpen) {
      setApiError('');
    }
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError('');
  };
 
  const handleIntervalChange = (value) => {
    setFormData((prev) => ({ ...prev, expirationInterval: value }));
  };
 
  const validateForm = () => {
    const newErrors = {};
    const regexofUppercase = /[A-Z]/;
    const regexofNumber = /[0-9]/;
    const regexofSpecialChar = /[!@#$%^&*]/;
    const regexofLowercase = /[a-z]/;
 
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }
 
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!regexofUppercase.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter";
    } else if (!regexofLowercase.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one lowercase letter";
    } else if (!regexofNumber.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    } else if (!regexofSpecialChar.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one special character";
    }
 
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
 
    if (!validateForm()) {
      addAccessLog("Password Change", "FAILED");
      return;
    }
 
    setIsLoading(true);
 
    try {
      const passwordData = {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
        expiration_interval: formData.expirationInterval
      };
 
      const response = await api.patch('admin-change-password/', passwordData);
 
      if (response.data.success) {
        addAccessLog("Password Change", "SUCCESS");
        alert(response.data.message || "Password updated successfully!");
 
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          expirationInterval: '30 Days'
        });
 
        togglePasswordChange();
 
        if (response.data.expiration_interval) {
          console.log(`Password will expire in: ${response.data.expiration_interval}`);
        }
        if (response.data.password_changed_at) {
          console.log(`Password changed at: ${response.data.password_changed_at}`);
        }
       
      } else {
        addAccessLog("Password Change", "FAILED");
        setApiError(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password change error:", error);
 
      if (error.response) {
        const responseData = error.response.data;
 
        if (responseData.errors) {
          const mappedErrors = {};
          Object.keys(responseData.errors).forEach(key => {
            if (key === 'current_password') {
              mappedErrors.currentPassword = responseData.errors[key][0];
            } else if (key === 'new_password') {
              mappedErrors.newPassword = responseData.errors[key][0];
            } else if (key === 'confirm_password') {
              mappedErrors.confirmPassword = responseData.errors[key][0];
            } else {
              mappedErrors[key] = responseData.errors[key][0];
            }
          });
          setErrors(mappedErrors);
        } else if (responseData.message) {
          setApiError(responseData.message);
        } else {
          setApiError("Failed to update password. Please try again.");
        }
      } else if (error.request) {
        setApiError("Network error. Please check your connection.");
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
 
      addAccessLog("Password Change", "FAILED");
    } finally {
      setIsLoading(false);
    }
  };
 
  const handlePwdCancel = () => {
    addAccessLog("Password Change", "Cancelled");
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      expirationInterval: '30 Days'
    });
    setErrors({});
    setApiError('');
    togglePasswordChange();
  };
 
  const getStrength = (password) => {
    let points = 0;
    if (!password) return { width: '0%', color: '#ddd', label: '' };
 
    if (password.length > 5) points++;
    if (password.length > 8) points++;
    if (/[A-Z]/.test(password)) points++;
    if (/[0-9]/.test(password)) points++;
    if (/[^A-Za-z0-9]/.test(password)) points++;
 
    if (points <= 2) return { width: '33%', color: '#ff4d4d', label: 'Weak' };
    if (points <= 4) return { width: '66%', color: '#cc9b07', label: 'Medium' };
    return { width: '100%', color: '#2563eb', label: 'Strong' };
  };
 
  const strength = getStrength(formData.newPassword);
 
  return (
    <div style={{ border: "1px solid #d1d5db", margin: "25px 0px", borderRadius: "10px" }}>
      {/* Password Change Section */}
      <div className="Ad-security-container">
        <div className="Ad-security-header">
          <div className="Ad-security-title-box">
            <img src={PasswordKey} width={35} alt="" />
            <span className="Ad-security-title">Change Password</span>
          </div>
          <img
            src={UpArrow}
            alt=""
            width={10}
            className={isPasswordChange ? 'Ad-security-up' : 'Ad-security-down'}
            onClick={togglePasswordChange}
          />
        </div>
        {isPasswordChange && (
          <form className="Ad-security-form" onSubmit={handleSubmit}>
            {apiError && (
              <div className="api-error-message" style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '14px',
                borderLeft: '4px solid #c62828'
              }}>
                {apiError}
              </div>
            )}
 
            <div className="Ad-security-input-group">
              <label>Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  placeholder="Enter Your Current Password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="admin-eye-icon" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <img src={hidePassword} width={20} alt="hide-password" /> : <img src={showPassword} width={20} alt="show-password" />}
                </span>
              </div>
              {errors.currentPassword && <span className="error-msg">{errors.currentPassword}</span>}
            </div>
 
            <div className="Ad-security-input-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter New Password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="admin-eye-icon" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <img src={hidePassword} width={20} alt="hide-password" /> : <img src={showPassword} width={20} alt="show-password" />}
                </span>
              </div>
              {errors.newPassword && <span className="error-msg">{errors.newPassword}</span>}
              {formData.newPassword.length > 0 && (
                <div className="Ad-security-strength-wrapper">
                  <div className="Ad-security-progress-bg">
                    <div
                      className="Ad-security-progress-fill"
                      style={{
                        width: strength.width,
                        backgroundColor: strength.color
                      }}
                    ></div>
                  </div>
                  <span className="strength-Text" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>
 
            <div className="Ad-security-input-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="admin-eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <img src={hidePassword} width={20} alt="hide-password" /> : <img src={showPassword} width={20} alt="show-password" />}
                </span>
              </div>
              {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
            </div>
 
            <div className="Ad-security-expiration-section">
              <label className="Ad-security-label-caps">EXPIRATION INTERVAL</label>
              <div className="Ad-security-interval-options">
                {['30 Days', '60 Days', '90 Days'].map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    className={`Ad-security-interval-btn ${formData.expirationInterval === interval ? 'Ad-security-active' : ''}`}
                    onClick={() => handleIntervalChange(interval)}
                    disabled={isLoading}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>
 
            <div className="Ad-security-actions">
              <button
                type="submit"
                className="Ad-security-update-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={handlePwdCancel}
                className="Ad-security-cancel-btn"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
 
      {/* 2FA Section */}
      <div className="Ad-security-container">
        <div className="Ad-security-header">
          <div className="Ad-security-title-box">
            <img src={Mfa} width={35} alt="" />
            <span className="Ad-security-title">Two-Factor Authentication</span>
          </div>
          <img
            src={UpArrow}
            alt=""
            width={10}
            onClick={toggle2FA}
            className={is2FAOpen ? 'Ad-security-up' : 'Ad-security-down'}
          />
        </div>
 
        {is2FAOpen && (
          <div className="Ad-2fa-content-wrapper">
            <p className="Ad-2fa-desc">
              Enhance your account security by requiring a verification code from your mobile device in addition to your password.
            </p>
 
            <div className="Ad-2fa-card-white">
              <div className="Ad-2fa-card-info">
                <span style={{ fontWeight: "600" }}>Enable 2FA</span>
                <span className="Ad-security-light-text">Use an authenticator app (like Google Authenticator)</span>
              </div>
              <label className="Adm-Not-switch">
                <input
                  type="checkbox"
                  checked={is2FAEnabled}
                  onChange={handle2FAToggle}
                  disabled={is2FALoading}
                />
                <span className="Adm-Not-slider"></span>
              </label>
            </div>
 
            {/* Always show verification methods with tick marks when verified */}
            <div className="Ad-2fa-methods">
              <div className="Ad-2fa-method-box active">
                <div className="Ad-security-icon-bg blue">
                  <img src={Sms} width={50} alt="SMS" />
                </div>
                <div className="Ad-2fa-method-info">
                  <span style={{ margin: "5px 5px", color: "#000", fontWeight: "600" }}>SMS Verification</span>
                  <span style={{ margin: "5px 5px" }}>+91 98765-44921</span>
                </div>
                {isVerified.sms ? (
                  <img src={VerifyTick} width={20} alt="Verified" />
                ) : (
                  <button
                    className="verify-btn"
                    onClick={() => handleVerifyClick('sms')}
                    disabled={is2FALoading}
                  >
                    {is2FALoading && selectedMethod === 'sms' ? 'Sending...' : 'Verify'}
                  </button>
                )}
              </div>
 
              <div className="Ad-2fa-method-box active">
                <div className="Ad-security-icon-bg light-blue">
                  <img src={AuthenticatorApp} width={50} alt="Email" />
                </div>
                <div className="Ad-2fa-method-info">
                  <span style={{ margin: "5px 5px", color: "#000", fontWeight: "600" }}>Mail Verification</span>
                  <span style={{ margin: "5px 5px", display: "flex" }}>verify@gmail.com</span>
                </div>
                {isVerified.email ? (
                  <img src={VerifyTick} width={20} alt="Verified" />
                ) : (
                  <button
                    className="verify-btn"
                    onClick={() => handleVerifyClick('email')}
                    disabled={is2FALoading}
                  >
                    {is2FALoading && selectedMethod === 'email' ? 'Sending...' : 'Verify'}
                  </button>
                )}
              </div>
            </div>
 
            {showModal && (
              <div className="otp-modal-overlay">
                <div className="otp-modal-content">
                  {status === 'success' ? (
                    <div className="status-view success">
                      <img src={VerifyTick} width={30} alt="Success" />
                      <h2 style={{ color: '#28a745' }}>Verified!</h2>
                      <p>{selectedMethod} verification completed successfully.</p>
                      <button className="Otp-Submit-Btn" onClick={handleCancel}>Close</button>
                    </div>
                  ) : (
                    <>
                      <h2>Verify Your {selectedMethod === 'sms' ? 'mobile number' : 'email address'}</h2>
                      <p style={{ color: '#28a745', fontWeight: '500', backgroundColor: '#e6f4ea', padding: '10px', borderRadius: '5px' }}>
                        OTP has been sent to your registered {selectedMethod === 'sms' ? 'mobile number' : 'e-mail address'}.
                      </p>
                      <input
                        type="text"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        disabled={is2FALoading}
                      />
                      {status === 'error' && (
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '10px' }}>
                          {apiError || "Incorrect OTP. Please try again."}
                        </p>
                      )}
                      <div className="Otp-modal-actions">
                        <button
                          className="Otp-Submit-Btn"
                          onClick={handleOtpSubmit}
                          disabled={is2FALoading || !otpInput}
                        >
                          {is2FALoading ? 'Verifying...' : 'Submit'}
                        </button>
                        <button className="Otp-cancel-Btn" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
 
      {/* Admin Access Logs Section */}
      <div className="Ad-security-container">
        <div className="Ad-security-header">
          <div className="Ad-security-title-box">
            <img src={AdminAccess} width={35} alt="" />
            <span className="Ad-security-title">Admin Access Logs</span>
          </div>
          <div>
            <img
              src={UpArrow}
              alt=""
              width={10}
              className={`Ad-Acc-arrow ${isadminopen ? 'Ad-security-up' : 'Ad-security-down'}`}
              onClick={() => setisAdminopen(!isadminopen)}
            />
          </div>
        </div>
 
        {isadminopen && (
          <div className="Ad-Acc-content-wrapper">
            <div className="Ad-Acc-table-header">
              <span className="Ad-security-title">DATE & TIME</span>
              <span className="Ad-security-title">ACTION</span>
              <span className="Ad-security-title">LOCATION</span>
              <span className="Ad-security-title">STATUS</span>
            </div>
 
            <div className="Ad-Acc-logs-list">
              {logs.map((log, index) => (
                <div key={index} className="Ad-Acc-log-row">
                  <div style={{ color: "#504f4f", fontWeight: "600", fontSize: "12px" }} className="Ad-Acc-col">{log.date}</div>
                  <div style={{ color: "#504f4f", fontWeight: "600", fontSize: "12px" }} className="Ad-Acc-col">{log.action}</div>
                  <div style={{ color: "#504f4f", fontWeight: "600", fontSize: "12px" }} className="Ad-Acc-col">
                    <div>{log.location}</div>
                    <div style={{ marginTop: "3px", color: "#5f14ff" }} className="Ad-Acc-ip">(IP:{log.ip})</div>
                  </div>
                  <div className="Ad-Acc-col">
                    <span className={`Ad-Acc-status ${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="Ad-Acc-trusted-section">
              <h4 className="Ad-Acc-sub-title">TRUSTED DEVICES</h4>
              {trustedDevices.map((device, index) => (
                <div key={index} className="Ad-Acc-device-row">
                  <span style={{ color: "#504f4f", fontWeight: "600", fontSize: "14px" }}>{device.name}</span>
                  <button onClick={() => { handleRevoke(device.id) }} className="Ad-Acc-revoke-btn">REVOKE</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 