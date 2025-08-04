import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import cihLogo from '../assets/Cih.png';

const navItems = [
  { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
  { label: 'Dépenses', icon: 'account_balance_wallet', route: '/depenses' },
  { label: 'Historique', icon: 'history', route: '/historique' },
  { label: 'Mon profil', icon: 'person', route: '/profile' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Sidebar width classes
  const sidebarWidth = collapsed ? 'md:w-20' : 'md:w-72';

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
    <>
      {/* Hamburger icon for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white rounded-full p-2 shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        style={{ display: open ? 'none' : 'block' }}
      >
        <span className="material-icons text-3xl text-gray-700">menu</span>
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Sidebar */}
      <aside
        className={`flex md:flex-col justify-between w-64 ${sidebarWidth} min-h-[64px] md:min-h-screen bg-[#e3eaed] p-3 md:p-6 mb-4 md:mb-0 fixed md:static top-0 left-0 z-30 transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all`}
        style={{ height: '100vh' }}
      >
        <div className={`flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-12 w-full ${collapsed ? 'md:items-center' : ''}`}>
          {/* Logo and collapse/expand button */}
          <div className={`flex items-center gap-3 mb-0 md:mb-12 w-full ${collapsed ? 'justify-center' : ''}`}>
            <img src={cihLogo} alt="CIH Logo" className={`object-contain ${collapsed ? 'w-8 h-8 md:w-8 md:h-8' : 'w-8 h-8 md:w-10 md:h-10'}`} />
            {!collapsed && <span className="text-gray-800 text-lg md:text-2xl font-bold">CIH <span className="font-normal">BANK</span></span>}
            {/* Collapse/expand chevron for desktop */}
            <button
              className="hidden md:inline-flex ml-auto bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 transition-colors"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
              tabIndex={0}
            >
              <span className="material-icons text-gray-700 text-xl transition-transform" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                chevron_left
              </span>
            </button>
          </div>
          {/* Navigation */}
          <nav className={`flex flex-row md:flex-col gap-2 md:gap-4 w-full ${collapsed ? 'md:items-center' : ''}`}>
            {navItems.map((item, idx) => {
              const isActive = location.pathname.startsWith(item.route);
              return (
                <button
                  key={item.label}
                  className={`flex items-center justify-center md:justify-start gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-lg text-base md:text-lg font-medium transition-colors w-full ${isActive ? 'bg-blue-500 text-white' : 'bg-[#f5f7fa] text-gray-700 hover:bg-blue-100'} ${collapsed ? 'md:justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                  onClick={() => { navigate(item.route); setOpen(false); }}
                >
                  <span className="material-icons text-xl md:text-2xl">{item.icon}</span>
                  {!collapsed && <span className="hidden md:inline">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Logout button */}
        <button 
          className={`w-full mt-2 md:mt-8 py-2 md:py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base md:text-lg transition-colors ${collapsed ? 'md:w-12 md:h-12 md:p-0 flex items-center justify-center' : ''}`}
          title={collapsed ? 'Deconnexion' : undefined}
          onClick={handleLogout}
        >
          <span className="material-icons md:mr-2">logout</span>
          {!collapsed && <span className="hidden md:inline">Deconnexion</span>}
        </button>
        {/* Close icon for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
        >
          <span className="material-icons text-2xl text-gray-700">close</span>
        </button>
      </aside>
    </>
  );
} 