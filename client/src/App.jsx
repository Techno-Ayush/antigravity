import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Credits from './pages/Credits';
import Workspace from './pages/Workspace';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          {/* Default landing displays full peer-to-peer project details */}
          <Route path="/" element={<Overview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/sessions" element={<Workspace type="sessions" />} />
          <Route path="/messages" element={<Workspace type="messages" />} />
          <Route path="/profile" element={<Workspace type="profile" />} />
          <Route path="/profile/:id" element={<Workspace type="profile" />} />
          <Route path="/admin" element={<Workspace type="admin" />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}
