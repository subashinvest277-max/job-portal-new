import React, { useState } from "react";
import "./AdminSecuritySettings.css";
import Tablet from '../assets/AdminAssets/Tablet.png';
import Mobile from '../assets/AdminAssets/Mobile.png';
import PC from '../assets/AdminAssets/PC.png';
import Logout from '../assets/AdminAssets/Logout.png';
import Mfa from '../assets/AdminAssets/MFA.png';
import AuthenticatorApp from '../assets/AdminAssets/Authenticator.png';
import Sms from '../assets/AdminAssets/Sms.png';
import VerifyTick from '../assets/AdminAssets/Verified.png';
import PasswordKey from '../assets/AdminAssets/PasswordKey.png';

export const AdminSecuritySettings = () => {
    const [showModal, setShowModal] = useState(false);
    const [passLength, setPassLength] = useState(14);
    const [expiry, setExpiry] = useState("90 Days");
    const [toggles, setToggles] = useState({ special: true, mixed: true });
    const [logoutModal, setLogoutModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');

    const [sessionData, setSessionData] = useState([
        { id: 1, device: "MacBook Pro (Chrome)", type: "CURRENT SESSION", ip: "192.168.1.104", loc: "San Francisco, USA", time: "Active Now", icon: PC, current: true },
        { id: 2, device: "iPhone 15 Pro (App)", type: "MOBILE NATIVE", ip: "172.24.55.12", loc: "London, UK", time: "22 mins ago", icon: Mobile, current: false },
        { id: 3, device: "Dell XPS (Edge)", type: "WORKSTATION", ip: "10.8.8.45", loc: "Berlin, DE", time: "4 hours ago", icon: Tablet, current: false }
    ]);

    const [trustedDevices,setTrustedDevices] =useState ([
    { id: 1, name: "Admin iPad Pro 12.9\"" },
    { id: 2, name: "Sec-Ops Workstation 04" }
    ]);

    const mfaMethods = [
        { id: 'auth', title: "Authenticator Apps", sub: "TOTP (Google, Authy)", icon: AuthenticatorApp, action: "SETUP", verified: false },
        { id: 'sms', title: "SMS Verification", sub: "+1 (***) ***-4921", icon: Sms, action: null, verified: false }
    ];

    const handleRevoke =(id)=>{
        const isConfirm = window.confirm("Are you sure to remove this Device from trustedDevices?") 
        if(isConfirm){
        setTrustedDevices(prev=>prev.filter(device=>device.id !== id))}
    }

    const handleActionClick = (methodTitle) => {
    setSelectedMethod(methodTitle);
    setIsModalOpen(true);
  };

  const handleVerify = () => {
    alert(`Verifying ${otp} for ${selectedMethod}...`);
    setIsModalOpen(false);
    setOtp('');
  };

    const openLogoutModal = (id) => {
        setSelectedSessionId(id);
        setLogoutModal(true);
    };

    const confirmLogout = () => {
        setSessionData(prev => prev.filter(session => session.id !== selectedSessionId));
        setLogoutModal(false);
        setSelectedSessionId(null);
    };

    const terminateAll =()=>{
        const isConfirm = window.confirm("are you sure want to remove all Sessions?")
        if(isConfirm){
        setSessionData(prev => prev.filter(session => session.current))}
    }
    

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="sec-infra-wrapper">
            <div className="sec-infra-inner">
                <header className="sec-infra-header">
                    <h1 className="sec-infra-main-title">Security Infrastructure</h1>
                    <p className="sec-infra-subtitle">Manage active sessions, MFA settings and password policies</p>
                    <div className="sec-infra-divider"></div>
                </header>

                <div className="sec-infra-top-grid">
                    <div className="sec-infra-card">
                        <div className="sec-infra-flex-header">
                            <div className="sec-infra-title-grp">
                                <h2 className="sec-infra-card-title">Active Sessions</h2>
                                <span className="sec-infra-badge-telemetry">REAL-TIME TELEMETRY</span>
                            </div>
                            <button className="sec-infra-btn-terminate" onClick={()=>{terminateAll()}} >TERMINATE ALL OTHER SESSIONS</button>
                        </div>

                        <div className="sec-infra-table-container">
                            <table className="sec-infra-table">
                                <thead>
                                    <tr>
                                        <th>DEVICE / BROWSER</th>
                                        <th>IP ADDRESS</th>
                                        <th>LOCATION</th>
                                        <th>LAST ACTIVE</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionData.map((session, index) => (
                                        <tr key={session.id}>
                                            <td style={{display:"flex", gap:"10px",padding:"20px 12px"}}>
                                                <img src={session.icon} width={30} alt="device" />
                                                <div>
                                                    <span className="sec-infra-dev-text">{session.device}</span>
                                                    <p className="sec-infra-dev-sub">{session.type}</p>
                                                </div>
                                            </td>
                                            <td>{session.ip}</td>
                                            <td>{session.loc}</td>
                                            <td className={session.current ? "sec-infra-status-active" : ""}>{session.time}</td>
                                            <td>
                                                {!session.current && <img src={Logout} className="sec-infra-icon-action" onClick={() => openLogoutModal(session.id)} alt="Logout" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="sec-infra-card sec-infra-mfa-sidebar">
                        <div className="sec-infra-flex-header">
                            <h2 className="sec-infra-icon-title"><img src={Mfa} alt="" /> MFA Settings</h2>
                            <span className="sec-infra-badge-req">REQUIRED</span>
                        </div>
                        <p className="sec-infra-mfa-desc">Strengthen infrastructure access by requiring secondary authentication.</p>

                        {mfaMethods.map(method => (
                            <div className="sec-infra-mfa-card" key={method.id}>
                                <img src={method.icon} width={40} alt="" />
                                <div className="sec-infra-mfa-info">
                                    <span className="sec-infra-mfa-label">{method.title}</span>
                                    <p>{method.sub}</p>
                                </div>
                                {method.action ? (
                                    <span className="sec-infra-link-blue" style={{cursor:"pointer"}} onClick={() => handleActionClick(method.title)}>{method.action}</span>
                                ) : (
                                    method.verified ? <img src={VerifyTick} className="sec-infra-tick" alt="Verified" /> : <span className="sec-infra-link-blue" style={{cursor:"pointer"}} onClick={() => handleActionClick(method.title)}>verify</span>
                                )}
                            </div>
                        ))}

                        <div className="sec-infra-trusted-sec">
                            <h4 className="sec-infra-small-title">TRUSTED DEVICES</h4>
                            {trustedDevices.map((device, i) => (
                                <div className="sec-infra-trusted-row" key={i}>
                                    <span>{device.name}</span>
                                    <span onClick={()=>{handleRevoke(device.id)}} className="sec-infra-link-red">REVOKE</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <section className="sec-infra-card sec-infra-full-width">
                    <div className="sec-infra-flex-header">
                        <h2 className="sec-infra-icon-title"><img src={PasswordKey} alt="" /> Password Policies</h2>
                        <span className="sec-infra-badge-active">ACTIVE ENFORCEMENT</span>
                    </div>

                    <div className="sec-infra-password-content">
                        <div className="sec-infra-pass-controls">
                            <div className="sec-infra-range-wrap">
                                <div className="sec-infra-range-top">
                                    <label>MINIMUM CHARACTER LENGTH</label>
                                    <span className="sec-infra-big-digit">{passLength}</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="64"
                                    value={passLength}
                                    onChange={(e) => setPassLength(e.target.value)}
                                    className="sec-infra-slider"
                                />
                                <div className="sec-infra-range-bottom">
                                    <span>8 Characters</span>
                                    <span>64 Characters</span>
                                </div>
                            </div>

                            <div className="sec-infra-interval-wrap">
                                <label className="sec-infra-field-label">EXPIRATION INTERVAL</label>
                                <div className="sec-infra-btn-group">
                                    {["30 Days", "90 Days"].map(val => (
                                        <button
                                            key={val}
                                            className={`sec-infra-period-btn ${expiry === val ? 'is-active' : ''}`}
                                            onClick={() => setExpiry(val)}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                    <button
                                        className={`sec-infra-period-btn ${expiry !== "30 Days" && expiry !== "90 Days" ? 'is-active' : ''}`}
                                        onClick={() => setShowModal(true)}
                                    >
                                        {expiry !== "30 Days" && expiry !== "90 Days" ? expiry : "Custom"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="sec-infra-pass-toggles">
                            {[
                                { id: 'special', label: 'Special Characters', sub: 'Include Symbols (!@#$)' },
                                { id: 'mixed', label: 'Mixed-Case', sub: 'Upper & Lower case' }
                            ].map(toggle => (
                                <div className="sec-infra-toggle-item" key={toggle.id}>
                                    <div>
                                        <span className="sec-infra-toggle-txt">{toggle.label}</span>
                                        <p className="sec-infra-toggle-sub">{toggle.sub}</p>
                                    </div>
                                    <div
                                        className={`sec-infra-switch ${toggles[toggle.id] ? 'is-on' : ''}`}
                                        onClick={() => handleToggle(toggle.id)}
                                    >
                                        <div className="sec-infra-switch-handle"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {showModal && (
                <div className="sec-infra-modal-overlay">
                    <div className="sec-infra-modal">
                        <h2>Custom Expiration Interval</h2>
                        <p>Specify the number of days before a user is prompted to change their password.</p>
                        <div className="sec-infra-input-group">
                            <label>NUMBER OF DAYS</label>
                            <input type="number" id="customDays" placeholder="e.g. 45" />
                        </div>
                        <div className="sec-infra-modal-footer">
                            <button className="sec-infra-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="sec-infra-btn-apply" onClick={() => {
                                const val = document.getElementById('customDays').value;
                                if (val) setExpiry(`${val} Days`);
                                setShowModal(false);
                            }}>Apply Interval</button>
                        </div>
                    </div>
                </div>
            )}

            {logoutModal && (
                <div className="sec-infra-modal-overlay">
                    <div className="sec-infra-modal">
                        <div className="sec-infra-modal-header" style={{ marginBottom: '15px' }}>
                            <h2 style={{ color: '#ff4d4d' }}>Terminate Session?</h2>
                        </div>
                        <p>Are you sure you want to log out of this device? This action will immediately revoke access for this session.</p>

                        <div className="sec-infra-modal-footer" style={{ marginTop: '25px' }}>
                            <button
                                className="sec-infra-btn-cancel"
                                onClick={() => setLogoutModal(false)}
                            >
                                No, Keep it
                            </button>
                            <button
                                className="sec-infra-btn-apply"
                                style={{ backgroundColor: '#ff4d4d' }}
                                onClick={confirmLogout}
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {isModalOpen && (
        <div className="mfa-modal-overlay">
          <div className="mfa-modal-content">
            <h3>Verify {selectedMethod}</h3>
            <p>Enter the 6-digit code sent to your device.</p>
            
            <input 
              type="text" 
              maxLength="4" 
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mfa-otp-input"
            />

            <div className="mfa-modal-actions">
              <button onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleVerify} className="btn-verify">Verify Now</button>
            </div>
          </div>
        </div>
      )}
            
        </div>
    );
};