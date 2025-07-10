import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoleProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/depenses" element={<Depenses />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/rapports" element={<Rapports />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/admin/departements" element={<AdminDepartements />} />
            <Route path="/admin/responsables" element={<AdminResponsables />} />
            <Route path="/admin/validation-depenses" element={<AdminValidationDepenses />} />
            <Route path="/admin/stats" element={<AdminStats />} />
          </Routes>
        </RoleProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
