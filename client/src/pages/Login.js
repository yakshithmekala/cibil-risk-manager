import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import './Login.css';

const Login = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaType, setMfaType] = useState('email');
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignup) {
                const res = await authAPI.signup(formData);
                login(res.data.token, res.data.user);
                navigate('/dashboard');
            } else {
                const res = await authAPI.login({ email: formData.email, password: formData.password });
                if (res.data.mfaRequired) {
                    setMfaRequired(true);
                    setUserId(res.data.userId);
                    setMfaType(res.data.mfaType || 'email');
                } else {
                    login(res.data.token, res.data.user);
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMfa = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authAPI.verifyMfa({ userId, code: mfaCode });
            login(res.data.token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'MFA verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass login-card fade-in" style={{ padding: '50px' }}>
                <div className="login-header">
                    <h1 className="outfit" style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '10px' }}>CIBIL Analysis</h1>
                    <p style={{ fontSize: '1.1rem' }}>{mfaRequired ? 'Security Verification' : (isSignup ? 'Create your premium account' : 'Financial Intelligence Portal')}</p>
                </div>

                {error && <div className="error-badge animate-up">{error}</div>}

                {!mfaRequired ? (
                    <form onSubmit={handleSubmit} className="animate-up">
                        {isSignup && (
                            <div className="input-group">
                                <label>Full Name</label>
                                <input name="fullName" type="text" placeholder="John Doe" style={{ height: '55px' }} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="input-group">
                            <label>Email Address</label>
                            <input name="email" type="email" placeholder="name@company.com" style={{ height: '55px' }} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input name="password" type="password" placeholder="••••••••" style={{ height: '55px' }} onChange={handleChange} required />
                        </div>
                        <button className="btn-premium" type="submit" style={{ width: '100%', height: '55px', fontSize: '1.1rem', marginTop: '10px' }} disabled={loading}>
                            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                        </button>

                        <div className="toggle-auth">
                            <p>
                                {isSignup ? 'Already have an account?' : "Don't have an account?"}
                                <span onClick={() => setIsSignup(!isSignup)}>
                                    {isSignup ? ' Sign In' : ' Sign Up'}
                                </span>
                            </p>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyMfa}>
                        <div className="mfa-instructions">
                            {mfaType === 'app'
                                ? "Enter the 6-digit code from your Google Authenticator app."
                                : "We've sent a 6-digit verification code to your email."}
                        </div>
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                placeholder="******"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                required
                                maxLength="6"
                                className="mfa-input"
                            />
                        </div>
                        <button className="primary-btn" type="submit" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <div className="toggle-auth">
                            <p><span onClick={() => setMfaRequired(false)}>Back to Login</span></p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
