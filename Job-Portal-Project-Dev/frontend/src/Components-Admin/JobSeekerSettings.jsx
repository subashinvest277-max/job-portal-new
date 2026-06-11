import React, { useEffect, useState } from "react";
import "./JobSeekerSettings.css";
import vector from '../assets/EditIcon.png';
import Info from '../assets/AdminAssets/Circle-Info.png'
import save from '../assets/AdminAssets/Save-White.png';
import arrowDownImg from "../assets/AdminAssets/DownArrow.png";
import api from '../api/axios'
 
 
export const JobSeekerSettings = () => {
  const [formData, setFormData] = useState({
    registration: true,
    emailVer: true,
    phoneVer: true,
    domainRest: true,
    allowedDomains: ["gmail.com", "yahoo.com", "outlook.com"],
    defaultRole: "Job Seeker",
    accountStatus: "Active",
    profileVisibility: "Employers Only",
    resumeVisibility: "Employers Only",
    anonymous: false,
    completionPercent: "0 %",
    salary: true,
    reviews: true,
    appStatus: true,
    similarJobs: true,
    advice: true,
    easyApply: true,
    saveJobs: true,
    maxApps: 30,
    appExpiry: 60
  });
 
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
 
  const [domainInput, setDomainInput] = useState("");
 
  useEffect(() => {
    fetchData();
  }, []);
 
  // ✅ GET — fetch settings and populate formData
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('jobseeker/settings/');
      const data = response.data;
 
      // Map API response into formData (excluding read-only fields)
      setFormData({
        registration:       data.registration,
        emailVer:           data.emailVer,
        phoneVer:           data.phoneVer,
        domainRest:         data.domainRest,
        allowedDomains:     data.allowedDomains || [],
        defaultRole:        data.defaultRole,
        accountStatus:      data.accountStatus,
        profileVisibility:  data.profileVisibility,
        resumeVisibility:   data.resumeVisibility,
        anonymous:          data.anonymous,
        completionPercent:  data.completionPercent,
        salary:             data.salary,
        reviews:            data.reviews,
        appStatus:          data.appStatus,
        similarJobs:        data.similarJobs,
        advice:             data.advice,
        easyApply:          data.easyApply,
        saveJobs:           data.saveJobs,
        maxApps:            data.maxApps,
        appExpiry:          data.appExpiry,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 
  const toggleSwitch = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };
 
  const handleDomainKeyDown = (e) => {
    if (e.key === "Enter" && domainInput.trim()) {
      e.preventDefault();
      const newDomain = domainInput.trim().toLowerCase();
      if (!formData.allowedDomains.includes(newDomain)) {
        setFormData(prev => ({
          ...prev,
          allowedDomains: [...prev.allowedDomains, newDomain]
        }));
      }
      setDomainInput("");
    }
  };
 
  const removeDomain = (domainToRemove) => {
    setFormData(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter(d => d !== domainToRemove)
    }));
  };
 
  // ✅ PATCH — same URL as GET, no ID needed
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch('jobseeker/settings/', formData);
      console.log("Settings saved:", response.data);
      alert(response?.data?.message || "oops something went wrong");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert(error?.data);
    } finally {
      setSaving(false);
    }
  };
 
  /* --- Internal UI Components --- */
  const Switch = ({ active, onToggle }) => (
    <div className={`jobset-switch ${active ? "active" : ""}`} onClick={onToggle}>
      <div className="jobset-switch-handle"></div>
    </div>
  );
 
  const ToggleRow = ({ label, desc, active, onToggle }) => (
    <div className="jobset-toggle-row">
      <div><h4>{label}</h4><p>{desc}</p></div>
      <Switch active={active} onToggle={onToggle} />
    </div>
  );
 
  const PrefItem = ({ label, active, onToggle }) => (
    <div className="jobset-pref-item">
      <span>{label}</span>
      <Switch active={active} onToggle={onToggle} />
    </div>
  );
 
  // ✅ Show a loading state while fetching
  if (loading) {
    return (
      <div className="Jobseeker-Set-main-wrapper" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        Loading settings...
      </div>
    );
  }
 
  return (
    <div className="Jobseeker-Set-main-wrapper">
      <div className="jobset-header-flex">
        <div className="jobset-header-text">
          <h2>Job Seeker Setting</h2>
          <p>Manage preferences and permissions for job seeker users</p>
        </div>
        {/* <button className="jobset-edit-btn">
          <img src={vector} alt="edit-icon" style={{ width: '13px', marginRight: '8px' }} />
          Edit Settings
        </button> */}
      </div>
 
      {/* SECTION 1: Registration & Access */}
      <div className="jobset-card">
        <div className="jobset-card-header">
          <h3>Registration & Access</h3>
          <p>Configure how job seekers can register and access the platform</p>
        </div>
 
        <div className="jobset-grid-three">
          <div className="jobset-col">
            <ToggleRow label="Job Seeker Registration" desc="Allow new users to register" active={formData.registration} onToggle={() => toggleSwitch('registration')} />
            <ToggleRow label="Email Verification" desc="Require email verification" active={formData.emailVer} onToggle={() => toggleSwitch('emailVer')} />
            <ToggleRow label="Phone Verification" desc="Require mobile verification" active={formData.phoneVer} onToggle={() => toggleSwitch('phoneVer')} />
            <ToggleRow label="Email Domains Restriction" desc="Restrict specific domains" active={formData.domainRest} onToggle={() => toggleSwitch('domainRest')} />
          </div>
 
          <div className="jobset-col">
            <div className="jobset-field">
              <label>Allowed Domains <span className="jobset-optional">(Optional)</span></label>
              <p className="jobset-field-desc">Add email domains allowed to register</p>
              <input
                type="text"
                placeholder="Enter domain and press Enter"
                className="jobset-input"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={handleDomainKeyDown}
              />
              <div className="jobset-tags">
                {formData.allowedDomains.map((domain, index) => (
                  <span key={index} className="jobset-tag">
                    {domain}
                    <span className="jobset-tag-close" onClick={() => removeDomain(domain)}>×</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
 
          {/* <div className="jobset-col">
            <div className="jobset-field">
              <label>Default Role</label>
              <p className="jobset-field-desc">Select default role for new registrations</p>
              <select name="defaultRole" className="jobset-input" value={formData.defaultRole} onChange={handleChange}>
                <option value="Job Seeker">Job Seeker</option>
              </select>
            </div>
            <div className="jobset-field jobset-mt-20">
              <label>Account Status</label>
              <p className="jobset-field-desc">Default status for new accounts</p>
              <select name="accountStatus" className="jobset-input" value={formData.accountStatus} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Suspended">Suspended</option>
              </select>
              <img src={arrowDownImg} className="jobset-arrow-icon-dm" alt="arrow" />
            </div>
          </div> */}
        </div>
      </div>
 
      {/* SECTION 2: Profile Settings */}
      {/* <div className="jobset-card">
        <div className="jobset-card-header">
          <h3>Job Seeker Profile Settings</h3>
          <p>Manage profile visibility and preferences</p>
        </div>
        <div className="jobset-grid-profile">
          <div className="jobset-main-fields">
            <div className="jobset-field">
              <label>Profile Visibility</label>
              <p className="jobset-field-desc">Who can view job seeker profiles</p>
              <select name="profileVisibility" className="jobset-input" value={formData.profileVisibility} onChange={handleChange}>
                <option value="Employers Only">Employers Only</option>
                <option value="Private">Private</option>
                <option value="Everyone">Everyone</option>
              </select>
              <img src={arrowDownImg} className="jobset-arrow-icon" alt="arrow" />
            </div>
            <div className="jobset-field">
              <label>Resume Visibility</label>
              <p className="jobset-field-desc">Who can view resume without permission</p>
              <select name="resumeVisibility" className="jobset-input" value={formData.resumeVisibility} onChange={handleChange}>
                <option value="Employers Only">Employers Only</option>
                <option value="Private">Private</option>
                <option value="Everyone">Everyone</option>
              </select>
              <img src={arrowDownImg} className="jobset-arrow-icon" alt="arrow" />
            </div>
            <div className="jobset-field">
              <label>Allow Anonymous Profile</label>
              <p className="jobset-field-desc">Allow job seekers to hide identity</p>
              <div className="jobset-status-box-inline">
                <Switch active={formData.anonymous} onToggle={() => toggleSwitch('anonymous')} />
                <span className="status-label">{formData.anonymous ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
            <div className="jobset-field">
              <label>Profile Completion %</label>
              <p className="jobset-field-desc">Minimum profile completion to apply</p>
              <select name="completionPercent" className="jobset-input" value={formData.completionPercent} onChange={handleChange}>
                {["0 %", "20 %", "40 %", "60 %", "80 %", "100 %"].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <img src={arrowDownImg} className="jobset-arrow-icon" alt="arrow" />
            </div>
          </div>
 
          <div className="jobset-pref-sidebar">
            <div className="jobset-pref-box">
              <h4>Other Preferences</h4>
              <PrefItem label="Show Salary in Job Listings" active={formData.salary} onToggle={() => toggleSwitch('salary')} />
              <PrefItem label="Show Application Status" active={formData.appStatus} onToggle={() => toggleSwitch('appStatus')} />
              <PrefItem label="View Similar Jobs" active={formData.similarJobs} onToggle={() => toggleSwitch('similarJobs')} />
            </div>
          </div>
        </div>
      </div> */}
 
      {/* SECTION 3: Application Settings */}
      <div className="jobset-grid-four">
        <div className="jobset-field">
          <label>Easy Apply</label>
          <p className="jobset-field-desc">Enable one click apply for jobs</p>
          <div className="jobset-status-box-inline">
            <Switch active={formData.easyApply} onToggle={() => toggleSwitch('easyApply')} />
            <span className="status-label">{formData.easyApply ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
 
        <div className="jobset-field">
          <label>Allow Save Jobs</label>
          <p className="jobset-field-desc">Allow job seekers to save jobs</p>
          <div className="jobset-status-box-inline">
            <Switch active={formData.saveJobs} onToggle={() => toggleSwitch('saveJobs')} />
            <span className="status-label">{formData.saveJobs ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
 
        <div className="jobset-field">
          <label>Max Applications Per Day</label>
          <p className="jobset-field-desc">Limit applications per day</p>
          <div className="jobset-input-wrapper">
            <input type="number" name="maxApps" className="jobset-input" value={formData.maxApps} onChange={handleChange} />
          </div>
        </div>
 
        <div className="jobset-field">
          <label>Application Expiry (Days)</label>
          <p className="jobset-field-desc">Auto close old applications</p>
          <div className="jobset-input-wrapper">
            <input type="number" name="appExpiry" className="jobset-input" value={formData.appExpiry} onChange={handleChange} />
          </div>
        </div>
      </div>
 
      {/* Footer */}
      <div className="jobset-footer">
        <div className="jobset-alert">
          <img src={Info} alt="info-icon" />
          Changes will apply to all job seeker users on the platform
        </div>
        <button className="jobset-save-btn" onClick={handleSave} disabled={saving}>
          <img src={save} alt="save-icon" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};
 