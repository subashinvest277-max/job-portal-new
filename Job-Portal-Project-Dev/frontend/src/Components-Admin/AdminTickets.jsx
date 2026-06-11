import React, { useState,useEffect } from 'react';
import './AdminTickets.css';
import TicketIcon from '../assets/AdminAssets/TicketsIcon.png';
import Priority from '../assets/AdminAssets/Priority.png';
import AdminCategory from '../assets/AdminAssets/AdminCategory.png';
import AdminStatus from '../assets/AdminAssets/AdminStatus.png';
import Enq from '../assets/AdminAssets/ApplicationSet.png';
import dwd from '../assets/AdminAssets/Download.png';
import { useJobs } from '../JobContext';
import api from '../api/axios';

export const AdminTickets = () => {
    const { raisedTickets, setRaisedTickets ,fetchTickets, ticketsLoading} = useJobs();
    const [selectedTickets,setSelectedTickets]=useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const statusOrder = { "Pending": 1, "In Progress": 2, "Resolved": 3 };

    useEffect(() => {
        fetchTickets();
    }, []);

    // const uniqueTickets = raisedTickets.filter(
    //     (ticket, index, self) => self.findIndex(t => t.id === ticket.id) === index
    // );

    const sortedTickets = raisedTickets.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    const handleDropdownChange = (e) => {
    const newValue = e.target.value;
    setSelectedTickets((prev) => {
        if (!prev) return null;
        return { ...prev, status: newValue };
    });
};

const handleEditStatusClick = () => {
    if (!selectedTickets) {
        alert("Please select a ticket first!");
        return;
    }
    setIsModalOpen(true); 
};

// const timestamp = Date.now()
// const handleStatusSelection = (newStatus) => {
//     if(newStatus !== "Resolved"){
//     setSelectedTickets((prev) => ({ ...prev, status: newStatus }));
//     setRaisedTickets((prevList) =>
//         prevList.map((ticket) =>
//             ticket.id === selectedTickets.id ? { ...ticket, status: newStatus } : ticket
//         )
//     );}
//     else{
//     setSelectedTickets((prev) => ({ ...prev, status: newStatus }));
//     setRaisedTickets((prevList) =>
//         prevList.map((ticket) =>
//             ticket.id === selectedTickets.id ? { ...ticket, status: newStatus, resolvedon: new Date(Date.now()).toLocaleDateString('en-GB') } : ticket
//         )
//     );}
//     setIsModalOpen(false);
// };


// const handleDeleteTicket = () => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
//     if (!confirmDelete) return;
//     setRaisedTickets((prev) => prev.filter((t) => t.id !== selectedTickets.id));
//     setSelectedTickets(null);
// };

 const handleStatusSelection = async (newStatus) => {
        try {
            await api.patch(`/admin/tickets/${selectedTickets.id}/update/`, {
                status: newStatus
            });
            
            if(newStatus !== "Resolved"){
                setSelectedTickets((prev) => ({ ...prev, status: newStatus }));
                setRaisedTickets((prevList) =>
                    prevList.map((ticket) =>
                        ticket.id === selectedTickets.id ? { ...ticket, status: newStatus } : ticket
                    )
                );
            } else {
                setSelectedTickets((prev) => ({ ...prev, status: newStatus, resolvedon: new Date(Date.now()).toLocaleDateString('en-GB') }));
                setRaisedTickets((prevList) =>
                    prevList.map((ticket) =>
                        ticket.id === selectedTickets.id ? { ...ticket, status: newStatus, resolvedon: new Date(Date.now()).toLocaleDateString('en-GB') } : ticket
                    )
                );
            }
            setIsModalOpen(false);
            alert(`Status changed to "${newStatus}" successfully!`);
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status. Please try again.");
        }
    };

  
    const handleDeleteTicket = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this ticket?");
        if (!confirmDelete) return;
        
        try {
            await api.delete(`/admin/tickets/${selectedTickets.id}/delete/`);
            setRaisedTickets((prev) => prev.filter((t) => t.id !== selectedTickets.id));
            setSelectedTickets(null);
            alert("Ticket deleted successfully!");
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete ticket. Please try again.");
        }
    };
    return (
        <>
        {!selectedTickets ? (
        <div className="AdminTickets-container">
            <div className="AdminTickets-header">
                <div>
                    <h2>Raised Tickets</h2>
                    <p>Manage and review all user raised tickets</p>
                </div>
            </div>

            <div className="AdminTickets-table-wrapper">
                <table className="AdminTickets-table">
                    <thead>
                        <tr>
                            <th>TICKET ID</th>
                            <th>SUBJECT</th>
                            <th>USER</th>
                            <th>CATEGORY</th>
                            <th style={{paddingLeft:"40px"}}>PRIORITY</th>
                            <th>RECEIVED at</th>
                            <th>RESOLVED on</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedTickets.map((ticket, index) => (
                            <tr key={ticket.id || index}>
                                <td>{ticket.id}</td>
                                <td>{ticket.subject}</td>
                                <td>{ticket.name}</td>
                                <td>{ticket.category}</td>
                                <td><span style={{display:"flex",justifyContent:"center"}} className={`Escalation-priority ${ticket.priority}`}>{ticket.priority}</span></td>
                                <td>{ticket.date}</td>
                                <td>{ticket.resolvedon? ticket.resolvedon : ticket.status}</td>
                                <td><button style={{background:"#1E88E5",color:"white",borderRadius:"5px",
                                    padding:"7px 10px",outline:"none",border:"none"
                                }} onClick={()=>{setSelectedTickets(ticket)}}>View Details</button>
                                    
                                </td>
                                {/* <td>{ticket.date}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        ):(
        <div className="Adm-tic-container">
      <div className="Adm-tic-top-nav">
        <button onClick={()=>setSelectedTickets(null)} className="Adm-tic-btn-back">Back to Tickets</button>
      </div>

      <div className="Adm-tic-header-section">
        <div className="Adm-tic-title-block">
          <img src={TicketIcon} width={65} alt='' />
          
            <div>
            <h1 className="Adm-tic-main-title">{selectedTickets.subject}</h1>
            <p className="Adm-tic-id">{selectedTickets.id}</p>
            <p className="Adm-tic-date-created">Created on : {selectedTickets.date}</p>
            </div>
            <div>
          </div>
          
        </div>
        <div className="Adm-tic-meta-info">
          <div className="Adm-tic-meta-row">
            <img src={Priority}  width={15} height={15} alt="Priority" />
            <span style={{paddingLeft:"15px"}} className="Adm-tic-meta-label"> Priority :</span>
            <span className="Adm-tic-meta-value Adm-tic-priority-medium">{selectedTickets.priority}</span>
          </div>
          <div className="Adm-tic-meta-row">
             <img src={AdminCategory} width={15} height={15} alt="AdminCategory" />
            <span style={{paddingLeft:"15px"}} className="Adm-tic-meta-label"> Category :</span>
            <span className="Adm-tic-meta-value">{selectedTickets.category}</span>
          </div>
          <div className="Adm-tic-meta-row">
             <img  src={AdminStatus} width={15} height={15} alt="AdminStatus" />
            <span style={{paddingLeft:"15px"}} className="Adm-tic-meta-label"> Status :</span>
            <span  className={`AdminTickets-status ${selectedTickets.status.replace(/\s/g, "")}`}>{selectedTickets.status}</span>
          </div>
        </div>
      </div>
       <div className="Adm-tic-user-section">
            <h2 className="Adm-tic-section-title">User Information</h2>
            <div className="Adm-tic-user-grid">
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">Name :</span> <input type="text" disabled value={selectedTickets.name} /></div>
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">Mobile number :</span><input type='text' disabled value={selectedTickets.mobile}/></div>
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">Mail ID :</span><input disabled value={selectedTickets.email}/></div>
              <div className="Adm-tic-grid-row"><span className="Adm-tic-grid-label">User :</span><input disabled value={selectedTickets.category}/></div>
            </div>
          </div>

      <div className="Adm-tic-main-content">
        <div className="Adm-tic-left-panel">
          <div className="Adm-tic-details-section">
            <h2 className="Adm-tic-section-title">Description :</h2>
            <p className="Adm-tic-description">{selectedTickets.message}</p>
            
            
            <div className="Adm-tic-attachment-block">
              <span className="Adm-tic-attachment-label">Attachment</span>
              <div className="Adm-tic-attachment-card">
                <img style={{paddingRight:"10px"}} src={Enq} width={15} alt="AdminStatus" />
                <span className="Adm-tic-file-name">Screenshot_2026-05-11.png</span>
                <span className="Adm-tic-file-size">245 KB</span>
                <img src={dwd} width={15}alt='download' className="Adm-tic-download-btn"/>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <div className="Adm-tic-top-actions">
          <button onClick={()=>setIsModalOpen(!isModalOpen)} className="Adm-tic-btn-action">Edit Status</button>
          <button onClick={handleDeleteTicket} className="Adm-tic-btn-action Adm-tic-btn-delete">Delete</button>
        </div>

        {isModalOpen && (
        <div className="status-modal-overlay">
            <div className="status-modal-content">
                <h3>Select Status</h3>
               
                <div className="status-modal-options">
                    <button onClick={() => handleStatusSelection("In Progress")}>In Progress</button>
                    <button onClick={() => handleStatusSelection("Hold")}>Hold</button>
                    <button onClick={() => handleStatusSelection("Resolved")}>Resolved</button>
                </div>
 
                <button className="status-modal-cancel" onClick={() => setIsModalOpen(false)}>
                    Cancel
                </button>
            </div>
        </div>
        )}
    
    </div>
)}

        
        </>
    );
};