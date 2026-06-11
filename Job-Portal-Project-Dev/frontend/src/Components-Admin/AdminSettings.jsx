import React, { useState } from 'react'
import './AdminSettings.css'
import { AdminNotificationSettings } from './AdminNotificationSettings'
import { AdminSecuritySettings } from './AdminSecuritySettings'
import { AdminSecurity } from './AdminSecurity'
import { EmployerSettings } from './EmployerSettings'
import { JobSeekerSettings } from './JobSeekerSettings'

export const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState("Jobseeker & Employer Settings")
    const [selectTab, setselectTab] = useState("Jobseeker Settings")

    
    return (
        <div>
            {/* <h1>Settings</h1> */}
            <div style={{ display: "flex", justifyContent: "space-around", gap: "10px", border: "1px solid rgba(0, 0, 0, 0.15)", padding: "28px 45px", borderRadius: "10px" }}>

                <button
                    className={`Ad-Settings-select ${activeTab === "Jobseeker & Employer Settings" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Jobseeker & Employer Settings")}
                >Jobseeker & Employer Settings</button>

                <button
                    className={`Ad-Settings-select ${activeTab === "Notification Settings" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Notification Settings")}
                >Notification Settings</button>
                <button
                    className={`Ad-Settings-select ${activeTab === "Security Settings" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Security Settings")}
                >Security Settings</button>
            </div>

            {activeTab === "Jobseeker & Employer Settings" && (
                <>
                <div style={{marginTop:"35px", display:"flex", justifyContent:"center",gap:"80px"}}>
                    <button
                    className={`Ad-Settings-select ${selectTab === "Jobseeker Settings" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setselectTab("Jobseeker Settings")}
                >Jobseeker Settings</button>

                <button
                    className={`Ad-Settings-select ${selectTab === "Employer Settings" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setselectTab("Employer Settings")}
                >Employer Settings</button>
                </div>
                
                 {selectTab==="Jobseeker Settings"&&(
                    <JobSeekerSettings/>
                 )}  

                 {selectTab==="Employer Settings"&&(
                    <EmployerSettings/>
                 )}   
                
                </>
            )}
            
            {activeTab === "Notification Settings" && (
                <><AdminNotificationSettings /></>
            )}
            {activeTab === "Security Settings" && (
                <><AdminSecurity/></>
            )}
            
        </div>
    )
}