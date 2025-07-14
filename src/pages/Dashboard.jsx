import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDepartementDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
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
    if (!dashboardData || !dashboardData.budget) return 0;
    return dashboardData.budget.montant > 0 
      ? (dashboardData.totalDepenses / dashboardData.budget.montant) * 100 
      : 0;
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-3">error</span>
              <div>
                <h3 className="text-red-800 font-semibold">Erreur</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center">
              <span className="material-icons text-yellow-500 mr-3">warning</span>
              <div>
                <h3 className="text-yellow-800 font-semibold">Aucune donnée</h3>
                <p className="text-yellow-700">Aucune donnée disponible pour votre département</p>
              </div>
            </div>
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Budget Total"
            value={formatCurrency(dashboardData.budget?.montant || 0)}
            icon="account_balance_wallet"
            color="blue"
            subtitle={`Année ${dashboardData.budget?.annee || new Date().getFullYear()}`}
          />
          <StatCard
            title="Dépenses Totales"
            value={formatCurrency(dashboardData.totalDepenses || 0)}
            icon="trending_up"
            color="orange"
            subtitle="Montant dépensé"
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

        {/* Budget Progress */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Utilisation du Budget - {dashboardData.budget?.annee || new Date().getFullYear()}
            </h2>
            <span className={`text-sm font-medium ${getBudgetStatusColor(getBudgetUsagePercentage())}`}>
              {getBudgetUsagePercentage().toFixed(1)}% utilisé
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                getBudgetUsagePercentage() >= 90 ? 'bg-red-500' :
                getBudgetUsagePercentage() >= 75 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getBudgetUsagePercentage(), 100)}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.budget?.montant || 0)}
              </p>
              <p className="text-sm text-gray-500">Budget Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(dashboardData.totalDepenses || 0)}
              </p>
              <p className="text-sm text-gray-500">Dépensé</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.budgetRestant || 0)}
              </p>
              <p className="text-sm text-gray-500">Restant</p>
            </div>
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

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 mt-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = '/depenses'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="material-icons">add</span>
              Nouvelle Dépense
            </button>
            <button
              onClick={() => window.location.href = '/historique'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="material-icons">history</span>
              Historique
            </button>
            <button
              onClick={() => window.location.href = '/rapports'}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
      </main>
    </div>
  );
} 