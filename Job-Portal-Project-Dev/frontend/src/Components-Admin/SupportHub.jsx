import React, { useState } from 'react'
import './SupportHub.css'
import { AdminTickets } from './AdminTickets'
import { Escalation } from './Escalation'
import { Enquiries } from './Enquiries'
// import { Tickets } from './AdminTickets'
// import { Escalation } from './Escalation'
// import { Enquiries } from './Enquiries'

export const SupportHub = () => {
    const [activeTab, setActiveTab] = useState("Tickets")

    return (
        <div className="SupportHub-container">
            <div className="SupportHub-tabs">
                <button className={`Ad-Settings-select ${activeTab === "Tickets" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Tickets")}
                >
                    Tickets
                </button>

                <button className={`Ad-Settings-select ${activeTab === "Escalation" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Escalation")}
                >
                    Escalation         {/* Escalation,Fraud Reports,Complaints,Flagged jobs, */}
                </button>

                <button className={`Ad-Settings-select ${activeTab === "Enquiries" ? "Ad-Settings-active" : ""}`}
                    onClick={() => setActiveTab("Enquiries")}
                >
                    Enquiries
                </button>
            </div>

            <div className="SupportHub-content">
                {activeTab === "Tickets" && (<AdminTickets />)}
                {activeTab === "Escalation" && (<Escalation />)}
                {activeTab === "Enquiries" && (<Enquiries />)}
            </div>
        </div>
    )
}
