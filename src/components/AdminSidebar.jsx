import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cihLogo from '../assets/Cih.png';

const links = [
  { to: '/admin/dashboard', label: 'Tableau de Bord', icon: 'dashboard' },
  { to: '/admin/departements', label: 'Départements', icon: 'apartment' },
  { to: '/admin/responsables', label: 'Responsables', icon: 'supervisor_account' },
  { to: '/admin/budgets', label: 'Gestion Budgets', icon: 'account_balance_wallet' },
  { to: '/admin/validation-depenses', label: 'Validation Dépenses', icon: 'fact_check' },
  { to: '/admin/stats', label: 'Statistiques', icon: 'insights' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to auth page even if logout fails
      navigate('/auth');
    }
  };

  return (
    <aside className="flex flex-col justify-between w-full md:w-64 min-h-screen bg-[#e9eff2] px-6 py-8">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <img src={cihLogo} alt="CIH Logo" className="w-10 h-10 object-contain" />
          <span className="text-gray-800 text-2xl font-bold">CIH <span className="font-normal">BANK</span></span>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-5">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium border-none transition-colors ` +
                (isActive
                  ? 'bg-[#00AEEF] text-white shadow'
                  : 'bg-[#E5E7EB] text-black hover:bg-[#d1d5db]')
              }
              style={{ boxShadow: 'none' }}
            >
              <span className="material-icons text-2xl text-black">{link.icon}</span>
              <span className="text-base font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      {/* Logout button */}
      <button 
        className="w-full mt-8 py-3 rounded-lg bg-[#F15A29] hover:bg-orange-600 text-white font-semibold text-lg transition-colors"
        onClick={handleLogout}
      >
        Deconnexion
      </button>
    </aside>
  );
} 