import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userDashboardService } from '../services';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import BudgetInfo from '../components/BudgetInfo';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userDashboardService.getUserDashboard(new Date().getFullYear());
      setDashboardData(data);
      
      // Add budget alerts
      if (data.budgetTotal && data.budgetTotal > 0) {
        const percentage = data.pourcentageUtilisation || 0;
        
        if (percentage >= 90) {
          addAlert('warning', 'Budget presque épuisé', 
            `Votre département a utilisé ${percentage.toFixed(1)}% de son budget. Il reste ${formatCurrency(data.budgetRestant)}.`);
        }
        
        if (percentage >= 100) {
          addAlert('error', 'Budget dépassé', 
            'Votre département a dépassé son budget pour cette année. Contactez l\'administrateur.');
        }
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const addAlert = (type, title, message, autoClose = true) => {
    const id = Date.now();
    const newAlert = { id, type, title, message };
    setAlerts(prev => [...prev, newAlert]);
    
    if (autoClose) {
      setTimeout(() => {
        removeAlert(id);
      }, 8000);
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getExpenseTypeColor = (type) => {
    const colors = {
      'EQUIPEMENT': 'bg-blue-100 text-blue-800',
      'FORMATION': 'bg-green-100 text-green-800',
      'MAINTENANCE': 'bg-orange-100 text-orange-800',
      'LOGISTIQUE': 'bg-purple-100 text-purple-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['AUTRE'];
  };

  const getBudgetUsagePercentage = () => {
    if (!dashboardData || !dashboardData.budgetTotal) return 0;
    return dashboardData.pourcentageUtilisation || 0;
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <Alert
            type="error"
            title="Erreur"
            message={error}
            onClose={() => setError(null)}
          />
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <Alert
            type="warning"
            title="Aucune donnée"
            message="Aucune donnée disponible pour votre département"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Tableau de Bord
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.nom} - Département {dashboardData.departementNom}
          </p>
        </div>

        {/* Alerts */}
        <div className="mb-6 space-y-3">
          {alerts.map(alert => (
            <Alert
              key={alert.id}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => removeAlert(alert.id)}
            />
          ))}
        </div>

        {/* Budget Overview */}
        {dashboardData.budgetTotal && (
          <div className="mb-8">
            <BudgetInfo
              totalBudget={dashboardData.budgetTotal}
              usedAmount={dashboardData.budgetUtilise}
              remainingAmount={dashboardData.budgetRestant}
              title={`Budget ${dashboardData.annee} - ${dashboardData.departementNom}`}
              size="lg"
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Budget Total"
            value={formatCurrency(dashboardData.budgetTotal || 0)}
            icon="account_balance_wallet"
            color="blue"
            subtitle={`Année ${dashboardData.annee || new Date().getFullYear()}`}
          />
          <StatCard
            title="Budget Utilisé"
            value={formatCurrency(dashboardData.budgetUtilise || 0)}
            icon="trending_up"
            color="orange"
            subtitle="Montant utilisé"
          />
          <StatCard
            title="Budget Restant"
            value={formatCurrency(dashboardData.budgetRestant || 0)}
            icon="savings"
            color="green"
            subtitle="Montant disponible"
          />
          <StatCard
            title="Utilisation"
            value={`${getBudgetUsagePercentage().toFixed(1)}%`}
            icon="pie_chart"
            color={getBudgetUsagePercentage() >= 90 ? 'red' : getBudgetUsagePercentage() >= 75 ? 'orange' : 'green'}
            subtitle="Du budget total"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = '/depenses'}
              disabled={dashboardData.budgetRestant <= 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                dashboardData.budgetRestant <= 0 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={dashboardData.budgetRestant <= 0 ? 'Budget épuisé' : 'Ajouter une nouvelle dépense'}
            >
              <span className="material-icons">add</span>
              Nouvelle Dépense
            </button>
                         <button
               onClick={() => window.location.href = '/rapports'}
               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
             >
               <span className="material-icons">assessment</span>
               Rapports
             </button>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons">refresh</span>
              Actualiser
            </button>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Dépenses Récentes
            </h2>
            <button
              onClick={() => window.location.href = '/depenses'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="material-icons">add</span>
              Voir Toutes
            </button>
          </div>

          {dashboardData.recentDepenses && dashboardData.recentDepenses.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentDepenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-blue-600">receipt</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.titre}</h3>
                      <p className="text-sm text-gray-500">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                          {expense.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(expense.montant)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-icons text-gray-300 text-4xl mb-2">receipt_long</span>
              <p className="text-gray-500">Aucune dépense récente</p>
            </div>
          )}
        </div>

        {/* Budget Tips */}
        {dashboardData.budgetRestant > 0 && dashboardData.budgetRestant < (dashboardData.budgetTotal || 0) * 0.1 && (
          <div className="mt-8">
            <Alert
              type="info"
              title="Conseil de gestion"
              message="Votre budget est presque épuisé. Pensez à prioriser vos dépenses et à planifier pour l'année prochaine."
            />
          </div>
        )}
      </main>
    </div>
  );
} 