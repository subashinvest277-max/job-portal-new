import React, { useState } from "react";
import "./FinancialReport.css";
import PlatformTraffic from '../assets/AdminAssets/PlatformTraffic.png';
import SessionTime from '../assets/AdminAssets/SessionTime.png';
import Star from '../assets/AdminAssets/Star_icon.png';
import GlobalTech from '../assets/AdminAssets/GlobalTech.png';
import DynamicCreative from '../assets/AdminAssets/DynamicCreative.png';
import UnifiedMedia from '../assets/AdminAssets/UnifiedMedia.png';
 
export const FinancialReport = () => {
  const [showMore, setShowMore] = useState(false);
 
  return (
    <div className="financial-container">
 
      <div className="report-header">
        <h1>Financial Intelligence</h1>
        <p>Reporting for period March 1st — March 24th, 2026</p>
      </div>
 
      {/* Top Section */}
      <div className="top-cards">
 
        <div className="revenue-card-primary">
          <p className="card-title">TOTAL GROSS REVENUE</p>
          <h1>$4,281,902.50</h1>
         
          <div className="growth-badge trend-up">
            <span className="trend-arrow">↗</span>
            <span className="trend-value">+12.4%</span>
            <span className="vs">vs. previous month</span>
          </div>
 
          <div className="sub-data">
            <div className="data-item">
              <p>SUBSCRIPTION</p>
              <h4>$3,104,200</h4>
            </div>
            <div className="data-item">
              <p>AD REVENUE</p>
              <h4>$1,177,702</h4>
            </div>
          </div>
        </div>
 
        <div className="side-cards">
          <div className="mini-card">
            <div className="mini-header">
              <p className="mini-title">PLATFORM TRAFFIC</p>
              <img src={PlatformTraffic} alt="Traffic" className="mini-icon" />
            </div>
            <h2>1.4M <span className="positive">+4.2% daily</span></h2>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: "70%" }}></div>
            </div>
          </div>
 
          <div className="mini-card">
            <div className="mini-header">
              <p className="mini-title">AVG. SESSION TIME</p>
              <img src={SessionTime} alt="Time" className="mini-icon" />
            </div>
            <h2>14m 32s <span className="negative">-2.1% weekly</span></h2>
            <div className="bars-row">
              <span className="bar-chunk"></span>
              <span className="bar-chunk"></span>
              <span className="bar-chunk"></span>
              <span className="bar-chunk"></span>
              <span className="bar-chunk active"></span>
            </div>
          </div>
        </div>
      </div>
 
      <div className="middle-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h4>Daily Active Users & Conversion</h4>
            <div className="legend">
              <span className="leg-item"><span className="dot light"></span> Visits</span>
              <span className="leg-item"><span className="dot blue"></span> Conv %</span>
            </div>
          </div>
 
          <div className="visual-chart">
            {[
              { day: "MON", gray: "40%", blue: "0%" },
              { day: "TUE", gray: "65%", blue: "0%" },
              { day: "WED", gray: "55%", blue: "0%" },
              { day: "THU", gray: "80%", blue: "0%" },
              { day: "FRI", gray: "95%", blue: "85%", tooltip: "28.4k" },
              { day: "SAT", gray: "60%", blue: "0%" },
              { day: "SUN", gray: "45%", blue: "0%" },
            ].map((item, index) => (
              <div className="bar-container" key={index}>
                <div className="bar-stack">
                  <div className="bar-gray" style={{ height: item.gray }}></div>
                  {item.blue !== "0%" && (
                    <>
                      <div className="tooltip">{item.tooltip}</div>
                      <div className="bar-blue" style={{ height: item.blue }}></div>
                    </>
                  )}
                </div>
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>
 
        <div className="insight-card">
          <h4>Employer Tier Insights</h4>
         
          <div className="tier-row">
            <div className="tier-content">
              <span className="tier-name">Premium Enterprise</span>
              <span className="tier-count">124 <b>accounts</b></span>
            </div>
          </div>
 
          <div className="tier-row">
            <div className="tier-content">
              <span className="tier-name">Mid-Market Growth</span>
              <span className="tier-count">482 <b>accounts</b></span>
            </div>
          </div>
 
          <div className="tier-row no-border">
            <div className="tier-content">
              <span className="tier-name">Standard Basic</span>
              <span className="tier-count">2.1k <b>accounts</b></span>
            </div>
          </div>
 
          <div className="star-highlight">
            <div className="star-circle">
              <img src={Star} alt="Star" className="star-img" />
            </div>
            <div className="star-text">
              <p className="label">Top Performing Tier</p>
              <p className="value">Enterprise (+22% YoY)</p>
            </div>
          </div>
        </div>
      </div>
 
      {/* Table Section */}
      <div className="revenue-table-container">
        <h2 className="revenue-title">Recent Ad Revenue & Payments</h2>
        <table className="revenue-table">
          <thead>
            <tr>
              <th>ADVERTISER / ACCOUNT</th>
              <th>TRANSACTION ID</th>
              <th>STATUS</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="advertiser-account">
                  <div className="icon-bg"><img src={GlobalTech} alt="Global Tech" /></div>
                  <div>
                    <p className="name">Global Tech Solutions</p>
                    <span className="sub">Premium Ad Placement</span>
                  </div>
                </div>
              </td>
              <td className="txn">#TXN-882910</td>
              <td><span className="status completed">COMPLETED</span></td>
              <td className="amount">$14,500.00</td>
            </tr>
            <tr>
              <td>
                <div className="advertiser-account">
                  <div className="icon-bg"><img src={DynamicCreative} alt="Dynamic Creative" /></div>
                  <div>
                    <p className="name">Dynamic Creatives Inc.</p>
                    <span className="sub">Newsletter Sponsorship</span>
                  </div>
                </div>
              </td>
              <td className="txn">#TXN-882911</td>
              <td><span className="status processing">PROCESSING</span></td>
              <td className="amount">$8,250.00</td>
            </tr>
            <tr>
              <td>
                <div className="advertiser-account">
                  <div className="icon-bg"><img src={UnifiedMedia} alt="Unified Media" /></div>
                  <div>
                    <p className="name">Unified Media Group</p>
                    <span className="sub">Sidebar Display (Monthly)</span>
                  </div>
                </div>
              </td>
              <td className="txn">#TXN-882912</td>
              <td><span className="status completed">COMPLETED</span></td>
              <td className="amount">$22,400.00</td>
            </tr>
            {showMore && (
              <>
                <tr>
                  <td>
                    <div className="advertiser-account">
                      <div className="icon-bg"><img src={DynamicCreative} alt="Dynamic" /></div>
                      <div>
                        <p className="name">Dynamic Creative INC</p>
                        <span className="sub">Newsletter Sponsorship</span>
                      </div>
                    </div>
                  </td>
                  <td className="txn">#TXN-882913</td>
                  <td><span className="status processing">PROCESSING</span></td>
                  <td className="amount">$5,600.00</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <div className="ledger-btn" onClick={() => setShowMore(!showMore)}>
          {showMore ? "HIDE LEDGER" : "VIEW FULL LEDGER"}
        </div>
      </div>
    </div>
  );
};