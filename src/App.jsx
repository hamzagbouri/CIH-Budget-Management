import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Depenses from './pages/Depenses';
import Historique from './pages/Historique';
import Rapports from './pages/Rapports';
import Budgets from './pages/Budgets';
import Utilisateurs from './pages/Utilisateurs';
import AdminDepartements from './pages/AdminDepartements';
import AdminResponsables from './pages/AdminResponsables';
import AdminValidationDepenses from './pages/AdminValidationDepenses';
import AdminStats from './pages/AdminStats';
import AdminBudgets from './pages/AdminBudgets';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { NotificationProvider } from './components/NotificationSystem';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoleProvider>
          <NotificationProvider>
            <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Redirect root to appropriate dashboard */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* User routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['USER', 'MANAGER']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/depenses" element={
              <ProtectedRoute allowedRoles={['USER', 'MANAGER']}>
                <Depenses />
              </ProtectedRoute>
            } />
            <Route path="/historique" element={
              <ProtectedRoute allowedRoles={['USER', 'MANAGER']}>
                <Historique />
              </ProtectedRoute>
            } />
            <Route path="/rapports" element={
              <ProtectedRoute allowedRoles={['USER', 'MANAGER']}>
                <Rapports />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/budgets" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Budgets />
              </ProtectedRoute>
            } />
            <Route path="/utilisateurs" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Utilisateurs />
              </ProtectedRoute>
            } />
            <Route path="/admin/departements" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDepartements />
              </ProtectedRoute>
            } />
            <Route path="/admin/responsables" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminResponsables />
              </ProtectedRoute>
            } />
            <Route path="/admin/validation-depenses" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminValidationDepenses />
              </ProtectedRoute>
            } />
            <Route path="/admin/stats" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStats />
              </ProtectedRoute>
            } />
            <Route path="/admin/budgets" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminBudgets />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
          </NotificationProvider>
        </RoleProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
