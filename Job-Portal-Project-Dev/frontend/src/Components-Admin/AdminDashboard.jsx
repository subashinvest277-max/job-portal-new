import React, { useState, useEffect } from 'react'
import "./AdminDashboard.css"
import Dashboard from '../assets/Employer/DashboardIC.png'
import DashboardInact from '../assets/Employer/Dashboard_Inactive.png'
import UserManagements from '../assets/AdminAssets/UserManage.png'
import UserManagementACT from '../assets/AdminAssets/UserManageActive.png'
import RoleManagementIC from '../assets/AdminAssets/RoleManage.png'
import RoleManagementICACT from '../assets/AdminAssets/RoleManageAct.png'
import JobMonitor from '../assets/AdminAssets/JobMon.png'
import JobMonitorACT from '../assets/AdminAssets/JobMonActive.png'
import Report from '../assets/AdminAssets/AdminReport.png'
import ReportAct from '../assets/AdminAssets/ReportsActive.png'
import ActivityMon from '../assets/AdminAssets/ActivityMon.png'
import ActivityMonAct from '../assets/AdminAssets/ActivityMonAct.png'
import Tickets from '../assets/AdminAssets/Tickets.png'
import TicketsACT from '../assets/AdminAssets/TicketsActive.png'
import Settings from '../assets/AdminAssets/Settings.png'
import SettingsAct from '../assets/AdminAssets/SettingsActive.png'
import Memberships from '../assets/AdminAssets/Membership.png'
import MembershipsAct from '../assets/AdminAssets/MembershipActive.png'
import TotalJobs from '../assets/AdminAssets/TotalJobs.png'
import TotalEmployers from '../assets/AdminAssets/TotalEmployers.png'
import TotalJobseekers from '../assets/AdminAssets/TotalJobseeker.png'
import TotalCompanies from '../assets/AdminAssets/TotalCompanies.png'
import ViewMore from '../assets/AdminAssets/ViewMore.png'
import { TotalOverview } from './TotalOverview'
import { AdminExperience } from './AdminExperience'
import { useJobs } from '../JobContext'
import { UserManagement } from './UserManagement'
import { ActivityMonitor } from './ActivityMonitor'
import { JobMonitoring } from './JobMonitoring'
import { Membership } from './Membership'
import { useNavigate } from 'react-router-dom'
import YellowProfile from '../assets/AdminAssets/YellowBGProfile.png'
import CensusDown from '../assets/AdminAssets/CENSUS_DOWN.png'
import CensusUp from '../assets/AdminAssets/CENSUS_UP.png'
import Revenue from '../assets/AdminAssets/Revenue.png'
import Application from '../assets/AdminAssets/TotalApplication.png'
import TotalJobsPosted from '../assets/AdminAssets/TotalJobsPosted.png'
import TotalSubscribers from '../assets/AdminAssets/TotalSubscribers.png'
import Highlight from '../assets/Employer/HighLight-Active.png'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HighligtedJobs } from './HighligtedJobs'
import { PublishedPlans } from './PublishedPlans'
import { SupportHub } from './SupportHub'
import { AdminSettings } from './AdminSettings'
import api from '../api/axios'
import Logout from '../assets/Employer/Elogout.png'
import { LogoutModal } from '../Components-Jobseeker/LogoutModal'
import { AdminHeader } from './AdminHeader'

export const AdminDashboard = () => {
    const { jobs, Alluser, currentEmployer } = useJobs();
    const [activetab, setActiveTab] = useState(() => {
        return sessionStorage.getItem('adminActiveTab') || 'Dashboard';
    });
    const [subTab, setSubTab] = useState(() => {
        return sessionStorage.getItem('adminSubTab') || 'AdminMonitor';
    });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    // State for API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        overview_stats: [],
        job_postings_chart: [],
        highlighted_jobs: [],
        admin_stats: [],
        user_growth_chart: [],
        activities_chart: [],
        experience_levels: [],
        total_overview: {}
    });

    // Handle updates into persistent system session registers dynamically
    useEffect(() => {
        if (activetab) {
            sessionStorage.setItem('adminActiveTab', activetab);
        }
    }, [activetab]);

    // Handle sub tab register persistence dynamically
    useEffect(() => {
        if (subTab) {
            sessionStorage.setItem('adminSubTab', subTab);
        }
    }, [subTab]);

    // Fetch dashboard data from API
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);

            try {
                console.log("Fetching admin dashboard data...");
                const response = await api.get('admin/dashboard/');

                if (response.status === 200) {
                    console.log("Dashboard data received:", response.data);
                    setDashboardData(response.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Logout implementation mirroring the confirmation criteria[cite: 1]
    const handleLogoutConfirm = async () => {
        setShowLogoutModal(false);

        try {
            const refresh = sessionStorage.getItem("refresh");

            if (refresh) {
                await api.post("logout/", { refresh });
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("access");
            sessionStorage.removeItem("refresh");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("userData");
            sessionStorage.removeItem("user_type");
            sessionStorage.removeItem("admin_id");

            sessionStorage.clear();

            navigate("/");
        }
    };

    // Use API data or fallback to local data
    const overviewStats = dashboardData.overview_stats.length > 0 ?
        dashboardData.overview_stats : [
            { label: 'All Jobs', count: jobs.length, icon: TotalJobs, tabName: 'Job Monitoring' },
            { label: 'Total Companies', count: 50, icon: TotalCompanies, tabName: 'Activity Monitoring' },
            { label: 'Total Employers', count: 50, icon: TotalEmployers, query: "Employers" },
            { label: 'Total Jobseekers', count: Alluser.length, icon: TotalJobseekers, query: "Jobseeker" },
        ];

    // Enhanced overview stats with icons
    const overviewStatsWithIcons = overviewStats.map(stat => {
        if (stat.label === 'All Jobs') return { ...stat, icon: TotalJobs };
        if (stat.label === 'Total Companies') return { ...stat, icon: TotalCompanies };
        if (stat.label === 'Total Employers') return { ...stat, icon: TotalEmployers };
        if (stat.label === 'Total Jobseekers') return { ...stat, icon: TotalJobseekers };
        return stat;
    });

    // Use API highlighted jobs or fallback
    const jobAds = dashboardData.highlighted_jobs.length > 0 ?
        dashboardData.highlighted_jobs :
        jobs.filter(job => job.isHighlighted === true);

    // Use API admin stats or fallback
    const adminStatsData = dashboardData.admin_stats.length > 0 ?
        dashboardData.admin_stats.map(stat => ({
            ...stat,
            icon: stat.title === 'Total Users' ? YellowProfile :
                stat.title === 'Total Jobs Posted' ? TotalJobsPosted :
                    stat.title === 'Total Applications' ? Application :
                        stat.title === 'Total Revenue' ? Revenue :
                            TotalSubscribers
        })) : [
            { title: "Total Users", icon: YellowProfile, value: "245", trend: "8.2%", isUp: true },
            { title: "Total Jobs Posted", icon: TotalJobsPosted, value: "245", trend: "8.2%", isUp: true },
            { title: "Total Applications", icon: Application, value: "245", trend: "4.2%", isUp: false },
            { title: "Total Revenue", icon: Revenue, value: "245", trend: "8.2%", isUp: true },
            { title: "Total Subscribers", icon: TotalSubscribers, value: "245", trend: "8.2%", isUp: true },
        ];

    // Use API chart data or fallback
    const UserGrowth = dashboardData.user_growth_chart.length > 0 ?
        dashboardData.user_growth_chart : [
            { name: 'Aug', users: 750 }, { name: 'Sep', users: 200 },
            { name: 'Oct', users: 640 }, { name: 'Nov', users: 310 },
            { name: 'Dec', users: 300 }, { name: 'Jan', users: 570 },
            { name: 'Feb', users: 430 }, { name: 'Mar', users: 960 },
            { name: 'Apr', users: 250 }
        ];

    const JobPostings = dashboardData.job_postings_chart.length > 0 ?
        dashboardData.job_postings_chart : [
            { name: 'Aug', postings: 120 }, { name: 'Sep', postings: 200 },
            { name: 'Oct', postings: 150 }, { name: 'Nov', postings: 80 },
            { name: 'Dec', postings: 450 }, { name: 'Jan', postings: 110 },
            { name: 'Feb', postings: 130 }, { name: 'Mar', postings: 330 },
            { name: 'Apr', postings: 400 }
        ];

    const Activities = dashboardData.activities_chart.length > 0 ?
        dashboardData.activities_chart : [
            { name: 'Jan', newUsers: 300, jobsPosted: 200, subscribers: 400 },
            { name: 'Feb', newUsers: 300, jobsPosted: 200, subscribers: 400 },
            { name: 'Mar', newUsers: 300, jobsPosted: 200, subscribers: 400 },
            { name: 'Apr', newUsers: 300, jobsPosted: 200, subscribers: 400 }
        ];

    const LegendItem = ({ color, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
            <span style={{ fontSize: '12px', color: '#666' }}>{label}</span>
        </div>
    );

    const handleViewMore = (stat) => {
        if (stat.label === 'Total Companies') {
            setSubTab('CompanyApproval');
            setActiveTab('Activity Monitoring');
            return;
        }

        if (stat.query) {
            let roleQuery = stat.query === "Employers" ? 'employer' : 'candidate';
            setActiveTab('User Management');
            navigate('/Job-portal/admin/Dashboard', { state: { filterRole: roleQuery } });
        } else if (stat.tabName) {
            setActiveTab(stat.tabName);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <>
                <AdminHeader />
                <div className='AdminContainer'>
                    <div className='Admin-Sidebar'>
                        <h2 style={{ textAlign: "center", marginTop: "35px" }}>Administrator</h2>
                        <div className='Admin-Sidebar-list'>
                            <div onClick={() => setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === 'Dashboard' ? <img src={Dashboard} width={15} height={15} alt="dashboard" />
                                        : <img src={DashboardInact} width={20} height={20} alt="dashboard" />}
                                    <div className='Enav-item'>Dashboard</div>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab("Job Monitoring")} className={activetab === "Job Monitoring" ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === "Job Monitoring" ? <img src={JobMonitorACT} width={15} height={15} alt="dashboard" />
                                        : <img src={JobMonitor} width={15} height={15} alt="Job Monitoring" />}
                                    <div className='Enav-item'>Job Monitoring</div>
                                </div>
                            </div>
                            <div onClick={() => { setActiveTab('Activity Monitoring'); setSubTab('AdminMonitor') }} className={activetab === "Activity Monitoring" ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === "Activity Monitoring" ? <img src={ActivityMonAct} width={15} height={15} alt="dashboard" />
                                        : <img src={ActivityMon} width={15} height={15} alt="Activity Monitoring" />}
                                    <div className='Enav-item'>Activity Monitoring</div>
                                </div>
                            </div>
                            <div onClick={() => { setActiveTab('User Management'); navigate('/Job-portal/admin/Dashboard') }} className={activetab === "User Management" ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === "User Management" ? <img src={UserManagementACT} width={15} height={15} alt="dashboard" />
                                        : <img src={UserManagements} width={15} height={15} alt="User Management" />}
                                    <div className='Enav-item'>User Management</div>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('Membership')} className={activetab === "Membership" ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === "Membership" ? <img src={MembershipsAct} width={15} height={15} alt="dashboard" />
                                        : <img src={Memberships} width={15} height={15} alt="Membership" />}
                                    <div className='Enav-item'>Membership</div>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('SupportHub')} className={activetab === "SupportHub" ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === "SupportHub" ? <img src={TicketsACT} width={15} height={15} alt="dashboard" />
                                        : <img src={Tickets} width={15} height={15} alt="Tickets" />}
                                    <div className='Enav-item'>Support Hub</div>
                                </div>
                            </div>
                            <div onClick={() => setActiveTab('settings')} className={activetab === "settings" ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === "settings" ? <img src={SettingsAct} width={15} height={15} alt="dashboard" />
                                        : <img src={Settings} width={15} height={15} alt="settings" />}
                                    <div className='Enav-item'>Settings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='Admin-MainSec'>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show error state
    if (error) {
        return (
            <>
                <AdminHeader />
                <div className='AdminContainer'>
                    <div className='Admin-Sidebar'>
                        <h2 style={{ textAlign: "center", marginTop: "35px" }}>Administrator</h2>
                        <div className='Admin-Sidebar-list'>
                            <div onClick={() => setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Admin-Active" : 'Admin-Navbar'}>
                                <div className='Admin-Navbox'>
                                    {activetab === 'Dashboard' ? <img src={Dashboard} width={15} height={15} alt="dashboard" />
                                        : <img src={DashboardInact} width={20} height={20} alt="dashboard" />}
                                    <div className='Enav-item'>Dashboard</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='Admin-MainSec'>
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <div style={{ color: 'red', marginBottom: '20px' }}>
                                <h3>Error Loading Dashboard</h3>
                                <p>{error}</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminHeader onLogoutClick={() => setShowLogoutModal(true)} />
            <div className='AdminContainer'>
                <div className='Admin-Sidebar'>
                    <h2 style={{ textAlign: "center", marginTop: "35px" }}>Administrator</h2>
                    <div className='Admin-Sidebar-list'>
                        <div onClick={() => setActiveTab('Dashboard')} className={activetab === 'Dashboard' ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === 'Dashboard' ? <img src={Dashboard} width={15} height={15} alt="dashboard" />
                                    : <img src={DashboardInact} width={20} height={20} alt="dashboard" />}
                                <div className='Enav-item'>Dashboard</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab("Job Monitoring")} className={activetab === "Job Monitoring" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Job Monitoring" ? <img src={JobMonitorACT} width={15} height={15} alt="dashboard" />
                                    : <img src={JobMonitor} width={15} height={15} alt="Job Monitoring" />}
                                <div className='Enav-item'>Job Monitoring</div>
                            </div>
                        </div>
                        <div onClick={() => { setActiveTab('Activity Monitoring'); setSubTab('AdminMonitor') }} className={activetab === "Activity Monitoring" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Activity Monitoring" ? <img src={ActivityMonAct} width={15} height={15} alt="dashboard" />
                                    : <img src={ActivityMon} width={15} height={15} alt="Activity Monitoring" />}
                                <div className='Enav-item'>Activity Monitoring</div>
                            </div>
                        </div>
                        <div onClick={() => { setActiveTab('User Management'); navigate('/Job-portal/admin/Dashboard'); }} className={activetab === "User Management" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "User Management" ? <img src={UserManagementACT} width={15} height={15} alt="dashboard" />
                                    : <img src={UserManagements} width={15} height={15} alt="User Management" />}
                                <div className='Enav-item'>User Management</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('Membership')} className={activetab === "Membership" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "Membership" ? <img src={MembershipsAct} width={15} height={15} alt="dashboard" />
                                    : <img src={Memberships} width={15} height={15} alt="Membership" />}
                                <div className='Enav-item'>Membership</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('SupportHub')} className={activetab === "SupportHub" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "SupportHub" ? <img src={TicketsACT} width={15} height={15} alt="dashboard" />
                                    : <img src={Tickets} width={15} height={15} alt="Tickets" />}
                                <div className='Enav-item'>Support Hub</div>
                            </div>
                        </div>
                        <div onClick={() => setActiveTab('settings')} className={activetab === "settings" ? "Admin-Active" : 'Admin-Navbar'}>
                            <div className='Admin-Navbox'>
                                {activetab === "settings" ? <img src={SettingsAct} width={15} height={15} alt="dashboard" />
                                    : <img src={Settings} width={15} height={15} alt="settings" />}
                                <div className='Enav-item'>Settings</div>
                            </div>
                        </div>
                        {/* Interactive Sidebar Logout Button targeting the criteria component definition */}
                        <div onClick={() => setShowLogoutModal(true)} className="Admin-Navbar" style={{ cursor: 'pointer' }}>
                            <div className="Admin-Navbox">
                                <img src={Logout} width={15} height={15} alt="Logout" />
                                <div className="Enav-item">Logout</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='Admin-MainSec'>
                    {activetab === 'Dashboard' && (
                        <div>
                            <div className='Admin-Welcome-Container'>
                                <p className='Admin-Welcome-Note'>Welcome Back, Admin</p>
                                <p className='Admin-Welcome-para'>Your team's success start here. lets make progress together!</p>
                            </div>

                            <div className='Admin-Overview'>
                                {overviewStatsWithIcons.map((stat, index) => (
                                    <div className='Admin-Overview-Container' key={index}>
                                        <div className='Admin-Overview-Data'>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                                                <img src={stat.icon} width={25} height={25} alt={stat.label} />
                                                <p style={{ fontSize: "24px", fontWeight: "700", color: "#484848" }}>{stat.count}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: "bold", color: "#484848" }}>{stat.label}</p>
                                            </div>
                                        </div>
                                        <div style={{ cursor: "pointer" }} onClick={() => handleViewMore(stat)} className='Admin-Viewmore'>
                                            <p style={{ fontSize: "14px", fontWeight: "500" }}>View more</p>
                                            <img src={ViewMore} width={30} height={30} alt="Viewmore" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
                                <div style={{ boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.15)", borderRadius: "15px", padding: "20px" }}>
                                    <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px' }}>Job Postings</h2>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={JobPostings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={30}>
                                                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                                <Tooltip />
                                                <Bar dataKey="postings" fill="#3b82f6" radius={[4, 4, 0, 0]} background={{ fill: '#f3f4f6', radius: [4, 4, 0, 0] }} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className='Admin-Job-Ads-Cont'>
                                    <div className="Admin-jobads-header">
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <h2 style={{ marginLeft: "25px" }}>Highlighted Jobs</h2>
                                            <img src={Highlight} width={22} alt="" />
                                        </div>
                                        <div className="Admin-jobads-buttons">
                                            <button onClick={() => setActiveTab('Highlighted Jobs')} className="Admin-create-btn">VIEW ALL</button>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", padding: "15px" }}>
                                        {jobAds.slice(0, 4).map((job, index) => (
                                            <div className="Admin-job-card" key={job.id || index}>
                                                <div className="Admin-job-left">
                                                    <p className="Admin-job-title">{job.title}</p>
                                                    <span className="Admin-job-under">{job.code || job.id}</span>
                                                </div>
                                                <div className="Admin-job-right">
                                                    <div className="Ads-Count-Cont">
                                                        <span className="Ads-Count">Posted On</span>
                                                        <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }}>{job.posted}</p>
                                                    </div>
                                                    <div className="Ads-Count-Cont">
                                                        <span className="Ads-Count">Highlighted on</span>
                                                        <p style={{ margin: "0", fontSize: "11px", color: "rgb(95, 94, 94)", fontWeight: "600" }}>{job.highlightOn}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 style={{ marginTop: "30px" }}>Analytical Reports</h2>
                                <div style={{ display: "flex", flexDirection: "column", marginTop: "25px" }}>
                                    <div className='Admin-Reports-Overview'>
                                        {adminStatsData.map((stat, index) => (
                                            <div key={index} className="admin-dash-card-container">
                                                <div className="admin-card-header">
                                                    <img src={stat.icon} width={30} alt={stat.title} />
                                                    <h3 className="admin-card-title">{stat.title}</h3>
                                                </div>
                                                <hr className="admin-divider" />
                                                <div className="admin-dash-stats-row">
                                                    <div className="admin-dash-stat-value-group">
                                                        <span style={{ fontSize: "16px" }}>{stat.value}</span>
                                                        <span style={{ fontSize: "14px" }}>Today</span>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <img src={stat.isUp ? CensusUp : CensusDown} width={10} alt={stat.isUp ? "Up" : "Down"} />
                                                        <span style={{ fontSize: "14px", paddingLeft: "5px", color: stat.isUp ? "#00C635" : "#F90C00" }}>
                                                            {stat.trend}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", justifyContent: "center", gap: "40px", marginTop: "50px" }}>
                                        <div style={{ boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.15)", padding: "20px", borderRadius: "15px" }}>
                                            <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px' }}>User Growth</h2>
                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={UserGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div style={{ boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.15)", padding: "20px", borderRadius: "15px" }}>
                                            <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px' }}>Activities</h2>
                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={Activities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorUsersNew" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0095FF" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#0095FF" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#FF4D4D" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#D946EF" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#D946EF" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} stroke="#eee" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                                        <Tooltip />
                                                        <Area type="monotone" dataKey="newUsers" stroke="#0095FF" strokeWidth={2} fillOpacity={1} fill="url(#colorUsersNew)" />
                                                        <Area type="monotone" dataKey="jobsPosted" stroke="#FF4D4D" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" />
                                                        <Area type="monotone" dataKey="subscribers" stroke="#D946EF" strokeWidth={2} fillOpacity={1} fill="url(#colorSubs)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                                                <LegendItem color="#0095FF" label="New Users" />
                                                <LegendItem color="#FF4D4D" label="Jobs Posted" />
                                                <LegendItem color="#D946EF" label="Subscribers" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "50px" }}>
                                <div className='Admin-Experience'>
                                    <AdminExperience experienceData={dashboardData.experience_levels} />
                                </div>
                                <div className='Admin-overview-cont'>
                                    <TotalOverview overviewData={dashboardData.total_overview} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activetab === 'Job Monitoring' && <JobMonitoring />}
                    {activetab === 'Activity Monitoring' && (
                        <ActivityMonitor currentTab={subTab} onTabChange={setSubTab} />
                    )}
                    {activetab === 'User Management' && (<UserManagement />)}
                    {activetab === 'Membership' && (<PublishedPlans />)}
                    {activetab === 'SupportHub' && (<SupportHub />)}
                    {activetab === 'settings' && (<AdminSettings />)}
                    {activetab === 'Highlighted Jobs' && (
                        <HighligtedJobs highlightedJobsData={dashboardData.highlighted_jobs} />
                    )}
                </div>
            </div>

            {/* Context-aware instance hook injection matching specifications */}
            <LogoutModal
                show={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutConfirm}
            />
        </>
    )
}