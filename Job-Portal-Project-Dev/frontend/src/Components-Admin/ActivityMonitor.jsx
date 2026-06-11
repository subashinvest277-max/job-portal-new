import React, { useState, useEffect } from 'react'
import './ActivityMonitor.css'
import YellowProfile from '../assets/AdminAssets/YellowBGProfile.png'
import Jobposted from '../assets/AdminAssets/JobPostedAdmin.png'
import BlueProfile from '../assets/AdminAssets/BlueBGProfile.png'
import ActiveEmployers from '../assets/AdminAssets/ActiveEmployers.png'
import SuspAct from '../assets/AdminAssets/SuspAct.png'
import Login from '../assets/AdminAssets/LoginToday.png'
import Interview from '../assets/AdminAssets/InterviewAdmin.png'
import Rejection from '../assets/AdminAssets/Rejection.png'
import GreenProfile from '../assets/AdminAssets/GreenBGProfile.png'
import RedProfile from '../assets/AdminAssets/RedBGProfile.png'
import SupportTicket from '../assets/AdminAssets/SupportTicket.png'
import Msgsent from '../assets/AdminAssets/Msgsent.png'
import EmailsSent from '../assets/AdminAssets/EmailsSent.png'
import api from '../api/axios'

export const ActivityMonitor = ({ currentTab, onTabChange }) => {
  // Local state fallback only used if component is rendered without props
  const [localActiveTab, setLocalActiveTab] = useState("AdminMonitor");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Derive active view tab seamlessly from parent or fallback local state
  const activeSubTab = currentTab || localActiveTab;

  const handleSubTabClick = (tabName) => {
    if (onTabChange) {
      onTabChange(tabName);
    } else {
      setLocalActiveTab(tabName); 
    }
  };

  // Dashboard stats from /dashboard/
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Company list from /company/
  const [companyData, setCompanyData] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);

  // Status update state
  const [updatingId, setUpdatingId] = useState(null);
  // Company details modal state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId !== null) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openDropdownId]);

  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await api.get('/dashboard/');
      setStats(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setStatsError('Failed to load dashboard stats.');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setCompanyLoading(true);
    setCompanyError(null);

    try {
      const res = await api.get('/company/');
      console.log("Company approval list data:", res.data);
      setCompanyData(res.data);
    } catch (err) {
      console.error('Company fetch error:', err);
      setCompanyError('Failed to load company data.');
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCompanyNameClick = async (company) => {
    setSelectedCompany(company);
    setDetailsError("");
    setDetailsLoading(false);

    const hasFullDetails =
      company.company_profile ||
      company.verification_details ||
      company.company_moto ||
      company.contact_person ||
      company.contact_number ||
      company.company_email ||
      company.website ||
      company.company_size ||
      company.address1 ||
      company.address2 ||
      company.about ||
      company.legal_name ||
      company.registration_number ||
      company.tax_id ||
      company.website_url ||
      company.official_email ||
      company.phone_number ||
      company.incorporation_certificate ||
      company.company_logo ||
      company.logo_url ||
      company.logo_absolute_url;

    if (hasFullDetails) {
      return;
    }

    try {
      setDetailsLoading(true);

      const res = await api.get(`/company/${company.id}/`);
      console.log("Single company details:", res.data);
      setSelectedCompany(res.data);
    } catch (err) {
      console.error("Company details fetch error:", err);
      setDetailsError("Full company details are not available from API yet.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    setOpenDropdownId(null);
    try {
      await api.patch(`/company/${id}/status/`, { status: newStatus });
      // Update local state optimistically
      setCompanyData(prev =>
        prev.map(item => item.id === id ? { ...item, verification: newStatus } : item)
      );
    } catch (err) {
      const msg = err.response?.data?.error || 'Status update failed.';
      alert(msg); // or use your toast/notification system
      console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Helpers to safely read nested stats
  const s = (section, subsection, key) => {
    try { return stats[section][subsection][key] ?? 0; }
    catch { return 0; }
  };

  return (
    <>
      <div style={{ margin: "30px" }}>
        <div>
          <div className="toggle-ActivityMonitor-main">
            <button
              className={`AdminActivity-select ${activeSubTab === "AdminMonitor" ? "active" : ""}`}
              onClick={() => handleSubTabClick("AdminMonitor")}
            >
              Admin Monitoring
            </button>
            <button
              className={`AdminActivity-select ${activeSubTab === "CompanyApproval" ? "active" : ""}`}
              onClick={() => handleSubTabClick("CompanyApproval")}
            >
              Company Approval
            </button>
          </div>

          {activeSubTab === "AdminMonitor" && (
            <>
              {statsLoading && <p style={{ color: 'var(--color-text-secondary)' }}>Loading stats...</p>}
              {statsError && <p style={{ color: 'red' }}>{statsError}</p>}

              {!statsLoading && !statsError && stats && (
                <>
                  <p style={{ fontSize: "18px", fontWeight: "500" }}>Admin Activity Monitoring</p>
                  <div className='Admin-Monitor-Overview'>
                    {/* New User Registrations */}
                    <div className="admin-card-container">
                      <div className="admin-card-header">
                        <img src={YellowProfile} width={30} alt="New User" />
                        <h3 className="admin-card-title">New User Registrations</h3>
                      </div>
                      <hr className="admin-divider" />
                      <div className="admin-stats-row">
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'new_user_registrations', 'today')}
                            </span>
                            <span className="admin-stat-label">Today</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-green" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'new_user_registrations', 'this_week')}
                            </span>
                            <span className="admin-stat-label">This week</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-yellow" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Job Posted */}
                    <div className="admin-card-container">
                      <div className="admin-card-header">
                        <img src={Jobposted} width={30} alt="Jobs" />
                        <h3 className="admin-card-title">Job Posted</h3>
                      </div>
                      <hr className="admin-divider" />
                      <div className="admin-stats-row">
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'job_posted', 'today')}
                            </span>
                            <span className="admin-stat-label">Today</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-green" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'job_posted', 'this_week')}
                            </span>
                            <span className="admin-stat-label">This week</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-red" style={{ width: '35%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Applications */}
                    <div className="admin-card-container">
                      <div className="admin-card-header">
                        <img src={BlueProfile} width={30} alt="Applications" />
                        <h3 className="admin-card-title">Total Application</h3>
                      </div>
                      <hr className="admin-divider" />
                      <div className="admin-stats-row">
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'total_applications', 'today')}
                            </span>
                            <span className="admin-stat-label">Today</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-green" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'total_applications', 'this_week')}
                            </span>
                            <span className="admin-stat-label">This week</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-yellow" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Employers */}
                    <div className="admin-card-container">
                      <div className="admin-card-header">
                        <img src={ActiveEmployers} width={30} alt="Employers" />
                        <h3 className="admin-card-title">Active Employers</h3>
                      </div>
                      <hr className="admin-divider" />
                      <div className="admin-stats-row">
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'active_employers', 'today')}
                            </span>
                            <span className="admin-stat-label">Today</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-green" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <div className="admin-stat-item">
                          <div className="admin-stat-value-group">
                            <span className="admin-stat-number">
                              {s('admin_activity_monitoring', 'active_employers', 'this_week')}
                            </span>
                            <span className="admin-stat-label">This week</span>
                          </div>
                          <div className="admin-progress-bar">
                            <div className="admin-progress-fill admin-bg-red" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Activity Overview */}
                  <p style={{ fontSize: "18px", fontWeight: "500" }}>Platform Activity Overview</p>
                  <div style={{ display: "flex", gap: "40px" }}>

                    {/* User Activity */}
                    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.08)", borderRadius: "10px", flex: "1.5" }}>
                      <h4 style={{ textAlign: "center", background: "#ADCEED", padding: "15px", marginTop: "0px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>User Activity</h4>
                      <div style={{ padding: "0px 12px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={Login} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Login Today</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'user_activity', 'login_today')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={YellowProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Profile Update</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'user_activity', 'profile_update')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={SuspAct} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Suspicious Activity</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'user_activity', 'suspicious_activity')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Application Status */}
                    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.08)", borderRadius: "10px", flex: "1.5" }}>
                      <h4 style={{ textAlign: "center", background: "#ADCEED", padding: "15px", marginTop: "0px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>Application Status</h4>
                      <div style={{ padding: "0px 12px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #f3f4f6" }}>
                          <p style={{ margin: "0px", fontWeight: "600", fontSize: "14px", color: "#032240" }}>
                            Total Application : {s('platform_activity_overview', 'application_status', 'total_application')}
                          </p>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={BlueProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Shortlisted</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'application_status', 'shortlisted')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={Interview} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Interviews</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'application_status', 'interviews')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={Rejection} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Rejections</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'application_status', 'rejections')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Employer Activity */}
                    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.08)", borderRadius: "10px", flex: "1.5" }}>
                      <h4 style={{ textAlign: "center", background: "#ADCEED", padding: "15px", marginTop: "0px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>Employer Activity</h4>
                      <div style={{ padding: "0px 12px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={BlueProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>New Employers</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'employer_activity', 'new_employers')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={GreenProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Job Postings</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'employer_activity', 'job_postings')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={YellowProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Highlighted Jobs</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('platform_activity_overview', 'employer_activity', 'highlighted_jobs')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job & Communication */}
                  <p style={{ fontSize: "18px", fontWeight: "500" }}>Job & Communication</p>
                  <div style={{ display: "flex", gap: "40px" }}>

                    {/* Job Tracking */}
                    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.08)", borderRadius: "10px", flex: "1.5" }}>
                      <h4 style={{ textAlign: "center", background: "#ADCEED", padding: "15px", marginTop: "0px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>Job Tracking</h4>
                      <div style={{ padding: "0px 12px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={BlueProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Job Posted</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('job_communication', 'job_tracking', 'job_posted')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={GreenProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Job Approved</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('job_communication', 'job_tracking', 'job_approved')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={RedProfile} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Expired Jobs</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('job_communication', 'job_tracking', 'expired_jobs')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Communication Logs */}
                    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.08)", borderRadius: "10px", flex: "1.5" }}>
                      <h4 style={{ textAlign: "center", background: "#ADCEED", padding: "15px", marginTop: "0px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>Communication Logs</h4>
                      <div style={{ padding: "0px 12px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={Msgsent} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Message Sent</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('job_communication', 'communication_logs', 'messages_sent')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={SupportTicket} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Support Tickets</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('job_communication', 'communication_logs', 'support_tickets')}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <img src={EmailsSent} width={20} height={20} alt="" />
                            <p style={{ margin: "0px 5px" }}>Emails Sent</p>
                          </div>
                          <span className="admin-stat-number">
                            {s('job_communication', 'communication_logs', 'emails_sent')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Employer Activity (applications) */}
                    <div style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.08)", borderRadius: "10px", flex: "1.5", backgroundColor: "#fff" }}>
                      <h4 style={{ textAlign: "center", background: "#ADCEED", padding: "15px", marginTop: "0px", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>Employer Activity</h4>
                      <div style={{ padding: "10px 25px" }}>
                        {[
                          ['Applications last 2 days', s('job_communication', 'employer_activity', 'applications_last_2_days')],
                          ['Applications last week', s('job_communication', 'employer_activity', 'applications_last_week')],
                          ['Applications last month', s('job_communication', 'employer_activity', 'applications_last_month')],
                        ].map(([label, val]) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0px" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ color: "#1a3353", marginRight: "10px", fontSize: "20px" }}>•</span>
                              <p style={{ margin: 0, color: "#1a3353", fontWeight: "500", fontSize: "16px" }}>{label}</p>
                            </div>
                            <div style={{ fontWeight: "bold", fontSize: "18px", color: "#1a3353" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeSubTab === "CompanyApproval" && (
            <div className="C-Approval-container">
              <h2 className="C-Approval-title">Company Approval</h2>

              {companyLoading && <p style={{ color: 'var(--color-text-secondary)' }}>Loading companies...</p>}
              {companyError && <p style={{ color: 'red' }}>{companyError}</p>}

              {!companyLoading && !companyError && (
                <div className="C-Approval-table-wrapper">
                  <div className="C-Approval-header-row">
                    <div className="C-Approval-col">Company Name</div>
                    <div className="C-Approval-col">Submitted By</div>
                    <div className="C-Approval-col">Date of submission</div>
                    <div className="C-Approval-col">Certificate</div>
                    <div className="C-Approval-col">Status</div>
                    <div className="C-Approval-col">Actions</div>
                  </div>
                  {companyData.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>No companies found.</p>
                  )}
                  {companyData.map((company) => (
                    <div className="C-Approval-data-row" key={company.id}>
                      <div className="C-Approval-col C-Approval-name">
                        {company.name || company.company_name}
                      </div>
                      <div className="C-Approval-col">
                        <div className="C-Approval-user-info">
                          <div className="C-Approval-avatar"></div>
                          <span>{company.user}</span>
                        </div>
                      </div>
                      <div className="C-Approval-col">{company.date}</div>
                      <div className="C-Approval-col">
                        <span className={company.certificate === "Yes" ? "C-Approval-badge-yes" : "C-Approval-badge-no"}>
                          {company.certificate}
                        </span>
                      </div>
                      <div className="C-Approval-col">
                        <span className={`C-Approval-${company.verification}`}>
                          {company.verification}
                        </span>
                      </div>
                      <div className="C-Approval-col C-Approval-dots">
                        {updatingId === company.id ? (
                          <span style={{ fontSize: '12px', color: 'gray' }}>Updating...</span>
                        ) : (
                          <>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === company.id ? null : company.id);
                              }}
                              style={{ cursor: 'pointer', padding: '5px' }}
                            >
                              ...
                            </span>
                            {openDropdownId === company.id && (
                              <div
                                className="C-Approval-dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleCompanyNameClick(company);
                                  }}
                                >
                                  Quick View
                                </div>

                                {["Pending", "Hold", "Reject", "Verified"]
                                  .filter((status) => status !== company.verification)
                                  .map((status) => (
                                    <div
                                      key={status}
                                      onClick={() => handleStatusChange(company.id, status)}
                                    >
                                      {status}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedCompany && (
        <div
          className="company-details-overlay"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="company-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="company-details-header">
              <h3>
                {selectedCompany.company_name ||
                  selectedCompany.name ||
                  "Company Details"}
              </h3>

              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                aria-label="Close company details"
              >
                ×
              </button>
            </div>

            {detailsLoading && (
              <p className="company-details-loading">
                Loading company details...
              </p>
            )}

            {!detailsLoading && (
              <>
                <h4 className="company-details-section-title">
                  Company Profile Details
                </h4>

                <div className="company-details-grid">
                  <div>
                    <span>Company Name</span>
                    <p>
                      {selectedCompany.company_profile?.company_name ||
                        selectedCompany.company_name ||
                        selectedCompany.name ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Company Moto</span>
                    <p>
                      {selectedCompany.company_profile?.company_moto ||
                        selectedCompany.company_moto ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Contact Person</span>
                    <p>
                      {selectedCompany.company_profile?.contact_person ||
                        selectedCompany.contact_person ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Contact Number</span>
                    <p>
                      {selectedCompany.company_profile?.contact_number ||
                        selectedCompany.contact_number ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Company Email</span>
                    <p>
                      {selectedCompany.company_profile?.company_email ||
                        selectedCompany.company_email ||
                        selectedCompany.name ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Website</span>
                    <p>
                      {selectedCompany.company_profile?.website ||
                        selectedCompany.website ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Company Size</span>
                    <p>
                      {selectedCompany.company_profile?.company_size ||
                        selectedCompany.company_size ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="company-details-full">
                    <span>Address 1</span>
                    <p>
                      {selectedCompany.company_profile?.address1 ||
                        selectedCompany.address1 ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="company-details-full">
                    <span>Address 2</span>
                    <p>
                      {selectedCompany.company_profile?.address2 ||
                        selectedCompany.address2 ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="company-details-full">
                    <span>About Company</span>
                    <p>
                      {selectedCompany.company_profile?.about ||
                        selectedCompany.about ||
                        "Not provided"}
                    </p>
                  </div>

                  {(selectedCompany.company_profile?.company_logo ||
                    selectedCompany.logo_absolute_url ||
                    selectedCompany.logo_url ||
                    selectedCompany.company_logo) && (
                      <div className="company-details-full">
                        <span>Company Logo</span>
                        <img
                          className="company-details-logo"
                          src={
                            selectedCompany.company_profile?.company_logo ||
                            selectedCompany.logo_absolute_url ||
                            selectedCompany.logo_url ||
                            selectedCompany.company_logo
                          }
                          alt="Company Logo"
                        />
                      </div>
                    )}
                </div>

                <h4 className="company-details-section-title">
                  Company Verification Details
                </h4>

                <div className="company-details-grid">
                  <div>
                    <span>Legal Name</span>
                    <p>
                      {selectedCompany.verification_details?.legal_name ||
                        selectedCompany.legal_name ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Registration Number</span>
                    <p>
                      {selectedCompany.verification_details?.registration_number ||
                        selectedCompany.registration_number ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Tax ID / GST</span>
                    <p>
                      {selectedCompany.verification_details?.tax_id ||
                        selectedCompany.tax_id ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Website URL</span>
                    <p>
                      {selectedCompany.verification_details?.website_url ||
                        selectedCompany.website_url ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Official Email</span>
                    <p>
                      {selectedCompany.verification_details?.official_email ||
                        selectedCompany.official_email ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Phone Number</span>
                    <p>
                      {selectedCompany.verification_details?.phone_number ||
                        selectedCompany.phone_number ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Submitted By</span>
                    <p>
                      {selectedCompany.verification_details?.submitted_by ||
                        selectedCompany.user ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Date of Submission</span>
                    <p>
                      {selectedCompany.verification_details?.date ||
                        selectedCompany.date ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Certificate</span>
                    <p>
                      {selectedCompany.verification_details?.certificate ||
                        selectedCompany.certificate ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Verification Status</span>
                    <p>
                      {selectedCompany.verification_details?.verification ||
                        selectedCompany.verification ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Email Verified</span>
                    <p>
                      {selectedCompany.verification_details?.email_verified === true ||
                        selectedCompany.email_verified === true
                        ? "Yes"
                        : "Not provided"}
                    </p>
                  </div>

                  <div>
                    <span>Mobile Verified</span>
                    <p>
                      {selectedCompany.verification_details?.mobile_verified === true ||
                        selectedCompany.mobile_verified === true
                        ? "Yes"
                        : "Not provided"}
                    </p>
                  </div>

                  {(selectedCompany.verification_details?.incorporation_certificate ||
                    selectedCompany.incorporation_certificate) && (
                      <div className="company-details-full">
                        <span>Incorporation Certificate</span>
                        <a
                          href={
                            selectedCompany.verification_details?.incorporation_certificate ||
                            selectedCompany.incorporation_certificate
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="company-details-link"
                        >
                          View Certificate
                        </a>
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};