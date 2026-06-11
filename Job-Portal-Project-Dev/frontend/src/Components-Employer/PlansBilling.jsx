import React, { useState, useEffect } from 'react';
import './PlansBilling.css';
import FileIcon from '../assets/Billing/File_icon.png';
import DeleteIcon from '../assets/Billing/Delete_icon.png';
import { MembershipPlans } from './MembershipPlans';
import { PaymentMethods } from './PaymentMethods';
import { PlanExpiryPopup } from './PlanExpiryPopup';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api/axios';

export const PlansBilling = () => {
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [view, setView] = useState('overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planStatus, setPlanStatus] = useState('ACTIVE');
    const [isExpired, setIsExpired] = useState(false);
    const [paymentTab, setPaymentTab] = useState('card');
    const [isCardOnly, setIsCardOnly] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);
    const [additionalPlan, setAdditionalPlan] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [billingHistory, setBillingHistory] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [savedCards, setSavedCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showExpiryPopup, setShowExpiryPopup] = useState(false);

    const handleUpgradeFromExpiry = () => {
    setShowExpiryPopup(false);
    setView('upgrade');
};

useEffect(() => {
    // Check if user just logged in and show expiry popup if needed
    const lastExpiryCheck = sessionStorage.getItem('lastExpiryCheck');
    const now = Date.now();
    
    if (!lastExpiryCheck || (now - parseInt(lastExpiryCheck)) > 3600000) { // Check every hour
        sessionStorage.setItem('lastExpiryCheck', now.toString());
    }
}, []);




    useEffect(() => {
        fetchRealData();
    }, []);

    // Normalize plan names helper
    const normalizePlanName = (name) => {
        if (!name) return '';
        const upperName = name.toUpperCase();

        // Handle all variations
        if (upperName === 'ENTERPRISE PLAN' || upperName.includes('ENTERPRISE') || upperName.includes('ENTERIC')) {
            return 'ENTERPRISE PLAN';
        }
        if (upperName === 'BUSINESS PLAN' || upperName.includes('BUSINESS')) {
            return 'BUSINESS PLAN';
        }
        if (upperName === 'STARTER PLAN' || upperName.includes('STARTER')) {
            return 'STARTER PLAN';
        }

        return upperName;
    };

    // const fetchRealData = async () => {
    //     setIsLoading(true);
    //     try {
    //         // 1. Get current subscription
    //         const subRes = await api.get('/subscription/');
    //         console.log('Subscription data:', subRes.data);

    //         // 2. Get invoices/billing history
    //         const invRes = await api.get('/invoices/');

    //         if (invRes.data && invRes.data.length > 0) {
    //             const formatted = invRes.data.map(inv => ({
    //                 id: inv.invoice_number,
    //                 plan: normalizePlanName(inv.plan_name),
    //                 date: new Date(inv.invoice_date).toLocaleDateString('en-US', {
    //                     month: 'long', day: 'numeric', year: 'numeric'
    //                 }).toUpperCase(),
    //                 price: inv.total,
    //                 status: inv.payment_status.toUpperCase(),
    //                 method: inv.payment_method,
    //                 subtotal: inv.subtotal,
    //                 cgst: inv.gst / 2,
    //                 sgst: inv.gst / 2,
    //                 company_name: inv.company_name,
    //                 email: inv.email,
    //                 phone: inv.phone,
    //                 transaction_id: inv.transaction_id,
    //                 duration: inv.duration,
    //                 start_date: inv.start_date,
    //                 end_date: inv.end_date,
    //                 db_id: inv.id
    //             }));
    //             setBillingHistory(formatted);
    //         }

    //         // 3. Set active plan from subscription API
    //         if (subRes.data && subRes.data.plan) {
    //             const currentPlan = subRes.data.plan;

    //             // Safely parse price
    //             // let currentPlanPrice = 0;
    //             if (currentPlan.total_price !== undefined) {
    //                 currentPlanPrice = currentPlan.total_price;
    //             }

    //             // if (isNaN(currentPlanPrice)) {
    //             //     currentPlanPrice = 0;
    //             // }

    //             const normalizedPlanName = normalizePlanName(currentPlan.name);

    //             console.log('Current plan from API:', {
    //                 originalName: currentPlan.name,
    //                 normalizedName: normalizedPlanName,
    //                 price: currentPlanPrice,
    //                 status: subRes.data.status
    //             });

    //             const activePlanData = {
    //                 id: currentPlan.id,
    //                 name: normalizedPlanName,
    //                 price: currentPlanPrice,
    //                 status: subRes.data.status.toUpperCase(),
    //                 nextInvoice: new Date(subRes.data.end_date).toLocaleDateString('en-US', {
    //                     month: 'long', day: 'numeric', year: 'numeric'
    //                 }),
    //                 planType: currentPlan.duration_days === 30 ? 'Monthly' :
    //                     currentPlan.duration_days === 180 ? '6 Months' : 'Yearly'
    //             };

    //             setActivePlan(activePlanData);
    //             setPlanStatus(subRes.data.status.toUpperCase());

    //             // 4. Set next invoice based on current plan
    //             const isPaidPlan = normalizedPlanName !== 'STARTER PLAN' && currentPlanPrice > 0;

    //             console.log('Is paid plan:', isPaidPlan, 'Price:', currentPlanPrice);

    //             if (isPaidPlan && subRes.data.status === 'ACTIVE') {
    //                 const nextBillingDate = new Date(subRes.data.end_date);

    //                 setPendingInvoices([{
    //                     id: `INV-NEXT-${Date.now()}`,
    //                     plan: normalizedPlanName,
    //                     price: currentPlanPrice,
    //                     dueDate: nextBillingDate.toLocaleDateString('en-US', {
    //                         month: 'long', day: 'numeric', year: 'numeric'
    //                     })
    //                 }]);
    //                 console.log('Next invoice set:', currentPlanPrice);
    //             } else {
    //                 setPendingInvoices([]);
    //                 console.log('No next invoice (free plan)');
    //             }
    //         } else {
    //             setActivePlan(null);
    //             setPendingInvoices([]);
    //         }

    //         // 5. Get payment methods
    //         const payRes = await api.get('/payment-methods/');
    //         if (payRes.data && payRes.data.length > 0) {
    //             const uniqueCards = [];
    //             const seenLast4 = new Set();

    //             payRes.data
    //                 .filter(m => m.method_type === 'card')
    //                 .forEach(m => {
    //                     if (!seenLast4.has(m.card_last4)) {
    //                         seenLast4.add(m.card_last4);
    //                         uniqueCards.push({
    //                             id: m.id,
    //                             name: m.card_holder_name || 'Card Holder',
    //                             number: `**** ${m.card_last4 || '0000'}`,
    //                             expiry: m.expiry_date || 'N/A',
    //                             type: m.method_type,
    //                             isDefault: m.is_default
    //                         });
    //                     }
    //                 });

    //             setSavedCards(uniqueCards);
    //         }

    //         // 6. Get available plans
    //         const plansRes = await api.get('/plans/');
    //         const normalizedPlans = plansRes.data.map(plan => ({
    //             ...plan,
    //             name: normalizePlanName(plan.name),
    //             price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price
    //         }));
    //         setAvailablePlans(normalizedPlans);

    //     } catch (error) {
    //         console.error('Error fetching billing data:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };


    const fetchRealData = async () => {
        setIsLoading(true);
        try {
            const subRes = await api.get('/subscription/');
            const invRes = await api.get('/invoices/');

            let latestPaidPrice = null;
            let latestPaidPlan = null;

            if (invRes.data && invRes.data.length > 0) {
                const formatted = invRes.data.map(inv => ({
                    id: inv.invoice_number,
                    plan: normalizePlanName(inv.plan_name),
                    date: new Date(inv.invoice_date).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                    }).toUpperCase(),
                    price: inv.total,
                    status: inv.payment_status.toUpperCase(),
                    method: inv.payment_method,
                    subtotal: inv.subtotal,
                    cgst: inv.gst / 2,
                    sgst: inv.gst / 2,
                    company_name: inv.company_name,
                    email: inv.email,
                    phone: inv.phone,
                    transaction_id: inv.transaction_id,
                    duration: inv.duration,
                    start_date: inv.start_date,
                    end_date: inv.end_date,
                    db_id: inv.id
                }));
                setBillingHistory(formatted);

                const paidInvoices = formatted.filter(inv => inv.status === 'PAID');
                if (paidInvoices.length > 0) {
                    paidInvoices.sort((a, b) => b.db_id - a.db_id);
                    latestPaidPrice = paidInvoices[0].price;
                    latestPaidPlan = paidInvoices[0].plan;
                }
            }

            if (subRes.data && subRes.data.plan) {
                const currentPlan = subRes.data.plan;
                const normalizedPlanName = normalizePlanName(currentPlan.name);

                const displayPrice = latestPaidPrice || 0;

                setActivePlan({
                    id: currentPlan.id,
                    name: normalizedPlanName,
                    price: displayPrice,
                    status: subRes.data.status.toUpperCase(),
                    features: currentPlan.features || [],
                    price: parseFloat(currentPlan.monthly_price) || 0,
                    nextInvoice: new Date(subRes.data.end_date).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                    }),
                    planType: subRes.data.duration === '6_months' ? '6 Months' :
                        subRes.data.duration === 'yearly' ? 'Yearly' : 'Monthly'
                });
                setPlanStatus(subRes.data.status.toUpperCase());
                setIsExpired(subRes.data.is_expired || false);

                if (displayPrice > 0 && subRes.data.status === 'active') {
                    setPendingInvoices([{
                        id: `INV-NEXT-${Date.now()}`,
                        plan: latestPaidPlan || normalizedPlanName,
                        price: displayPrice,
                        dueDate: new Date(subRes.data.end_date).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        })
                    }]);
                } else {
                    setPendingInvoices([]);
                }
            }

            // Payment methods
            const payRes = await api.get('/payment-methods/');
            if (payRes.data && payRes.data.length > 0) {
                const uniqueCards = [];
                const seenLast4 = new Set();
                payRes.data
                    .filter(m => m.method_type === 'card')
                    .forEach(m => {
                        if (!seenLast4.has(m.card_last4)) {
                            seenLast4.add(m.card_last4);
                            uniqueCards.push({
                                id: m.id,
                                name: m.card_holder_name || 'Card Holder',
                                number: `**** ${m.card_last4 || '0000'}`,
                                expiry: m.expiry_date || 'N/A',
                                type: m.method_type,
                                isDefault: m.is_default
                            });
                        }
                    });
                setSavedCards(uniqueCards);
            }

            // Available plans
            const plansRes = await api.get('/plans/');
            setAvailablePlans(plansRes.data);  // raw data

        } catch (error) {
            console.error('Error fetching billing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateInvoiceId = () => `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const getCurrentDateFormatted = () => {
        return new Date().toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        }).toUpperCase();
    };

    const downloadInvoicePDF = (data) => {
        const doc = new jsPDF();
        const navyBlue = [0, 43, 85];
        const borderGrey = [220, 220, 220];
        const themeBlue = [21, 87, 176];
        const textWhite = [255, 255, 255];
        const darkGrey = [40, 40, 40];

        const formatDate = (dateStr) => {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
            }).toUpperCase();
        };

        const headerH = 32;
        doc.setFillColor(...navyBlue);
        doc.rect(0, 0, 210, headerH, 'F');
        doc.setFillColor(...textWhite);
        doc.rect(0, 0, 135, headerH, 'F');
        doc.triangle(135, 0, 155, 0, 135, headerH, 'F');

        doc.setFontSize(22);
        doc.setTextColor(...themeBlue);
        doc.setFont("helvetica", "bold");
        doc.text("Job portal", 20, 20);

        doc.setFontSize(26);
        doc.setTextColor(...textWhite);
        doc.text("INVOICE", 190, 20, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(...themeBlue);
        doc.text(`Invoice No: ${data.id}`, 20, 45);
        doc.text(`Invoice date: ${data.date}`, 190, 45, { align: 'right' });

        doc.setDrawColor(...borderGrey);
        doc.line(20, 52, 190, 52);

        const cardY = 65;
        const cardH = 45;

        const drawCard = (x, title, lines) => {
            doc.setDrawColor(...borderGrey);
            doc.roundedRect(x, cardY, 55, cardH, 3, 3, 'S');
            doc.setFontSize(10);
            doc.setTextColor(...darkGrey);
            doc.text(title, x + 5, cardY + 8);
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            lines.forEach((line, i) => {
                doc.text(line, x + 5, cardY + 18 + (i * 6));
            });
        };

        const subtotal = parseFloat(data.subtotal) || (parseFloat(data.price) / 1.18);
        const gst = parseFloat(data.gst) || (parseFloat(data.price) - subtotal);
        const total = parseFloat(data.price);

        drawCard(20, "Billed To:", [
            data.company_name,
            `Email : ${data.email}`,
            `Phone : ${data.phone}`
        ]);

        drawCard(80, "Payment Method", [
            `Method : ${data.method || 'CARD'}`,
            `Transaction ID : ${data.transaction_id || data.id}`,
            `Payment Date : ${data.date}`,
            `Payment Status : ${data.status || 'Paid'}`
        ]);

        drawCard(140, "Payment Summary", [
            `Subtotal : Rs. ${subtotal.toFixed(2)}`,
            `GST (18%) : Rs. ${gst.toFixed(2)}`,
            `Total : Rs. ${total.toFixed(2)}`
        ]);

        doc.setFillColor(...navyBlue);
        doc.roundedRect(20, 125, 170, 8, 1, 1, 'F');
        doc.setFontSize(11);
        doc.setTextColor(...textWhite);
        doc.text("Membership Details", 105, 131, { align: 'center' });

        autoTable(doc, {
            startY: 133,
            head: [['Plan name', 'Duration', 'Start Date', 'End Date', 'Amount']],
            body: [[
                normalizePlanName(data.plan),
                data.duration || '1 Month',
                formatDate(data.start_date),
                formatDate(data.end_date),
                `Rs. ${total.toFixed(2)}`
            ]],
            headStyles: { fillColor: [210, 220, 230], textColor: [0, 0, 0], fontSize: 10, fontStyle: 'bold', halign: 'center' },
            styles: { halign: 'center', cellPadding: 5, lineWidth: 0.1, lineColor: borderGrey, textColor: [40, 40, 40] },
            theme: 'grid',
            margin: { left: 20, right: 20 }
        });

        const footerY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text("Notes:", 20, footerY);
        doc.text("• This is a system-generated invoice.", 20, footerY + 7);
        doc.text("• No signature required", 20, footerY + 14);
        doc.text("• For support, contact Customer Care", 20, footerY + 21);
        doc.setFont(undefined, 'bold');
        doc.text("Authorized By: Job portal", 105, footerY + 40, { align: 'center' });
        doc.setDrawColor(...navyBlue);
        doc.setLineWidth(1.5);
        doc.line(0, 290, 210, 290);
        doc.save(`${data.id}_Invoice.pdf`);
    };

    const handleUpgrade = async (newPlan, billingCycle) => {
        console.log('billingCycle received:', billingCycle);

        // Normalize duration for backend
        let durationParam = 'monthly';
        let planType = 'Monthly';

        if (billingCycle === '6 Months') {
            durationParam = '6_months';
            planType = '6 Months';
        } else if (billingCycle === 'yearly') {
            durationParam = 'yearly';
            planType = 'Yearly';
        }

        // Store plan details for payment
        setAdditionalPlan({
            id: newPlan.id,
            name: newPlan.name,
            price: newPlan.price,
            color: newPlan.color,
            summary: newPlan.summary,
            planType: planType,
            duration: durationParam,
            price_breakdown: newPlan.price_breakdown
        });

        setView('payment');
    };

    const processPaymentWithRazorpay = async (paymentMethodType) => {
        setIsProcessing(true);
        try {
            const plan = availablePlans.find(p => p.id === additionalPlan.id);

            if (!plan) {
                alert('Plan not found');
                setIsProcessing(false);
                return;
            }

            // Send correct duration parameter
            const orderRes = await api.post('/create-order/', {
                plan_id: plan.id,
                duration: additionalPlan.duration  // 'monthly', '6_months', or 'yearly'
            });
            const { order_id, amount, currency, razorpay_key, price_breakdown } = orderRes.data;

            const options = {
                key: razorpay_key,
                amount: amount,
                currency: currency,
                name: 'Job Portal',
                description: `${additionalPlan.name} - ${additionalPlan.planType}`,
                order_id: order_id,
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/verify-payment/', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            duration: additionalPlan.duration,
                            payment_method: paymentMethodType
                        });

                        if (verifyRes.data.message === "Payment verified successfully") {
                            await fetchRealData();
                            alert('Payment successful! Plan upgraded.');
                            setView('overview');
                        }
                    } catch (err) {
                        console.error('Verification failed:', err);
                        alert('Payment verification failed');
                    }
                    setIsProcessing(false);
                    setAdditionalPlan(null);
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        setAdditionalPlan(null);
                    }
                }
            };

            if (!window.Razorpay) {
                alert('Payment system is loading. Please refresh the page and try again.');
                setIsProcessing(false);
                return;
            }

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    const handleProcessPayment = async (paymentData) => {
        if (additionalPlan) {
            await processPaymentWithRazorpay(paymentData.method_type);
        }
    };

    const handleSaveNewCard = async (paymentData) => {
        try {
            console.log('Saving payment method:', paymentData);

            const response = await api.post('/payment-methods/', paymentData);
            console.log('Saved successfully:', response.data);
            await fetchRealData();

            if (response.status === 201) {
                alert('Payment method added successfully!');
            }
        } catch (error) {
            console.error('Failed to save:', error);
            if (error.response?.data) {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to save payment method');
            }
            return;
        }

        if (additionalPlan) {
            await processPaymentWithRazorpay(paymentData.method_type);
        } else {
            setView('overview');
        }
    };

    const handleAddCardOnly = () => { setIsCardOnly(true); setPaymentTab('card'); setView('payment'); };
    const handleAddCard = () => { setPaymentTab('card'); setView('payment'); };
    const handleToggleModal = () => setIsModalOpen(!isModalOpen);

    const handleConfirmCancellation = async () => {
        try {
            await api.post('/cancel/');
            setPlanStatus('CANCELLED');
            await fetchRealData();
            setIsModalOpen(false);
            alert('Subscription cancelled successfully');
        } catch (error) {
            console.error('Cancellation failed:', error);
            alert('Failed to cancel subscription');
        }
    };

    // const handleReactivate = () => {
    //     setView('upgrade');
    // };
    const handleReactivate = async () => {

        if (isExpired) {
            setView('upgrade');
            return;
        }

        try {
            await api.patch('/cancel/');
            await fetchRealData();
            alert('Plan reactivated successfully!');
        } catch (error) {

            if (
                error?.response?.data?.is_expired
            ) {
                alert(
                    'Subscription expired. Please upgrade again.'
                );
                setView('upgrade');
                return;
            }

            alert('Failed to reactivate');
        }
    };

    const openDeletePopup = (id, e) => { if (e) e.stopPropagation(); setCardToDelete(id); };

    const confirmDeleteCard = async () => {
        if (!cardToDelete) return;
        try {
            const idToDelete = typeof cardToDelete === 'object' ? cardToDelete.id : cardToDelete;
            await api.delete(`/payment-methods/${cardToDelete}/`);
            setSavedCards(prev => prev.filter(card => card.id !== idToDelete));
            await fetchRealData();
            alert('Card removed successfully');
        } catch (error) {
            console.error('Failed to delete card:', error);
            alert('Failed to remove card');
        } finally {
            setCardToDelete(null);
        }
    };

    const handleMakeDefault = async (id) => {
        try {
            await api.patch(`/payment-methods/${id}/`, { is_default: true });
            await fetchRealData();
        } catch (error) {
            console.error('Failed to set default:', error);
            alert('Failed to set default card. Please try again.');
        }
    };

    const defaultCard = savedCards.find(c => c.isDefault) || savedCards[0];

    if (isLoading) {
        return (
            <div className="PlansBilling-container">
                <div className="PlansBilling-header-box">
                    <h1 className="PlansBilling-main-title">Plans & Billing</h1>
                    <p className="PlansBilling-sub-title">Loading...</p>
                </div>
            </div>
        );
    }

    const renderDeleteModal = () => {
        if (!cardToDelete) return null;

        return (
            
            <div className="PlansBilling-modal-overlay">
                <div className="PlansBilling-modal-content">
                    <h2 className="PlansBilling-modal-title">DELETE CARD?</h2>
                    <p className="PlansBilling-modal-text">Are you sure you want to remove this payment method? This action cannot be undone.</p>
                    <div className="PlansBilling-modal-actions">
                        <button className="PlansBilling-modal-btn-grey" onClick={() => setCardToDelete(null)}>Cancel</button>
                        <button className="PlansBilling-modal-btn-confirm" style={{ backgroundColor: '#ff4757' }} onClick={confirmDeleteCard}>Delete Card</button>
                    </div>
                </div>
            </div>
        );
    };

    if (view === 'payment') {
        return (
            <div className="PlansBilling-container PlansBilling-animate-view">
                {additionalPlan && (
                    <div className="Checkout-Summary-Banner">
                        <h3>Summary: {additionalPlan.name}</h3>
                        <p>Total Due: ₹{additionalPlan.price} (Incl. GST)</p>
                    </div>
                )}
                <button className="PlansBilling-btn-back" onClick={() => setView('upgrade')}>← Back to Plans</button>
                <PaymentMethods
                    onBack={() => setView('overview')}
                    onCancel={() => setView('overview')}
                    defaultTab={paymentTab}
                    onSave={handleSaveNewCard}
                    onProcessPayment={handleProcessPayment}
                    savedCards={savedCards}
                    onMakeDefault={handleMakeDefault}
                    onDelete={(id) => setCardToDelete(id)}
                    cardOnlyMode={isCardOnly}
                />
                {cardToDelete && renderDeleteModal()}
            </div>
        );
    }

    if (view === 'upgrade') {
        return (
            <div className="PlansBilling-container">
                <button className="PlansBilling-btn-back" onClick={() => setView('overview')}>← Back to Billing</button>
                <MembershipPlans onSelectPlan={handleUpgrade} plans={availablePlans} />
            </div>
        );
    }

    return (
        <>
        <PlanExpiryPopup 
            onUpgrade={handleUpgradeFromExpiry}
            onClose={() => setShowExpiryPopup(false)}
        />
        <div className="PlansBilling-container">
            <div className="PlansBilling-header-box">
                <h1 className="PlansBilling-main-title">Plans & Billing</h1>
                <p className="PlansBilling-sub-title">Manage your details and personal preferences here</p>
            </div>

            {/* <div className="PlansBilling-card PlansBilling-current-plan">
                <div className="PlansBilling-plan-info">
                    <p className="PlansBilling-label">Current Plan</p>
                    <div className="PlansBilling-title-row">
                        <h2 className="PlansBilling-plan-name">{activePlan?.name || 'No Active Plan'}</h2>
                        <span className={`PlansBilling-status-badge ${planStatus === 'ACTIVE'
                            ? 'PlansBilling-status-active'
                            : isExpired
                                ? 'PlansBilling-status-expired'
                                : 'PlansBilling-status-cancelled'
                            }`}>
                            {isExpired ? 'EXPIRED' : planStatus}
                        </span>
                    </div>
                    <p className="PlansBilling-plan-desc">Providing the core tools and services you need at an affordable price</p>
                </div>
                <div className="PlansBilling-plan-actions">
                    <span className="PlansBilling-main-price">
                        ₹ {activePlan?.price || '0'} <small>/{activePlan?.planType === 'Monthly' ? 'month' : activePlan?.planType === '6 Months' ? '6 months' : 'year'}</small>
                    </span>
                    <div className="PlansBilling-button-group">

                        {planStatus === 'ACTIVE' ? (

                            <>
                                <button
                                    className="PlansBilling-btn PlansBilling-btn-outline"
                                    onClick={handleToggleModal}
                                >
                                    Cancel Plan
                                </button>

                                <button
                                    className="PlansBilling-btn PlansBilling-btn-upgrade"
                                    onClick={() => setView('upgrade')}
                                >
                                    Upgrade Plan
                                </button>
                            </>

                        ) : !isExpired ? (

                            <>
                                <button
                                    className="PlansBilling-btn PlansBilling-btn-primary"
                                    onClick={handleReactivate}
                                >
                                    Reactivate Plan
                                </button>

                                <button
                                    className="PlansBilling-btn PlansBilling-btn-upgrade"
                                    onClick={() => setView('upgrade')}
                                >
                                    Upgrade Plan
                                </button>
                            </>

                        ) : (

                            <button
                                className="PlansBilling-btn PlansBilling-btn-upgrade"
                                onClick={() => setView('upgrade')}
                            >
                                Upgrade Plan
                            </button>

                        )}

                    </div>
                </div>
            </div> */}

            <div className="PlansBilling-card PlansBilling-current-plan">
                <div className="PlansBilling-plan-info">
                    <p className="PlansBilling-label">Current Plan</p>
                    <div className="PlansBilling-title-row">
                        <h2 className="PlansBilling-plan-name">{activePlan?.name || 'No Active Plan'}</h2>
                        <span className={`PlansBilling-status-badge ${planStatus === 'ACTIVE'
                            ? 'PlansBilling-status-active'
                            : isExpired
                                ? 'PlansBilling-status-expired'
                                : 'PlansBilling-status-cancelled'
                            }`}>
                            {isExpired ? 'EXPIRED' : planStatus}
                        </span>
                    </div>
                    <p className="PlansBilling-plan-desc">Providing the core tools and services you need at an affordable price</p>
                </div>
                <div className="PlansBilling-plan-actions">
                    <span className="PlansBilling-main-price">
                        {/* Check if it's Starter plan - show "Free" instead of price */}
                        {activePlan?.name === 'STARTER PLAN' ?
                            'Free Plan' :
                            `₹ ${activePlan?.price || '0'}`
                        }
                        {activePlan?.name !== 'STARTER PLAN' && (
                            <small>/{activePlan?.planType === 'Monthly' ? 'month' : activePlan?.planType === '6 Months' ? '6 months' : 'year'}</small>
                        )}
                    </span>
                    <div className="PlansBilling-button-group">

                        {planStatus === 'ACTIVE' ? (

                            <>
                                {/* Only show Cancel Plan button if NOT Starter plan */}
                                {activePlan?.name !== 'STARTER PLAN' && (
                                    <button
                                        className="PlansBilling-btn PlansBilling-btn-outline"
                                        onClick={handleToggleModal}
                                    >
                                        Cancel Plan
                                    </button>
                                )}

                                <button
                                    className="PlansBilling-btn PlansBilling-btn-upgrade"
                                    onClick={() => setView('upgrade')}
                                >
                                    Upgrade Plan
                                </button>
                            </>

                        ) : !isExpired ? (

                            <>
                                <button
                                    className="PlansBilling-btn PlansBilling-btn-primary"
                                    onClick={handleReactivate}
                                >
                                    Reactivate Plan
                                </button>

                                <button
                                    className="PlansBilling-btn PlansBilling-btn-upgrade"
                                    onClick={() => setView('upgrade')}
                                >
                                    Upgrade Plan
                                </button>
                            </>

                        ) : (

                            <button
                                className="PlansBilling-btn PlansBilling-btn-upgrade"
                                onClick={() => setView('upgrade')}
                            >
                                Upgrade Plan
                            </button>

                        )}

                    </div>
                </div>
            </div>

            <div className="PlansBilling-grid-row">
                <div className="PlansBilling-card PlansBilling-invoice-box">
                    <h3 className="PlansBilling-section-title">Next Invoices</h3>
                    {pendingInvoices.length > 0 ? (
                        <>
                            <p className="PlansBilling-invoice-price">
                                ₹ {pendingInvoices[0].price}/-
                            </p>
                            <div className="PlansBilling-invoice-details">
                                <div className="PlansBilling-detail-item">
                                    <span className="PlansBilling-detail-label">Plan Type</span>
                                    <span className="PlansBilling-detail-value">: {pendingInvoices[0].plan || activePlan?.name || '-'}</span>
                                </div>
                                <div className="PlansBilling-detail-item">
                                    <span className="PlansBilling-detail-label">Next Date</span>
                                    <span className="PlansBilling-detail-value">: {pendingInvoices[0].dueDate || activePlan?.nextInvoice || 'N/A'}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="PlansBilling-no-invoice" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            No upcoming invoices. You are on free plan.
                        </p>
                    )}
                </div>

                <div className="PlansBilling-card PlansBilling-payment-box">
                    {defaultCard ? (
                        <div className="Billing-Payment-Display" onClick={handleAddCard}>
                            <div className="Billing-Payment-header">
                                <span className="Billing-Payment-title-text">Payment Method</span>
                                <div className="Billing-brand-badge">{defaultCard.type?.toUpperCase() || 'CARD'}</div>
                            </div>
                            <h3 className="Billing-card-number-large">{defaultCard.number}</h3>
                            <div className="Billing-Payment-footer">
                                <div className="Billing-card-meta">
                                    <div className="meta-row"><span className="meta-label">Name Card</span><span className="meta-value">: {defaultCard.name}</span></div>
                                    <div className="meta-row"><span className="meta-label">Expired Date</span><span className="meta-value">: {defaultCard.expiry}</span></div>
                                </div>
                                <div className="Billing-Payment-actions">
                                    <button className="Billing-btn-change" onClick={handleAddCardOnly}>Change Card</button>
                                    <button className="Billing-btn-delete-icon" onClick={(e) => openDeletePopup(defaultCard.id, e)}>
                                        <img src={DeleteIcon} alt="Delete" title='Remove' />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button className="PlansBilling-add-payment-btn" onClick={handleAddCardOnly}>+ Add Your Card Details.</button>
                    )}
                </div>
            </div>

            <div className="PlansBilling-card PlansBilling-history-box">
                <div className="PlansBilling-history-header">
                    <h3 className="PlansBilling-history-title">BILLING HISTORY</h3>
                    <span className="PlansBilling-view-history">View history</span>
                </div>
                <div className="PlansBilling-history-content">
                    <table className="History-Table">
                        <thead>
                            <tr>
                                <th>PLAN</th>
                                <th>DATE</th>
                                <th>PRICE</th>
                                <th>STATUS</th>
                                <th>INVOICE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billingHistory.map((item, index) => (
                                <tr key={index}>
                                    <td className="plan-cell"><strong>{normalizePlanName(item.plan)}</strong></td>
                                    <td>{item.date}</td>
                                    <td>₹ {item.price} /-</td>
                                    <td>
                                        <span className={`status-pill ${item.status.toLowerCase().replace(' ', '-')}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="invoice-cell">
                                        <span className="invoice-id-text">{item.id}</span>
                                        <img src={FileIcon} alt="PDF" title="Download Invoice" className="download-icon" onClick={() => downloadInvoicePDF(item)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {cardToDelete && (
                <div className="PlansBilling-modal-overlay">
                    <div className="PlansBilling-modal-content">
                        <h2 className="PlansBilling-modal-title">DELETE CARD?</h2>
                        <p className="PlansBilling-modal-text">Are you sure you want to remove this payment method? This action cannot be undone.</p>
                        <div className="PlansBilling-modal-actions">
                            <button className="PlansBilling-modal-btn-grey" onClick={() => setCardToDelete(null)}>Cancel</button>
                            <button className="PlansBilling-modal-btn-confirm" style={{ backgroundColor: '#ff4757' }} onClick={confirmDeleteCard}>Delete Card</button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="PlansBilling-modal-overlay">
                    <div className="PlansBilling-modal-content">
                        <h2 className="PlansBilling-modal-title">CONFIRM PLAN CANCELLATION</h2>
                        <div className="PlansBilling-modal-info-card">
                            <h3 className="PlansBilling-modal-plan-name">{activePlan?.name || 'Plan'}</h3>
                            <span className="PlansBilling-badge PlansBilling-badge-active">{planStatus}</span>
                        </div>
                        <p className="PlansBilling-modal-text">Are you sure you want to cancel? Cancelling will prevent any future charges.</p>
                        <div className="PlansBilling-modal-actions">
                            <button className="PlansBilling-modal-btn-grey" onClick={handleToggleModal}>Keep My Current Plan</button>
                            <button className="PlansBilling-modal-btn-confirm" onClick={handleConfirmCancellation}>CONFIRM CANCELLATION</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};