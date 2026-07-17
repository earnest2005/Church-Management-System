import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ModalProvider } from './contexts/ModalContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Offerings from './pages/Offerings';
import Reports from './pages/Reports';
import Staff from './pages/Staff';

// Placeholder components for other routes

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ModalProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<Members />} />
            <Route path="offerings" element={<Offerings />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="staff" element={<Staff />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ModalProvider>
    </ThemeProvider>
  </Router>
  );
}

export default App;
