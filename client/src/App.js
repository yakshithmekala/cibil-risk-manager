import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/profile";
import LiveBackground from "./components/LiveBackground";
import Home from "./pages/Home";
import CibilForm from "./pages/CibilForm";
import CibilReport from "./pages/CibilReport";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/" />;
};

const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/home" /> : children;
};

function App() {
    return (
        <AuthProvider>
            <LiveBackground />
            <Router>
                <Routes>
                    <Route path="/" element={<AuthRedirect><Login /></AuthRedirect>} />
                    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/cibil-form" element={<PrivateRoute><CibilForm /></PrivateRoute>} />
                    <Route path="/cibil-report" element={<PrivateRoute><CibilReport /></PrivateRoute>} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    {/* Cibil is now integrated into Dashboard */}
                    <Route path="/cibil" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
