import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
    const [mfaType, setMfaType] = useState(user?.mfaType || 'email');
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMfaToggle = async () => {
        try {
            const res = await authAPI.updateMfa({ mfaEnabled: !mfaEnabled, mfaType });
            setMfaEnabled(res.data.mfaEnabled);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMfaTypeChange = async (type) => {
        try {
            const res = await authAPI.updateMfa({ mfaEnabled, mfaType: type });
            setMfaType(res.data.mfaType);
            if (type === 'app' && mfaEnabled) {
                fetchQrCode();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQrCode = async () => {
        setLoading(true);
        try {
            const res = await authAPI.setupAppMfa();
            setQrCode(res.data.qrCodeUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mfaEnabled && mfaType === 'app') {
            fetchQrCode();
        }
    }, [mfaEnabled, mfaType]);

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '30px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/dashboard" className="btn-secondary">← Dashboard</Link>
                <h1 className="outfit">User Profile</h1>
                <button onClick={logout} className="btn-secondary">Logout</button>
            </div>

            <div className="glass" style={{ padding: '30px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h3 className="outfit">Account Information</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Email: {user?.email}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>Name: {user?.fullName}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '30px' }}>
                    <h3 className="outfit">Security (MFA)</h3>
                    <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Multi-Factor Authentication</span>
                        <button
                            className={mfaEnabled ? 'btn-premium' : 'btn-secondary'}
                            onClick={handleMfaToggle}
                        >
                            {mfaEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>

                    {mfaEnabled && (
                        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
                            <h4 className="outfit">Verification Method</h4>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <div
                                    onClick={() => handleMfaTypeChange('email')}
                                    style={{
                                        padding: '15px',
                                        flex: 1,
                                        textAlign: 'center',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: `2px solid ${mfaType === 'email' ? 'var(--primary)' : 'var(--card-border)'}`,
                                        background: mfaType === 'email' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    📩 Email
                                </div>
                                <div
                                    onClick={() => handleMfaTypeChange('app')}
                                    style={{
                                        padding: '15px',
                                        flex: 1,
                                        textAlign: 'center',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: `2px solid ${mfaType === 'app' ? 'var(--primary)' : 'var(--card-border)'}`,
                                        background: mfaType === 'app' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    📱 Authenticator
                                </div>
                            </div>

                            {mfaType === 'app' && qrCode && (
                                <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px', background: 'white', borderRadius: '15px' }}>
                                    <p style={{ color: '#000', marginBottom: '15px', fontWeight: 'bold' }}>Scan with Google Authenticator</p>
                                    <img src={qrCode} alt="QR Code" style={{ width: '200px' }} />
                                    <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '10px' }}>Secret: {user?.mfaSecret}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
