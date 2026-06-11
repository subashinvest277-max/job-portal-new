import React from "react";
import { MoreHorizontal, Filter, Download, ChevronLeft, ChevronRight, Users, Building2 } from "lucide-react";
import "./UserRegistrationRep.css";
 
export const UserRegistrationRep = () => {
  const users = [
    { id: 1, name: 'Sarah Miller', email: 'sarah.m@designhaus.co', category: 'Job Seeker', status: 'Verified', date: 'Oct 24, 2023', initial: 'SM' },
    { id: 2, name: 'Vortex Tech Ltd', email: 'hr@vortextech.com', category: 'Employer', status: 'Pending', date: 'Oct 24, 2023', initial: 'VT' },
    { id: 3, name: 'Alex Chen', email: 'alex.chen@gmail.com', category: 'Job Seeker', status: 'Verified', date: 'Oct 23, 2023', initial: 'AC' },
    { id: 4, name: 'Global Solutions', email: 'contact@globalsol.io', category: 'Employer', status: 'Suspended', date: 'Oct 22, 2023', initial: 'GS' },
  ];
 
  const activityData = [40, 50, 45, 60, 40, 90, 100];
 
  return (
    <div className="userReg-dashboard">
      <h1 className="userReg-title">User Registration Deep Dive</h1>
      <p className="userReg-subtitle">Detailed analysis of Job Seeker vs. Employer ecosystem health.</p>
 
      <div className="userReg-grid-layout">
        {/* Left Side: Total Stats */}
        <div className="userReg-total-dark">
          <p className="userReg-label">TOTAL ACTIVE ECOSYSTEM</p>
          <h2 className="userReg-big-value">124.8k</h2>
          <div className="userReg-growth-row">
            <span className="userReg-percent">↗ +14.2%</span>
            <span className="userReg-small-text">v last month</span>
          </div>
        </div>
 
        {/* Right Side: Metrics Grid */}
        <div className="userReg-right-metrics">
          <div className="userReg-metric-row">
            <div className="userReg-white-card">
              <div className="userReg-card-head">
                <div>
                  <p className="userReg-label">JOB SEEKERS</p>
                  <h3>98,241</h3>
                </div>
                <div className="userReg-icon-box"><Users size={18} color="#3b82f6" /></div>
              </div>
              <div className="userReg-progress-bg">
                <div className="userReg-black-bar" style={{ width: "78%" }}></div>
              </div>
              <div className="userReg-bar-info">
                <span>78% VERIFIED</span>
                <span>22% PENDING</span>
              </div>
            </div>
 
            <div className="userReg-white-card">
              <div className="userReg-card-head">
                <div>
                  <p className="userReg-label">EMPLOYERS</p>
                  <h3>26,559</h3>
                </div>
                <div className="userReg-icon-box"><Building2 size={18} color="#3b82f6" /></div>
              </div>
              <div className="userReg-progress-bg">
                <div className="userReg-blue-bar" style={{ width: "64%" }}></div>
              </div>
              <div className="userReg-bar-info">
                <span>64% VERIFIED</span>
                <span className="userReg-red-text">12% SUSPENDED</span>
              </div>
            </div>
          </div>
 
          <div className="userReg-metric-row-full">
            <div className="userReg-white-card userReg-heat-card-layout">
              <div className="userReg-heat-stats-side">
                <p className="userReg-label">ACCOUNT ACTIVITY HEAT</p>
                <div className="userReg-heat-flex">
                  <div className="userReg-heat-item">
                    <h4>82.1%</h4>
                    <span>ACTIVE (30D)</span>
                  </div>
                  <div className="userReg-divider"></div>
                  <div className="userReg-heat-item">
                    <h4>17.9%</h4>
                    <span>CHURN RISK</span>
                  </div>
                </div>
              </div>
             
              <div  className="userReg=heat-chart-side">
                <div  className="userReg-bars">
                  {activityData.map((h, i) => (
                    <div
                      key={`bar-${i}`}
                      className={`userReg-mini-bar ${i >= activityData.length - 4 ? 'active' : ''}`}
                      style={{ height: `${(h / 110) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Chart Section */}
      <div style={{background:"#F2F4F6"}} className="userReg-chart-section">
        <div  className="userReg-chart-header">
          <div>
            <h3 className="userReg-sec-title">Registration Statistics</h3>
            <p className="userReg-small-text">Growth trajectory over the last 6 months</p>
          </div>
          <div className="userReg-tab-container">
            <button className="userReg-tab active">Monthly</button>
            <button className="userReg-tab">Quarterly</button>
          </div>
        </div>
       
        <div className="userReg-chart-main">
          <svg viewBox="0 0 800 160" className="userReg-svg">
            <path d="M0,130 C100,110 200,150 300,90 C400,30 500,110 600,70 C700,30 800,10 800,10" fill="none" stroke="#1a1c1e" strokeWidth="3" />
            <path d="M0,150 C100,140 200,160 300,130 C400,100 500,140 600,120 C700,100 800,90 800,90" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" />
          </svg>
        </div>
 
        <div className="userReg-chart-footer">
          <div className="userReg-months">
            <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
          </div>
          <div className="userReg-legend">
            <div className="userReg-leg-item"><span className="userReg-dot-black"></span> Job Seekers (+22%)</div>
            <div className="userReg-leg-item"><span className="userReg-dot-blue"></span> Employers (+8%)</div>
          </div>
        </div>
      </div>
 
      {/* Table Section */}
      <div className="userReg-table-container">
        <div className="userReg-table-header">
          <h3>Recently Registered Users</h3>
          <div className="userReg-table-actions">
             <span className="userReg-action-btn"><Filter size={14}/> Filter</span>
             <span className="userReg-action-btn"><Download size={14}/> Export</span>
          </div>
        </div>
        <table className="userReg-table">
          <thead>
            <tr>
              <th>USER PROFILE</th>
              <th>CATEGORY</th>
              <th>STATUS</th>
              <th>REGISTRATION DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td className="userReg-user-profile-cell">
                  <div className="userReg-avatar-init">{user.initial}</div>
                  <div className="userReg-user-details">
                    <div className="userReg-user-name">{user.name}</div>
                    <div className="userReg-user-email">{user.email}</div>
                  </div>
                </td>
                <td>
                  <span className={`userReg-badge ${user.category.toLowerCase().replace(' ', '-')}`}>
                    {user.category}
                  </span>
                </td>
                <td>
                  <div className="userReg-status-container">
                    <span className={`userReg-status-dot ${user.status.toLowerCase()}`}></span>
                    <span className="userReg-status-label">{user.status}</span>
                  </div>
                </td>
                <td className="userReg-date-text">{user.date}</td>
                <td><MoreHorizontal size={18} className="userReg-more-icon" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="userReg-pagination">
          <span>SHOWING 4 OF 210 NEW REGISTRATIONS TODAY</span>
          <div className="page-btns">
            <button className="userReg-nav-btn"><ChevronLeft size={16}/></button>
            <button className="userReg-nav-btn"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};
 