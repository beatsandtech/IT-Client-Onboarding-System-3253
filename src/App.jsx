import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Welcome from './components/Welcome';
import OnboardingForm from './components/OnboardingForm';
import ServiceSelection from './components/ServiceSelection';
import TechnicalAssessment from './components/TechnicalAssessment';
import ProjectTimeline from './components/ProjectTimeline';
import ContractReview from './components/ContractReview';
import Completion from './components/Completion';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminDashboard from './components/admin/AdminDashboard';
import TechDashboard from './components/tech/TechDashboard';
import ClientDetails from './components/admin/ClientDetails';
import DocumentUpload from './components/shared/DocumentUpload';
import RequireAuth from './components/auth/RequireAuth';
import { OnboardingProvider } from './context/OnboardingContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Onboarding flow */}
                <Route path="/onboarding" element={<OnboardingForm />} />
                <Route path="/services" element={<ServiceSelection />} />
                <Route path="/assessment" element={<TechnicalAssessment />} />
                <Route path="/timeline" element={<ProjectTimeline />} />
                <Route path="/contract" element={<ContractReview />} />
                <Route path="/completion" element={<Completion />} />
                
                {/* Protected client routes */}
                <Route path="/dashboard" element={
                  <RequireAuth allowedRoles={['client']}>
                    <Dashboard />
                  </RequireAuth>
                } />
                <Route path="/documents" element={
                  <RequireAuth allowedRoles={['client', 'admin', 'tech']}>
                    <DocumentUpload />
                  </RequireAuth>
                } />
                
                {/* Protected admin routes */}
                <Route path="/admin" element={
                  <RequireAuth allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RequireAuth>
                } />
                <Route path="/admin/client/:id" element={
                  <RequireAuth allowedRoles={['admin', 'tech']}>
                    <ClientDetails />
                  </RequireAuth>
                } />
                
                {/* Protected tech routes */}
                <Route path="/tech" element={
                  <RequireAuth allowedRoles={['tech']}>
                    <TechDashboard />
                  </RequireAuth>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;