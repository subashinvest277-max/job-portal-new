import React, { useState, useEffect } from 'react';
import './PaymentMethods.css';

// ----------------- UPI & TAB ASSETS -----------------
import amazonpay from '../assets/Billing/amazonpay.png';
import phonepe from '../assets/Billing/Phonepe.png';
import paytm from '../assets/Billing/Paytm.png';
import Gpay from '../assets/Billing/Gpay.png';
import netbanking_icon from '../assets/Billing/netbanking_icon.png';
import upi_icon from '../assets/Billing/upi_icon.png';
import creditcard_icon from '../assets/Billing/creditcard_icon.png';

// ----------------- BANK LOGO ASSETS -----------------
import kotak_mahindra_logo from '../assets/Billing/Kotak Mahindra.png';
import uco_bank_logo from '../assets/Billing/UCO Bank.png';
import deutsche_bank_logo from '../assets/Billing/Deutsche Bank.png';
import city_union_logo from '../assets/Billing/City Union.png';
import south_indian_bank_logo from '../assets/Billing/South Indian Bank.png';
import indian_overseas_bank_logo from '../assets/Billing/Indian Overseas Bank.png';
import icici_logo from '../assets/Billing/ICICI.png';
import bank_of_maharashtra_logo from '../assets/Billing/Bank of Maharashtra.png';
import tmb_logo from '../assets/Billing/TMB.png';
import central_bank_of_india_logo from '../assets/Billing/Central Bank of India.png';
import karur_vysya_logo from '../assets/Billing/Karur Vysya.png';
import dbs_logo from '../assets/Billing/DBS.png';
import obc_logo from '../assets/Billing/OBC.png';
import saraswat_bank_logo from '../assets/Billing/Saraswat Bank.png';
import federal_logo from '../assets/Billing/Federal.png';
import idbi_logo from '../assets/Billing/IDBI.png';
import standard_chartered_logo from '../assets/Billing/Standard Chartered.png';
import indian_bank_logo from '../assets/Billing/Indian Bank.png';
import idfc_logo from '../assets/Billing/IDFC.png';
import bank_of_india_logo from '../assets/Billing/Bank of India.png';
import vijaya_bank_logo from '../assets/Billing/Vijaya Bank.png';
import canara_bank_logo from '../assets/Billing/Canara Bank.png';
import dena_bank_logo from '../assets/Billing/Dena Bank.png';
import union_bank_logo from '../assets/Billing/Union Bank.png';
import rbl_logo from '../assets/Billing/RBL.png';
import pnb_logo from '../assets/Billing/PNB.png';
import hsbc_logo from '../assets/Billing/HSBC.png';
import bank_of_baroda_logo from '../assets/Billing/Bank of Baroda.png';
import sbi_logo from '../assets/Billing/SBI.png';
import hdfc_logo from '../assets/Billing/HDFC.png';
import indusind_logo from '../assets/Billing/IndusInd.png';
import citi_bank_logo from '../assets/Billing/Citi Bank.png';

const bankList = [
    { id: 'canara', name: 'Canara Bank', logo: canara_bank_logo },
    { id: 'karur', name: 'Karur Vysya', logo: karur_vysya_logo },
    { id: 'citi', name: 'Citi Bank', logo: citi_bank_logo },
    { id: 'vijaya', name: 'Vijaya Bank', logo: vijaya_bank_logo },
    { id: 'central', name: 'Central Bank of India', logo: central_bank_of_india_logo },
    { id: 'indusind', name: 'IndusInd', logo: indusind_logo },
    { id: 'boi', name: 'Bank of India', logo: bank_of_india_logo },
    { id: 'tmb', name: 'TMB', logo: tmb_logo },
    { id: 'hdfc', name: 'HDFC', logo: hdfc_logo },
    { id: 'idfc', name: 'IDFC', logo: idfc_logo },
    { id: 'bom', name: 'Bank of Maharashtra', logo: bank_of_maharashtra_logo },
    { id: 'sbi', name: 'SBI', logo: sbi_logo },
    { id: 'indian', name: 'Indian Bank', logo: indian_bank_logo },
    { id: 'icici', name: 'ICICI', logo: icici_logo },
    { id: 'bob', name: 'Bank of Baroda', logo: bank_of_baroda_logo },
    { id: 'sc', name: 'Standard Chartered', logo: standard_chartered_logo },
    { id: 'iob', name: 'Indian Overseas Bank', logo: indian_overseas_bank_logo },
    { id: 'hsbc', name: 'HSBC', logo: hsbc_logo },
    { id: 'idbi', name: 'IDBI', logo: idbi_logo },
    { id: 'sib', name: 'South Indian Bank', logo: south_indian_bank_logo },
    { id: 'pnb', name: 'PNB', logo: pnb_logo },
    { id: 'federal', name: 'Federal', logo: federal_logo },
    { id: 'cub', name: 'City Union', logo: city_union_logo },
    { id: 'rbl', name: 'RBL', logo: rbl_logo },
    { id: 'saraswat', name: 'Saraswat Bank', logo: saraswat_bank_logo },
    { id: 'deutsche', name: 'Deutsche Bank', logo: deutsche_bank_logo },
    { id: 'union', name: 'Union Bank', logo: union_bank_logo },
    { id: 'obc', name: 'OBC', logo: obc_logo },
    { id: 'uco', name: 'UCO Bank', logo: uco_bank_logo },
    { id: 'dena', name: 'Dena Bank', logo: dena_bank_logo },
    { id: 'dbs', name: 'DBS', logo: dbs_logo },
    { id: 'kotak', name: 'Kotak Mahindra', logo: kotak_mahindra_logo }
];

export const PaymentMethods = ({ onBack, onSave, onCancel, cardOnlyMode = false, defaultTab = 'card', onAddMethod, savedCards = [], onMakeDefault, onDelete, onProcessPayment }) => {
    const [cardColor, setCardColor] = useState('#2d3436');
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [selectedUpiApp, setSelectedUpiApp] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [selectedBank, setSelectedBank] = useState(null);
    const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvc: '' });
    const filteredBanks = bankList.filter(bank =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase())
    );
    const [isVerifying, setIsVerifying] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedCardForOtp, setSelectedCardForOtp] = useState(null);

    useEffect(() => {
        if (cardOnlyMode) {
            setActiveTab('card');
        } else {
            setActiveTab(defaultTab);
        }
    }, [cardOnlyMode, defaultTab]);

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    useEffect(() => {
        const num = cardData.number.replace(/\s?/g, '');
        if (num.startsWith('4')) {
            setCardColor('#2ecc71');
        } else if (num.startsWith('5')) {
            setCardColor('#3498db');
        } else if (num.startsWith('3')) {
            setCardColor('#9b59b6');
        } else {
            setCardColor('#2d3436');
        }
    }, [cardData.number]);

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            // Remove any non-digit characters
            const cleaned = value.replace(/\D/g, '');
            // Limit to 16 digits
            const truncated = cleaned.slice(0, 16);
            // Add space every 4 digits
            formattedValue = truncated.replace(/(.{4})/g, '$1 ').trim();
        }
        else if (name === 'expiry') {
            // Remove any non-digit characters
            let cleaned = value.replace(/\D/g, '');
            // Limit to 4 digits (MMYY)
            cleaned = cleaned.slice(0, 4);
            if (cleaned.length >= 2) {
                formattedValue = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
            } else {
                formattedValue = cleaned;
            }
        }
        else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '');
            formattedValue = formattedValue.slice(0, 3);
        }
        else {
            formattedValue = value.replace(/[^a-zA-Z\s\-]/g, '');
        }

        setCardData(prev => ({ ...prev, [name]: formattedValue }));
    };
    const handleSavedCardClick = (card) => {
        setSelectedCardForOtp(card);
        setShowOtp(true);
    };

    const handleCardSubmit = (e) => {
        e.preventDefault();

        if (!cardData.number || !cardData.cvc || !cardData.expiry) {
            alert("Please fill all card details");
            return;
        }

        const expiryPattern = /^(0[1-9]|1[0-2])\/(\d{2})$/;
        if (!expiryPattern.test(cardData.expiry)) {
            alert("Please enter valid expiry date in MM/YY format");
            return;
        }

        const last4 = cardData.number.slice(-4) || 'XXXX';

        const paymentData = {
            method_type: "card",
            card_last4: last4,
            card_holder_name: cardData.name,
            expiry_date: cardData.expiry
        };

        console.log('Sending payment data:', paymentData);

        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            onSave(paymentData);
            setCardData({ name: '', number: '', expiry: '', cvc: '' });
        }, 1500);
    };

    // UPI Submit - CORRECT
    const handleUpiVerifyAndPay = (e) => {
        if (e) e.preventDefault();
        if (!upiId.includes('@')) return alert("Please enter a valid UPI ID");

        const paymentData = {
            method_type: "upi",
            upi_id: upiId
        };

        setIsVerifying(true);
        setTimeout(() => {
            onSave(paymentData);
            //  Only process payment, don't save UPI as card
            if (onProcessPayment) {
                onProcessPayment(paymentData);
            }
            setIsVerifying(false);
            setUpiId('');
            setSelectedUpiApp(null);
        }, 2000);
    };

    //  Net Banking Submit - CORRECT
    const handleNetBankingSubmit = () => {
        if (!selectedBank) return;
        const bankDetails = bankList.find(b => b.id === selectedBank);
        const paymentData = {
            method_type: "netbanking",
            bank_name: bankDetails.name
        };
        onSave(paymentData);
        //  Only process payment, don't save NetBanking as card
        if (onProcessPayment) {
            onProcessPayment(paymentData);
        }
        setSelectedBank(null);
        setBankSearch('');
    };
    const handleVerifyOtp = (e) => {
        if (e) e.preventDefault();
        if (otp.length !== 6) return alert("Please enter a 6-digit OTP");

        setIsVerifying(true);
        setTimeout(() => {
            if (onProcessPayment) {
                onProcessPayment({
                    method_type: selectedCardForOtp.type || "card",
                    card_last4: selectedCardForOtp.number.slice(-4),
                    card_holder_name: selectedCardForOtp.name,
                    expiry_date: selectedCardForOtp.expiry
                });
            }
            setIsVerifying(false);
            setShowOtp(false);
            setOtp('');
        }, 2000);
    };

    const handleAppClick = (idx, appName) => {
        setSelectedUpiApp(idx);
        setUpiId(`user@${appName.toLowerCase()}`);
    };

    return (
        <div className="PaymentMethods-page animate-fade-in">
            <h1 className="PaymentMethods-main-title">
                {cardOnlyMode ? "Add New Card" : "Payment Methods"}
            </h1>

            <div className="PaymentMethods-container">
                {!cardOnlyMode && (
                    <div className="PaymentMethods-tabs">
                        <button className={`PaymentMethods-tab ${activeTab === 'card' ? 'active' : ''}`} onClick={() => setActiveTab('card')}>
                            <img src={creditcard_icon} alt="" className="tab-icon" /> Credit / Debit Card
                        </button>
                        <button className={`PaymentMethods-tab ${activeTab === 'upi' ? 'active' : ''}`} onClick={() => setActiveTab('upi')}>
                            <img src={upi_icon} alt="" className="tab-icon-upi" />
                        </button>
                        <button className={`PaymentMethods-tab ${activeTab === 'netbanking' ? 'active' : ''}`} onClick={() => setActiveTab('netbanking')}>
                            <img src={netbanking_icon} alt="" className="tab-icon" /> Net Banking
                        </button>
                    </div>
                )}

                {/* --- CARD SECTION --- */}
                {activeTab === 'card' && (
                    <div className="PaymentMethods-section">
                        {savedCards?.length > 0 && (
                            <>
                                <h3 className="Payment-section-subtitle">SAVED CARDS</h3>
                                <div className="Payment-saved-cards-grid">
                                    {savedCards?.map(card => (
                                        <div key={card.id} className={`Payment-card-outer ${card.isDefault ? 'is-default-ui' : ''}`}
                                            onClick={() => handleSavedCardClick(card)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={`Payment-card-item ${card.type?.toLowerCase() === 'visa' ? 'visa-active' : 'master-card'}`}>
                                                <div className="card-header-row">
                                                    <span>{card.type?.toUpperCase() || 'CARD'}</span>
                                                    <button type="button" className="delete-x" data-title="Remove Card" onClick={(e) => { e.stopPropagation(); console.log("Delete clicked for ID:", card.id); onDelete(card.id); }} > ✕ </button>
                                                </div>
                                                <div className="card-number-display">{card.number}</div>
                                                <div className="card-footer-info">
                                                    <div className="info-col"><span>Name</span><p>{card.name}</p></div>
                                                    <div className="info-col"><span>Expiry</span><p>{card.expiry}</p></div>
                                                </div>
                                            </div>
                                            <button type="button" className="btn-make-default" onClick={(e) => {
                                                e.stopPropagation();
                                                onMakeDefault(card.id);
                                            }}>
                                                {card.isDefault ? '★ DEFAULT' : 'MAKE DEFAULT'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* --- OTP OVERLAY --- */}
                        {showOtp && (
                            <div className="Payment-Processing-Overlay">
                                <div className="Payment-Loader-Card">
                                    {isVerifying ? (
                                        <>
                                            <div className="spinner"></div>
                                            <h2>Verifying OTP...</h2>
                                            <p>Processing your subscription activation.</p>
                                        </>
                                    ) : (
                                        <form onSubmit={handleVerifyOtp}>
                                            <h2 style={{ marginBottom: '10px' }}>Verify Transaction</h2>
                                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                                An OTP has been sent to your registered mobile number for card ending in {selectedCardForOtp?.number.slice(-4)}
                                            </p>
                                            <div className="PaymentMethods-form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Enter 6-Digit OTP"
                                                    maxLength="6"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                    style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                                                    required
                                                />
                                            </div>
                                            <div className="PaymentMethods-action-row">
                                                <button type="button" className="PaymentMethods-cancel-btn" onClick={() => setShowOtp(false)}>Cancel</button>
                                                <button type="submit" className="PaymentMethods-submit-btn">Verify & Pay</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* NEW CARD FORM */}
                        <form className="PaymentMethods-form" onSubmit={handleCardSubmit}>
                            <h2 className="PaymentMethods-subtitle">Card details</h2>

                            <div className="PaymentMethods-form-group">
                                <label>Cardholder's name</label>
                                <input name="name" placeholder="Full Name on card" value={cardData.name} onChange={handleCardChange} required />
                            </div>

                            <div className="PaymentMethods-form-group">
                                <label>Card number</label>
                                <input name="number" placeholder="xxxx xxxx xxxx xxxx" maxLength="19" value={cardData.number} onChange={handleCardChange} required />
                            </div>

                            <div className="PaymentMethods-form-row">
                                <div className="PaymentMethods-form-group">
                                    <label>Expiry</label>
                                    <input name="expiry" placeholder="MM/YY" maxLength="5" value={cardData.expiry} onChange={handleCardChange} required />
                                </div>
                                <div className="PaymentMethods-form-group">
                                    <label>CVV</label>
                                    <input inputMode='number' name="cvc" type="password" placeholder="654" maxLength="3" value={cardData.cvc} onChange={handleCardChange} required />
                                </div>
                            </div>

                            <div className="PaymentMethods-action-row">
                                <button type="button" className="PaymentMethods-cancel-btn" onClick={onCancel}>Cancel</button>
                                <button type="submit" className="PaymentMethods-submit-btn">Add</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- UPI SECTION --- */}
                {!cardOnlyMode && activeTab === 'upi' && (
                    <div className="PaymentMethods-section">
                        {isVerifying ? (
                            <div className="Payment-Processing-Loader">
                                <div className="spinner"></div>
                                <h3>Processing Payment...</h3>
                                <p>Please do not refresh or close this window.</p>
                            </div>
                        ) : (
                            <>
                                <p className="upi-choose-text">Choose App</p>
                                <div className="upi-apps-grid">
                                    {[
                                        { img: Gpay, name: 'okaxis' },
                                        { img: paytm, name: 'paytm' },
                                        { img: phonepe, name: 'ybl' },
                                        { img: amazonpay, name: 'apl' }
                                    ].map((app, idx) => (
                                        <img
                                            key={idx}
                                            src={app.img}
                                            className={selectedUpiApp === idx ? 'selected' : ''}
                                            onClick={() => handleAppClick(idx, app.name)}
                                            alt="UPI App"
                                        />
                                    ))}
                                </div>

                                <div className="upi-divider"><span>Or</span></div>

                                <form onSubmit={handleUpiVerifyAndPay}>
                                    <div className="PaymentMethods-form-group">
                                        <label>Enter UPI ID</label>
                                        <div className="upi-input-wrapper">
                                            <input
                                                placeholder="example@vpa"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className={`upi-verify-btn ${upiId ? 'active' : ''}`}
                                            >
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                    <div className="PaymentMethods-action-row">
                                        <button type="button" className="PaymentMethods-cancel-btn" onClick={onCancel}>Cancel</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}

                {/* --- NET BANKING SECTION --- */}
                {!cardOnlyMode && activeTab === 'netbanking' && (
                    <div className="PaymentMethods-section">
                        <div className="netbanking-search-row">
                            <input placeholder="Enter Bank Name" value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} />
                            <button type="button" className="netbanking-search-btn">Search</button>
                        </div>
                        <div className="netbanking-grid">
                            {filteredBanks.map(bank => (
                                <div key={bank.id} className={`bank-logo-box ${selectedBank === bank.id ? 'selected' : ''}`} onClick={() => setSelectedBank(bank.id)}>
                                    {bank.logo ? <img src={bank.logo} alt={bank.name} /> : <span className="bank-placeholder-text">{bank.name}</span>}
                                </div>
                            ))}
                        </div>
                        <div className="PaymentMethods-action-row">
                            <button type="button" className="PaymentMethods-cancel-btn" onClick={onCancel}>Cancel</button>
                            {selectedBank && <button type="button" className="PaymentMethods-submit-btn" onClick={handleNetBankingSubmit}>Proceed</button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};