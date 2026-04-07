import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', minHeight: '100vh', padding: '10px 20px', color: 'white' }}>
            {/* Header / Nav */}
            <div className="glass" style={{ padding: '15px 30px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>C</div>
                    <h2 className="outfit" style={{ fontSize: '1.4rem' }}>CIBIL Risk Manager</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user?.fullName || 'User'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Premium Control</div>
                    </div>
                    <Link to="/profile" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Profile</Link>
                    <Link to="/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}>View Data</Link>
                    <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--danger)' }}>Logout</button>
                </div>
            </div>
            <div className="glass fade-in" style={{ padding: '50px', borderRadius: '20px', textAlign: 'center', marginBottom: '30px' }}>
                <h1 className="outfit" style={{ fontSize: '3rem', marginBottom: '20px', color: 'var(--primary)' }}>
                    Welcome to CIBIL Risk Manager
                </h1>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 30px' }}>
                    Gain complete control over your financial health. Our cutting-edge platform allows you to monitor, analyze, and optimize your credit profile with AI-driven insights and interactive dashboards.
                </p>
                <button 
                    className="btn-premium" 
                    onClick={() => navigate('/cibil-form')}
                    style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '30px' }}
                >
                    View My CIBIL Score
                </button>
            </div>

            <div className="dashboard-grid fade-in" style={{ gap: '30px', animationDelay: '0.2s', padding: '0' }}>
                <div className="glass glass-hover" style={{ padding: '40px', borderRadius: '24px', gridColumn: 'span 6' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--success)', fontSize: '1.5rem' }}>⚙️</div>
                    <h3 className="outfit" style={{ fontSize: '1.6rem', marginBottom: '15px', color: 'var(--success)' }}>How the Platform Works</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                        Simply verify your identity, and we securely retrieve your credit footprint. We process your active loans, credit cards, payment history, and credit utilization to generate a comprehensive risk analysis report with high precision.
                    </p>
                </div>

                <div className="glass glass-hover" style={{ padding: '40px', borderRadius: '24px', gridColumn: 'span 6' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--warning)', fontSize: '1.5rem' }}>📊</div>
                    <h3 className="outfit" style={{ fontSize: '1.6rem', marginBottom: '15px', color: 'var(--warning)' }}>How Calculations are Done</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                        Your score is determined by several mathematical models weighing: Payment History (35%), Credit Utilization (30%), Length of Credit History (15%), New Credit (10%), and Credit Mix (10%).
                    </p>
                </div>

                <div className="glass glass-hover" style={{ padding: '40px', borderRadius: '24px', gridColumn: 'span 12' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px' }}>
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <div style={{ width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--primary)', fontSize: '1.5rem' }}>🛡️</div>
                            <h3 className="outfit" style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'var(--primary)' }}>Why Choose Us?</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                                We provide bank-grade security, ensuring your financial data is fully encrypted. With real-time alerts and intelligent recommendations, we help you understand exactly what impacts your score and how you can push it to the excellent range.
                            </p>
                        </div>
                        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="glass" style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Security Level</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--success)' }}>AES-256 Bit Encrypted</div>
                            </div>
                            <div className="glass" style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Accuracy</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>99.9% Data Integrity</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;
