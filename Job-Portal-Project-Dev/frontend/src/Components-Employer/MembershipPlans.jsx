import React, { useState, useEffect } from 'react';
import './MembershipPlans.css';
import api from '../api/axios';

export const MembershipPlans = ({ onSelectPlan, plans: externalPlans }) => {
    const [activeTab, setActiveTab] = useState('monthly');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPlanColor = (index, planName = '') => {
        if (planName.toLowerCase() === 'free' || planName.toLowerCase() === 'starter plan') return 'green';
        const colors = ['blue', 'orange', 'purple'];
        return colors[index % colors.length];
    };

    useEffect(() => {
        if (externalPlans && externalPlans.length > 0) {
            setPlans(externalPlans);
            setLoading(false);
        } else {
            fetchPlans();
        }
    }, [externalPlans]);

    const fetchPlans = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/plans/');
            console.log('Fetched plans:', response.data);
            setPlans(response.data);
        } catch (err) {
            console.error('Error fetching plans:', err);
            setError('Failed to load plans. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGetStarted = (plan) => {
        const isFreePlan = plan.name.toLowerCase() === 'free' || plan.name.toLowerCase() === 'starter plan';
        if (isFreePlan) {
            alert("currently disabled for free plans");
            return;
        }
        let pricing = plan.pricing;
        let duration = activeTab;
        let priceWithoutTax = 0;
        let finalPriceWithTax = 0;
        let priceBreakdown = null;

        if (isFreePlan) {
            duration = 'lifetime'; 
            priceBreakdown = {
                base_price: 0,
                total: 0,
                cgst: 0,
                sgst: 0,
                tax_rate: 0
            };
        } else if (activeTab === 'monthly') {
            priceWithoutTax = pricing.monthly.base_price;
            finalPriceWithTax = pricing.monthly.total;
            duration = 'monthly';
            priceBreakdown = pricing.monthly;
        } else if (activeTab === '6 Months') {
            priceWithoutTax = pricing.six_months.price_after_discount;
            finalPriceWithTax = pricing.six_months.total;
            duration = '6_months';
            priceBreakdown = pricing.six_months;
        } else {
            priceWithoutTax = pricing.yearly.price_after_discount;
            finalPriceWithTax = pricing.yearly.total;
            duration = 'yearly';
            priceBreakdown = pricing.yearly;
        }

        const planData = {
            id: plan.id,
            name: plan.name,
            price: finalPriceWithTax,  
            displayPrice: priceWithoutTax,  
            color: plan.color || getPlanColor(0, plan.name),
            summary: plan.summary,
            duration: duration,
            price_breakdown: priceBreakdown,
            subtotal: priceBreakdown?.price_after_discount || priceBreakdown?.base_price || 0,
            cgst: priceBreakdown?.cgst || 0,
            sgst: priceBreakdown?.sgst || 0,
            tax_rate: priceBreakdown?.tax_rate || 0
        };

        onSelectPlan(planData, activeTab);
    };

    if (loading) {
        return (
            <div className="MembershipPlans-loading">
                <div className="spinner"></div>
                <p>Loading plans...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="MembershipPlans-error">
                <p>{error}</p>
                <button onClick={fetchPlans}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="MembershipPlans">
            <div className="MembershipPlans-header-box">
                <h2>Employer Membership Plan</h2>
                <p>Find the best plan to attract top talent</p>
            </div>

            <div className="MembershipPlans-tabs-bar">
                {['monthly', '6 Months', 'yearly'].map((tab) => (
                    <button
                        key={tab}
                        className={`MembershipPlans-tab-item ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'monthly' ? 'Monthly' : tab === '6 Months' ? '6 Months' : 'Yearly'} Plan
                    </button>
                ))}
            </div>

            <div className={`MembershipPlans-grid ${plans.length === 2 ? 'two-cols' : plans.length === 3 ? 'three-cols' : ''}`}>
                {plans.map((plan, index) => {
                    const isFreePlan = plan.name.toLowerCase() === 'free' || plan.name.toLowerCase() === 'starter plan';
                    let displayPrice = 0;      
                    let tabLabel = 'month';
                    let pricingData = null;
                    let originalPrice = null;

                    if (isFreePlan) {
                        displayPrice = 0;
                        tabLabel = 'Forever';
                        pricingData = { discount_percent: 0 };
                    } else if (activeTab === 'monthly') {
                        displayPrice = plan.pricing.monthly.base_price;
                        tabLabel = 'month';
                        pricingData = plan.pricing.monthly;
                        originalPrice = plan.pricing.monthly.base_price;
                    } else if (activeTab === '6 Months') {
                        displayPrice = plan.pricing.six_months.price_after_discount;
                        tabLabel = '6 months';
                        pricingData = plan.pricing.six_months;
                        originalPrice = plan.pricing.six_months.base_price;
                    } else {
                        displayPrice = plan.pricing.yearly.price_after_discount;
                        tabLabel = 'year';
                        pricingData = plan.pricing.yearly;
                        originalPrice = plan.pricing.yearly.base_price;
                    }

                    return (
                        <div key={plan.id} className={`MembershipPlans-card ${isFreePlan ? 'free-tier' : ''}`}>
                            <div className={`MembershipPlans-banner ${getPlanColor(index, plan.name)}`}>
                                {plan.name.toUpperCase()}
                            </div>

                            <div className="MembershipPlans-content">
                                <div className="MembershipPlans-price-box">
                                    <span className="MembershipPlans-amount">
                                        ₹ {Math.round(displayPrice)}
                                        <small>/{tabLabel}</small>
                                    </span>
                                    {!isFreePlan && pricingData?.discount_percent > 0 && (
                                        <div className="MembershipPlans-discount-info">
                                            <span className="MembershipPlans-original-price">
                                                ₹{Math.round(originalPrice)}
                                            </span>
                                            <span className="MembershipPlans-discount-badge">
                                                Save {pricingData.discount_percent}%
                                            </span>
                                        </div>
                                    )}
                                    <div className="MembershipPlans-tax-info">
                                        {isFreePlan ? 'No Hidden Charges' : '+18% GST'}
                                    </div>
                                    {plan.summary && (
                                        <span className="MembershipPlans-subtitle">{plan.summary}</span>
                                    )}
                                </div>

                                <hr className="MembershipPlans-divider" />

                                <ul className="MembershipPlans-features-list">
                                    {(plan.features || []).map((feat, i) => {
                                        const isIncluded = feat.included === true || feat.value === 'true';
                                        let displayText = feat.text;

                                        if (feat.text === 'Jobs Posting' && feat.value !== '0') {
                                            displayText = `${feat.value} Jobs Posting`;
                                        } else if (feat.text === 'Highlight Your Job Listing' && feat.value !== '0') {
                                            displayText = `${feat.value} Highlight Listings`;
                                        }

                                        return (
                                            <li key={i} className={isIncluded ? 'included' : 'excluded'}>
                                                <span className="MembershipPlans-icon">
                                                    {isIncluded ? '✔' : '✘'}
                                                </span>
                                                {displayText}
                                            </li>
                                        );
                                    })}
                                </ul>

                                <button
                                    className={`MembershipPlans-btn-start ${getPlanColor(index, plan.name)}`}
                                    onClick={() => handleGetStarted(plan)}
                                    title={isFreePlan ? "This plan is currently disabled" : ""}
                                >
                                    {isFreePlan ? 'Get Started For Free' : 'Get started'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};