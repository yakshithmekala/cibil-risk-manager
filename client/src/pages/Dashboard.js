import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { cibilAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const getScoreColor = (score) => {
    if (score >= 750) return 'var(--success)';
    if (score >= 700) return 'var(--primary)';
    if (score >= 650) return 'var(--warning)';
    return 'var(--danger)';
};

const getScoreBg = (score) => {
    if (score >= 750) return 'rgba(16, 185, 129, 0.1)';
    if (score >= 700) return 'rgba(99, 102, 241, 0.1)';
    if (score >= 650) return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
};

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        paymentHistory: 100,
        creditUtilization: 30,
        creditAge: 5,
        creditMix: 'good',
        hardInquiries: 0
    });
    const [analyzing, setAnalyzing] = useState(false);
    const { logout, user } = useAuth();

    const fetchHistory = async () => {
        try {
            const res = await cibilAPI.getUsers();
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setAnalyzing(true);
        try {
            await cibilAPI.analyze(formData);
            fetchHistory();
            setFormData({
                fullName: '',
                paymentHistory: 100,
                creditUtilization: 30,
                creditAge: 5,
                creditMix: 'good',
                hardInquiries: 0
            });
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this assessment?")) {
            try {
                await cibilAPI.deleteUser(id);
                fetchHistory();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleExport = () => {
        if (history.length === 0) {
            alert("No data to export");
            return;
        }

        const exportData = history.map(item => ({
            'Full Name': item.fullName,
            'Estimated Score': item.estimatedScore,
            'Risk Level': item.riskLevel,
            'Payment History (%)': item.paymentHistory,
            'Credit Utilization (%)': item.creditUtilization,
            'Credit Age (Years)': item.creditAge,
            'Credit Mix': item.creditMix,
            'Hard Inquiries': item.hardInquiries,
            'Date': new Date(item.createdAt).toLocaleDateString(),
            'Suggestions': item.suggestions ? item.suggestions.join(', ') : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Assessments");
        XLSX.writeFile(workbook, `CIBIL_Assessments_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Chart Data Processing
    const lineChartData = useMemo(() => {
        const sorted = [...history].reverse();
        return {
            labels: sorted.map(item => new Date(item.createdAt).toLocaleDateString()),
            datasets: [
                {
                    label: 'Score Trend',
                    data: sorted.map(item => item.estimatedScore),
                    fill: true,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 8,
                },
            ],
        };
    }, [history]);

    const pieChartData = useMemo(() => {
        const counts = { Excellent: 0, Good: 0, Average: 0, Poor: 0, 'Very Poor': 0 };
        history.forEach(item => { counts[item.riskLevel] = (counts[item.riskLevel] || 0) + 1; });
        return {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#7f1d1d'],
                borderWidth: 0,
            }],
        };
    }, [history]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', minHeight: '100vh', padding: '10px 20px', color: 'white' }}>
            {/* Header / Nav */}
            <div className="glass" style={{ padding: '15px 30px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>C</div>
                    <h2 className="outfit" style={{ fontSize: '1.4rem' }}>Intelligence Dashboard</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user?.fullName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Premium Control</div>
                    </div>
                    <Link to="/profile" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Profile</Link>
                    <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', color: 'var(--danger)' }}>Logout</button>
                </div>
            </div>

            <div className="dashboard-grid fade-in" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>

                {/* LEFT COLUMN: STATS & FORM (4 cols) */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Stats Summary */}
                    <div className="glass" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>TOTAL CHECKS</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '5px' }}>{history.length}</div>
                        </div>
                        <div style={{ padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>AVG SCORE</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '5px', color: 'var(--primary)' }}>
                                {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.estimatedScore, 0) / history.length) : '0'}
                            </div>
                        </div>
                    </div>

                    {/* Compact Analysis Form */}
                    <div className="glass animate-up" style={{ padding: '25px', flex: 1 }}>
                        <h3 className="outfit" style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--primary)' }}>✦</span> Quick Audit
                        </h3>
                        <form onSubmit={handleAnalyze}>
                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontSize: '0.8rem' }}>Client Name</label>
                                <input name="fullName" type="text" value={formData.fullName} style={{ height: '45px', padding: '10px 15px' }} placeholder="Full Name" onChange={handleChange} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Payment (%)</label>
                                    <input name="paymentHistory" type="number" value={formData.paymentHistory} style={{ height: '45px' }} onChange={handleChange} required />
                                </div>
                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Util (%)</label>
                                    <input name="creditUtilization" type="number" value={formData.creditUtilization} style={{ height: '45px' }} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Age (Yrs)</label>
                                    <input name="creditAge" type="number" value={formData.creditAge} style={{ height: '45px' }} onChange={handleChange} required />
                                </div>
                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.8rem' }}>Mix</label>
                                    <select name="creditMix" value={formData.creditMix} style={{ height: '45px' }} onChange={handleChange}>
                                        <option value="good">Good</option>
                                        <option value="average">Avg</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group" style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.8rem' }}>Hard Inquiries</label>
                                <input name="hardInquiries" type="number" value={formData.hardInquiries} style={{ height: '45px' }} onChange={handleChange} required />
                            </div>
                            <button className="btn-premium" type="submit" style={{ width: '100%', height: '50px', fontSize: '1rem' }} disabled={analyzing}>
                                {analyzing ? 'Processing...' : 'Run Analysis'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: CHARTS & TABLE (8 cols) */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '20px' }}>
                        <div className="glass" style={{ padding: '20px', height: '300px' }}>
                            <h4 className="outfit" style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>SCORE TREND</h4>
                            <div style={{ height: '220px' }}>
                                <Line data={lineChartData} options={chartOptions} />
                            </div>
                        </div>
                        <div className="glass" style={{ padding: '20px', height: '300px' }}>
                            <h4 className="outfit" style={{ fontSize: '0.9rem', marginBottom: '15px', color: 'var(--text-secondary)' }}>RISK SPLIT</h4>
                            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Pie data={pieChartData} options={{ ...chartOptions, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } } } }} />
                            </div>
                        </div>
                    </div>

                    {/* Records Table */}
                    <div className="glass" style={{ flex: 1, padding: '25px', minHeight: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 className="outfit" style={{ fontSize: '1.1rem' }}>Assessment Logs</h3>
                            <button onClick={handleExport} className="btn-secondary" style={{ fontSize: '0.7rem' }}>Export All</button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-deep)', zIndex: 10 }}>
                                    <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--card-border)' }}>
                                        <th style={{ padding: '15px', fontSize: '0.8rem' }}>NAME</th>
                                        <th style={{ padding: '15px', fontSize: '0.8rem' }}>SCORE</th>
                                        <th style={{ padding: '15px', fontSize: '0.8rem' }}>RISK</th>
                                        <th style={{ padding: '15px', fontSize: '0.8rem' }}>DATE</th>
                                        <th style={{ padding: '15px', fontSize: '0.8rem' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item) => (
                                        <tr key={item._id} className="glass-hover" style={{ borderBottom: '1px solid var(--card-border)' }}>
                                            <td style={{ padding: '15px', fontWeight: '600', fontSize: '0.9rem' }}>{item.fullName}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    background: getScoreBg(item.estimatedScore),
                                                    color: getScoreColor(item.estimatedScore),
                                                    fontWeight: '800',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {item.estimatedScore}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px', fontSize: '0.85rem' }}>{item.riskLevel}</td>
                                            <td style={{ padding: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '15px' }}>
                                                <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {history.length === 0 && <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>No records yet.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
