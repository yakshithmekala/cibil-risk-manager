import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cibilAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CibilForm = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        paymentHistory: 100,
        creditUtilization: 30,
        creditAge: 5,
        creditMix: 'good',
        hardInquiries: 0,
        totalAccounts: 2,
        activeLoans: 1,
        creditCards: 1,
        totalCreditLimit: 50000
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: e.target.type === 'number' ? Number(value) : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await cibilAPI.analyze(formData);
            // Pass the entire response data plus the original form data to the report page
            navigate('/cibil-report', { 
                state: { 
                    reportData: {
                        ...response.data,
                        ...formData
                    }
                } 
            });
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.response?.data?.error || "Failed to analyze CIBIL score. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', padding: '20px', color: 'white' }}>
            {/* Navigation Header */}
            <div className="glass" style={{ padding: '15px 30px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>C</div>
                    <h2 className="outfit" style={{ fontSize: '1.4rem' }}>CIBIL Audit</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/home" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Home</Link>
                    <Link to="/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Dashboard</Link>
                    <Link to="/profile" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Profile</Link>
                    <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--danger)' }}>Logout</button>
                </div>
            </div>

            <div className="glass fade-in" style={{ padding: '40px', borderRadius: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <h2 className="outfit" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary)', textAlign: 'center' }}>
                    Detailed Credit Audit
                </h2>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-secondary)' }}>
                    Fill in your credit metrics to generate a comprehensive report.
                </p>

                {error && (
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '20px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter your full name" style={{ height: '50px', padding: '10px 15px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="input-group">
                            <label>Payment History (%)</label>
                            <input type="number" name="paymentHistory" value={formData.paymentHistory} onChange={handleChange} required min="0" max="100" style={{ height: '50px' }} />
                        </div>
                        <div className="input-group">
                            <label>Credit Utilization (%)</label>
                            <input type="number" name="creditUtilization" value={formData.creditUtilization} onChange={handleChange} required min="0" max="100" style={{ height: '50px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="input-group">
                            <label>Credit Age (Years)</label>
                            <input type="number" name="creditAge" value={formData.creditAge} onChange={handleChange} required min="0" style={{ height: '50px' }} />
                        </div>
                        <div className="input-group">
                            <label>Credit Mix</label>
                            <select name="creditMix" value={formData.creditMix} onChange={handleChange} required style={{ height: '50px', backgroundColor: 'var(--bg-deep)' }}>
                                <option value="good">Good (Secured + Unsecured)</option>
                                <option value="average">Average</option>
                                <option value="poor">Poor (Only one type)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="input-group">
                            <label>Total Accounts</label>
                            <input type="number" name="totalAccounts" value={formData.totalAccounts} onChange={handleChange} required min="0" style={{ height: '50px' }} />
                        </div>
                        <div className="input-group">
                            <label>Active Loans</label>
                            <input type="number" name="activeLoans" value={formData.activeLoans} onChange={handleChange} required min="0" style={{ height: '50px' }} />
                        </div>
                        <div className="input-group">
                            <label>Credit Cards</label>
                            <input type="number" name="creditCards" value={formData.creditCards} onChange={handleChange} required min="0" style={{ height: '50px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div className="input-group">
                            <label>Total Credit Limit (₹)</label>
                            <input type="number" name="totalCreditLimit" value={formData.totalCreditLimit} onChange={handleChange} required min="0" style={{ height: '50px' }} />
                        </div>
                        <div className="input-group">
                            <label>Hard Inquiries</label>
                            <input type="number" name="hardInquiries" value={formData.hardInquiries} onChange={handleChange} required min="0" style={{ height: '50px' }} />
                        </div>
                    </div>

                    <button className="btn-premium" type="submit" disabled={loading} style={{ width: '100%', height: '55px', fontSize: '1.1rem', borderRadius: '15px' }}>
                        {loading ? 'Analyzing Your Profile...' : 'Generate Detailed Report'}
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                         <Link to="/home" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>← Back to Home</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CibilForm;

