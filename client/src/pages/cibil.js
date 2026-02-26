import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cibilAPI } from '../utils/api';

const Cibil = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        paymentHistory: 100,
        creditUtilization: 30,
        creditAge: 5,
        creditMix: 'good',
        hardInquiries: 0
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await cibilAPI.analyze(formData);
            setResult(res.data);
            alert("Analysis successful!");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Failed to analyze risk profile. Please check your inputs.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', minHeight: '100vh', padding: '40px' }}>
            <div className="glass fade-in" style={{ padding: '60px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                    <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>← Back to Dashboard</Link>
                    <h1 className="outfit" style={{ fontSize: '2.8rem', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Risk Intelligence</h1>
                    <div style={{ width: '120px', display: 'none', lg: 'block' }}></div>
                </div>

                {!result ? (
                    <form onSubmit={handleAnalyze} className="animate-up">
                        {error && (
                            <div className="glass" style={{ padding: '15px 20px', marginBottom: '30px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '15px', textAlign: 'center' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 className="outfit" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '24px', height: '2px', background: 'var(--primary)' }}></span>
                                Personal Details
                            </h3>
                            <div className="input-group">
                                <label style={{ fontSize: '1rem', fontWeight: '600' }}>Client Full Name</label>
                                <input name="fullName" type="text" placeholder="Enter full name" style={{ height: '55px', fontSize: '1.1rem' }} onChange={handleChange} required />
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h3 className="outfit" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '24px', height: '2px', background: 'var(--primary)' }}></span>
                                Financial Parameters
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div className="input-group">
                                    <label style={{ fontSize: '1rem', fontWeight: '600' }}>Payment History (%)</label>
                                    <input name="paymentHistory" type="number" min="0" max="100" value={formData.paymentHistory} style={{ height: '55px', fontSize: '1.1rem' }} onChange={handleChange} required />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Percentage of bills paid on time</span>
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '1rem', fontWeight: '600' }}>Credit Utilization (%)</label>
                                    <input name="creditUtilization" type="number" min="0" max="100" value={formData.creditUtilization} style={{ height: '55px', fontSize: '1.1rem' }} onChange={handleChange} required />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Total credit used vs available limit</span>
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '1rem', fontWeight: '600' }}>Credit Age (Years)</label>
                                    <input name="creditAge" type="number" min="0" value={formData.creditAge} style={{ height: '55px', fontSize: '1.1rem' }} onChange={handleChange} required />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Number of years since first credit account</span>
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '1rem', fontWeight: '600' }}>Credit Mix</label>
                                    <select name="creditMix" value={formData.creditMix} style={{ height: '55px', fontSize: '1.1rem' }} onChange={handleChange}>
                                        <option value="good">Good (Balanced)</option>
                                        <option value="average">Average</option>
                                        <option value="poor">Poor (Limited Variation)</option>
                                    </select>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Variety of credit products</span>
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '1rem', fontWeight: '600' }}>Hard Inquiries (Last 6 Months)</label>
                                    <input name="hardInquiries" type="number" min="0" value={formData.hardInquiries} style={{ height: '55px', fontSize: '1.1rem' }} onChange={handleChange} required />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Number of formal credit checks</span>
                                </div>
                            </div>
                        </div>

                        <button className="btn-premium" type="submit" style={{ width: '100%', marginTop: '20px', fontSize: '1.2rem', height: '65px', borderRadius: '18px' }} disabled={loading}>
                            {loading ? (
                                <div className="loader" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
                            ) : 'Analyze Risk Portfolio'}
                        </button>
                    </form>
                ) : (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ padding: '60px 20px' }}>
                            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Assessment Result</div>
                            <div style={{ fontSize: '7rem', fontWeight: '900', color: result.estimatedScore > 750 ? 'var(--success)' : (result.estimatedScore > 650 ? 'var(--warning)' : 'var(--danger)'), margin: '10px 0', textShadow: '0 0 50px rgba(99, 102, 241, 0.3)' }}>
                                {result.estimatedScore}
                            </div>
                            <div className="glass" style={{ padding: '10px 24px', display: 'inline-block', borderRadius: '50px', fontWeight: '700', fontSize: '1.1rem', color: 'white', background: 'rgba(255,255,255,0.1)' }}>
                                {result.riskLevel} Risk Level
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '40px', textAlign: 'left', marginTop: '20px' }}>
                            <h3 className="outfit" style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--primary)' }}>✦</span> Improvement Strategy
                            </h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {result.suggestions.map((tip, i) => (
                                    <div key={i} className="glass-hover" style={{ padding: '15px 20px', borderRadius: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', display: 'flex', gap: '15px' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>0{i + 1}</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{tip}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                            <button className="btn-secondary" onClick={() => setResult(null)} style={{ flex: 1, padding: '18px' }}>Perform Another Audit</button>
                            <Link to="/dashboard" className="btn-premium" style={{ flex: 1, padding: '18px', textAlign: 'center', textDecoration: 'none' }}>Save & View Dashboard</Link>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Cibil;
