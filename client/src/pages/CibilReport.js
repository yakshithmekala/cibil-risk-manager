import React from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const getScoreColor = (score) => {
    if (score >= 750) return 'var(--success)';
    if (score >= 700) return 'var(--primary)';
    if (score >= 650) return 'var(--warning)';
    return 'var(--danger)';
};

const CibilReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const reportData = location.state?.reportData;

    if (!reportData) {
        return <Navigate to="/cibil-form" />;
    }

    const {
        fullName,
        estimatedScore: score,
        riskLevel,
        suggestions,
        totalAccounts,
        activeLoans,
        creditCards,
        totalCreditLimit,
        paymentHistory,
        creditUtilization,
        creditAge
    } = reportData;

    // Generate a semi-realistic trend based on current score
    const generateTrend = (finalScore) => {
        const trend = [];
        let current = finalScore - 50;
        for (let i = 0; i < 5; i++) {
            trend.push(current + Math.floor(Math.random() * 15));
            current = trend[i];
        }
        trend.push(finalScore);
        return trend;
    };

    const chartData = {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
            {
                label: 'Score Prediction',
                data: generateTrend(score),
                fill: true,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointHoverRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, min: 300, max: 900 },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    const handleDownload = () => {
        window.print();
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', padding: '20px', color: 'white' }}>
            {/* Navigation Header */}
            <div className="glass" style={{ padding: '15px 30px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>C</div>
                    <h2 className="outfit" style={{ fontSize: '1.4rem' }}>Analysis Results</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Link to="/home" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Home</Link>
                    <Link to="/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Dashboard</Link>
                    <Link to="/profile" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Profile</Link>
                    <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--danger)' }}>Logout</button>
                </div>
            </div>

            <div className="glass fade-in" style={{ padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 className="outfit" style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                    CIBIL Analysis: <span style={{ color: 'var(--primary)' }}>{fullName}</span>
                </h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={handleDownload} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📥</span> Print Report
                    </button>
                    <button onClick={() => navigate('/cibil-form')} className="btn-premium" style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '15px' }}>
                        New Audit
                    </button>
                </div>
            </div>


            <div className="dashboard-grid fade-in" style={{ gap: '30px', animationDelay: '0.2s' }}>
                {/* Credit Score Section */}
                <div className="glass" style={{ padding: '30px', borderRadius: '20px', textAlign: 'center', gridColumn: 'span 4' }}>
                    <h3 className="outfit" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>ESTIMATED CREDIT SCORE</h3>
                    <div style={{ fontSize: '4.5rem', fontWeight: '800', color: getScoreColor(score), marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {score}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: getScoreColor(score), marginBottom: '20px' }}>{riskLevel}</div>
                    
                    {/* Range Bar */}
                    <div style={{ position: 'relative', width: '100%', height: '12px', borderRadius: '6px', background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 40%, #6366f1 70%, #10b981 100%)', marginBottom: '30px' }}>
                        <div style={{
                            position: 'absolute',
                            top: '-5px',
                            left: `${((score - 300) / 600) * 100}%`,
                            width: '4px',
                            height: '22px',
                            background: '#fff',
                            borderRadius: '2px',
                            boxShadow: '0 0 10px rgba(255,255,255,0.8)'
                        }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                        <span>300</span>
                        <span>Poor</span>
                        <span>Average</span>
                        <span>Good</span>
                        <span>Excellent</span>
                        <span>900</span>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'left' }}>
                        <h4 className="outfit" style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Key Impact Factors</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <span style={{ color: paymentHistory >= 95 ? 'var(--success)' : 'var(--danger)' }}>{paymentHistory >= 95 ? '✔️' : '⚠️'}</span> 
                                Payment History: {paymentHistory}%
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <span style={{ color: creditUtilization <= 35 ? 'var(--success)' : 'var(--danger)' }}>{creditUtilization <= 35 ? '✔️' : '⚠️'}</span> 
                                Utilization: {creditUtilization}%
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                <span style={{ color: creditAge >= 5 ? 'var(--success)' : 'var(--warning)' }}>{creditAge >= 5 ? '✔️' : '⏳'}</span> 
                                Account Age: {creditAge} Yrs
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Score Trend Graph Section */}
                <div className="glass" style={{ padding: '30px', borderRadius: '20px', gridColumn: 'span 8', minHeight: '350px' }}>
                    <h3 className="outfit" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>PREDICTED SCORE TRAJECTORY</h3>
                    <div style={{ height: '280px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Credit Summary Table Section */}
                <div className="glass" style={{ padding: '30px', borderRadius: '20px', gridColumn: 'span 8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 className="outfit" style={{ fontSize: '1.3rem' }}>Account Summary</h3>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px' }}>Total: <strong>{totalAccounts}</strong></span>
                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px' }}>Loans: <strong>{activeLoans}</strong></span>
                            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '8px' }}>Cards: <strong>{creditCards}</strong></span>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <tr>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>Account Type</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>Count</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>Estimated Exposure</th>
                                <th style={{ padding: '15px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeLoans > 0 && (
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>Active Loans</td>
                                    <td style={{ padding: '15px' }}>{activeLoans}</td>
                                    <td style={{ padding: '15px' }}>₹{(activeLoans * 250000).toLocaleString()}</td>
                                    <td style={{ padding: '15px' }}><span style={{ color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>Current</span></td>
                                </tr>
                            )}
                            {creditCards > 0 && (
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>Credit Cards</td>
                                    <td style={{ padding: '15px' }}>{creditCards}</td>
                                    <td style={{ padding: '15px' }}>₹{totalCreditLimit.toLocaleString()}</td>
                                    <td style={{ padding: '15px' }}><span style={{ color: 'var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>Active</span></td>
                                </tr>
                            )}
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <td style={{ padding: '15px', fontWeight: '500' }}>Other Accounts</td>
                                <td style={{ padding: '15px' }}>{Math.max(0, totalAccounts - activeLoans - creditCards)}</td>
                                <td style={{ padding: '15px' }}>--</td>
                                <td style={{ padding: '15px' }}><span style={{ color: 'var(--text-secondary)', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>Settled/Misc</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Improvements Tips */}
                <div className="glass" style={{ padding: '30px', borderRadius: '20px', gridColumn: 'span 4' }}>
                    <h3 className="outfit" style={{ fontSize: '1.3rem', marginBottom: '20px', color: 'var(--primary)' }}>💡 Improvement Tips</h3>
                    <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {suggestions.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                        ))}
                    </ul>

                    <div style={{ marginTop: '30px', padding: '15px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '15px' }}>
                        <h4 className="outfit" style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1rem' }}>⭐ Expert Advice</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Maintaining a utilization below 30% and avoiding multiple hard inquiries can boost your score by 20-50 points in just 3-6 months.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CibilReport;

