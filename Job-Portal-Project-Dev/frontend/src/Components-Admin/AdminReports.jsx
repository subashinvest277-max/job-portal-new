import React, { useState } from 'react'
import YellowProfile from '../assets/AdminAssets/YellowBGProfile.png'
import CensusDown from '../assets/AdminAssets/CENSUS_DOWN.png'
import CensusUp from '../assets/AdminAssets/CENSUS_UP.png'
import Revenue from '../assets/AdminAssets/Revenue.png'
import Application from '../assets/AdminAssets/TotalApplication.png'
import TotalJobsPosted from '../assets/AdminAssets/TotalJobsPosted.png'
import TotalSubscribers from '../assets/AdminAssets/TotalSubscribers.png'
import RightArrow from '../assets/AdminAssets/RightArrow.png'
import './AdminReports.css'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DetailedReport } from './DetailedReport';


export const AdminReports = () => {
  const [mode, SetMode]=useState('Reports and Analytics');
  const navigate =useNavigate();
  
  const UserGrowth = [
    { name: 'Aug', users: 750 },
    { name: 'Sep', users: 200 },
    { name: 'Oct', users: 640 },
    { name: 'Nov', users: 310 },
    { name: 'Dec', users: 300 },
    { name: 'Jan', users: 570 },
    { name: 'Feb', users: 430 },
    { name: 'Mar', users: 960 },
    { name: 'Apr', users: 250 },
  ];

  const JobPostings = [
    { name: 'Aug', postings: 120 },
    { name: 'Sep', postings: 200 },
    { name: 'Oct', postings: 150 },
    { name: 'Nov', postings: 80 },
    { name: 'Dec', postings: 450 },
    { name: 'Jan', postings: 110 },
    { name: 'Feb', postings: 130 },
    { name: 'Mar', postings: 330 },
    { name: 'Apr', postings: 400 },
  ];

  const Activities = [
    { name: 'Jan', newUsers: 300, jobsPosted: 200, subscribers: 400 },
    { name: 'Feb', newUsers: 300, jobsPosted: 200, subscribers: 400 },
    { name: 'Mar', newUsers: 300, jobsPosted: 200, subscribers: 400 },
    { name: 'Apr', newUsers: 300, jobsPosted: 200, subscribers: 400 },
  ];

  const PopularJobs = [
    { name: 'Other Jobs', value: 40, color: '#ffab5e' },
    { name: 'Full Stack Developer', value: 25, color: '#8b78ff' },
    { name: 'Front End Developer', value: 20, color: '#ff928a' },
    { name: 'UI/UX Designer', value: 15, color: '#4cc3db' },
  ];



  const LegendItem = ({ color, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
      <span style={{ fontSize: '12px', color: '#666' }}>{label}</span>
    </div>
  );
  return (
    
    <>
    {mode === "Reports and Analytics" && (
      <>
      <h2 style={{fontWeight: "500" }}>Reports and Analytics</h2>
      <div className='Admin-Reports-Overview'>

        <div className="admin-card-container">
          <div className="admin-card-header">
            <img src={YellowProfile} width={30} alt="New User" />
            <h3 className="admin-card-title">Total Users</h3>
          </div>

          <hr className="admin-divider" />

          <div className="admin-stats-row">
            <div className="admin-stat-value-group">
              <span style={{ fontSize: "16px" }}>245</span>
              <span style={{ fontSize: "14px" }}>Today</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={CensusUp} width={10} alt="Up" />
              <span style={{ fontSize: "14px", paddingLeft: "5px", color: "#00C635" }}>8.2%</span>
            </div>
          </div>
        </div>
        <div className="admin-card-container">
          <div className="admin-card-header">
            <img src={TotalJobsPosted} width={30} alt="New User" />
            <h3 className="admin-card-title">Total Jobs Posted</h3>
          </div>

          <hr className="admin-divider" />

          <div className="admin-stats-row">
            <div className="admin-stat-value-group">
              <span style={{ fontSize: "16px" }}>245</span>
              <span style={{ fontSize: "14px" }}>Today</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={CensusUp} width={10} alt="Up" />
              <span style={{ fontSize: "14px", paddingLeft: "5px", color: "#00C635" }}>8.2%</span>
            </div>
          </div>
        </div>
        <div className="admin-card-container">
          <div className="admin-card-header">

            <img src={Application} width={30} alt="New User" />

            <h3 className="admin-card-title">Total Applications</h3>
          </div>

          <hr className="admin-divider" />

          <div className="admin-stats-row">
            <div className="admin-stat-value-group">
              <span style={{ fontSize: "16px" }}>245</span>
              <span style={{ fontSize: "14px" }}>Today</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={CensusDown} width={10} alt="Up" />
              <span style={{ fontSize: "14px", paddingLeft: "5px", color: "#F90C00" }}>4.2%</span>
            </div>
          </div>
        </div>
        <div className="admin-card-container">
          <div className="admin-card-header">

            <img src={Revenue} width={30} alt="New User" />

            <h3 className="admin-card-title">Totals Revenue</h3>
          </div>

          <hr className="admin-divider" />

          <div className="admin-stats-row">
            <div className="admin-stat-value-group">
              <span style={{ fontSize: "16px" }}>245</span>
              <span style={{ fontSize: "14px" }}>Today</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={CensusUp} width={10} alt="Up" />
              <span style={{ fontSize: "14px", paddingLeft: "5px", color: "#00C635" }}>8.2%</span>
            </div>
          </div>
        </div>
        <div className="admin-card-container">
          <div className="admin-card-header">

            <img src={TotalSubscribers} width={30} alt="New User" />

            <h3 className="admin-card-title">Totals Subscribers</h3>
          </div>

          <hr className="admin-divider" />

          <div className="admin-stats-row">
            <div className="admin-stat-value-group">
              <span style={{ fontSize: "16px" }}>245</span>
              <span style={{ fontSize: "14px" }}>Today</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img src={CensusUp} width={10} alt="Up" />
              <span style={{ fontSize: "14px", paddingLeft: "5px", color: "#00C635" }}>8.2%</span>
            </div>
          </div>
        </div>

      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: '15px',margin:"10px" }}>

        <div style={{ padding: "20px", border: '1px solid #767676', borderRadius: "15px" }}>
          <div style={{
            width: '100%',
            height: 400,
            backgroundColor: '#fff',
            borderRadius: '15px'
          }}>
            <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px', paddingLeft: "40px" }}>
              User Growth
            </h2>

            <ResponsiveContainer width="100%" height="70%">
              <AreaChart data={UserGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>

                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ padding: "20px", border: '1px solid #767676', borderRadius: "15px" }}>
          <div style={{
            width: '100%',
            height: 400,
            borderRadius: '15px',
            // boxShadow: '0px 0px 15px rgba(0,0,0,0.05)' 
            // border: '1px solid black'
          }}>
            <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px', paddingLeft: "40px" }}>Job Postings</h2>

            <div style={{ width: '100%', height: '70%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={JobPostings}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={30}
                >
                  <CartesianGrid vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#999', fontSize: 12 }}
                    domain={[0, 500]}
                    ticks={[0, 100, 200, 300, 400, 500]}
                  />

                  {/* background "track" effect using background property */}
                  <Bar
                    dataKey="postings"
                    fill="#22c55e"  // The green color
                    radius={[4, 4, 0, 0]} // Rounded top corners
                    background={{ fill: '#f3f4f6', radius: [4, 4, 0, 0] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px", border: '1px solid #767676', borderRadius: "15px" }}>
          <div style={{
            width: '100%',
            height: 400,
            backgroundColor: '#fff',
            borderRadius: '12px',

            fontFamily: 'sans-serif'
          }}>
            <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px', paddingLeft: "40px" }}>
              Activities
            </h2>

            <ResponsiveContainer width="100%" height="70%">
              <AreaChart data={Activities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
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
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#999', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#999', fontSize: 12 }}
                  domain={[0, 500]}
                  ticks={[0, 100, 200, 300, 400, 500]}
                />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#0095FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="jobsPosted"
                  stroke="#FF4D4D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorJobs)"
                />
                <Area
                  type="monotone"
                  dataKey="subscribers"
                  stroke="#D946EF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSubs)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              <LegendItem color="#0095FF" label="New Users" />
              <LegendItem color="#FF4D4D" label="Jobs Posted" />
              <LegendItem color="#D946EF" label="Subscribers" />
            </div>

          </div>
        </div>

        <div style={{ padding: "20px", border: '1px solid #767676', borderRadius: "15px" }}>
           <div style={{
            width: '100%',
            height: 400,
            backgroundColor: '#fff',
            borderRadius: '12px',

            fontFamily: 'sans-serif'
          }}>
      <h2 style={{ fontFamily: 'sans-serif', color: '#333', marginBottom: '20px', paddingLeft: "40px" }}>Popular Jobs</h2>
      <div style={{ width: '100%', height: '70%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PopularJobs}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={95}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {PopularJobs.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",justifyContent:"center" }} >
        {PopularJobs.map((item, index) => (
          <div key={index} style={{display:"flex", alignItems:"center",gap:"5px ",margin:"10px",}}>
            <span 
              className="legend-dot" 
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="legend-text">{item.name}</span>
          </div>
        ))}
      </div>
     
        </div>
        </div>
      </div>
      <div style={{display:"flex", justifyContent:"center", }}>
      <div onClick={()=>SetMode("Detailed Report")}
      style={{display:"flex",alignItems:"center", margin:"25px 0px", padding:"7px 25px",borderRadius:"10px", border:"1px solid #767676",cursor:"pointer"}}>
      <span style={{ fontSize: '18px',fontWeight:"500",  color:"#1E88E5" }}>View detailed reports</span>
      <img style={{marginLeft:"10px"}} src={RightArrow} width={15} height={10} alt="->" />
      </div>
      </div>
      </>
    )}

    {mode === "Detailed Report" && (
      <>
      <DetailedReport SetMode={SetMode}/>
      </>
    )}
    </>
  )
}
