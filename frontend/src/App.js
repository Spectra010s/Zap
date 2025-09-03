import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { VoiceControlProvider } from './contexts/VoiceControlContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TableList from './components/tables/TableList';
import TableDetail from './components/tables/TableDetail';
import CreateTable from './components/tables/CreateTable';
import EditTable from './components/tables/EditTable';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import './App.css';

// Private Route component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <VoiceControlProvider>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables"
                element={
                  <PrivateRoute>
                    <Layout>
                      <TableList />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables/new"
                element={
                  <PrivateRoute>
                    <Layout>
                      <CreateTable />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables/:tableId"
                element={
                  <PrivateRoute>
                    <Layout>
                      <TableDetail />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/tables/:tableId/edit"
                element={
                  <PrivateRoute>
                    <Layout>
                      <EditTable />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </PrivateRoute>
                }
              />
              {/* Add more protected routes here */}
            </Routes>
          </div>
        </VoiceControlProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
