import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import UserSidebar from '../components/UserSidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getUserDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getBudgetUsagePercentage = () => {
    if (!dashboardData?.budget?.montant) return 0;
    const used = dashboardData.budget.montant - (dashboardData.budgetRestant || 0);
    return Math.round((used / dashboardData.budget.montant) * 100);
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <UserSidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <UserSidebar />
        <main className="flex-1 p-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-3">error</span>
              <div>
                <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <UserSidebar />
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.nom} • {dashboardData?.departement?.nom}
          </p>
        </div>

        {/* Department Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {dashboardData?.departement?.nom}
              </h2>
              <p className="text-blue-100">
                Gestionnaire: {user?.nom} • Matricule: {user?.matricule}
              </p>
            </div>
            <div className="hidden md:block">
              <span className="material-icons text-4xl text-blue-200">apartment</span>
            </div>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Budget Total"
            value={formatCurrency(dashboardData?.budget?.montant || 0)}
            icon="account_balance"
            color="blue"
            trend="up"
          />
          <StatCard
            label="Budget Utilisé"
            value={formatCurrency((dashboardData?.budget?.montant || 0) - (dashboardData?.budgetRestant || 0))}
            icon="trending_up"
            color="orange"
            trend="up"
          />
          <StatCard
            label="Budget Restant"
            value={formatCurrency(dashboardData?.budgetRestant || 0)}
            icon="savings"
            color="green"
            trend="down"
          />
        </div>

        {/* Budget Progress */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Utilisation du budget</h3>
            <span className={`text-sm font-medium ${getBudgetStatusColor(getBudgetUsagePercentage())}`}>
              {getBudgetUsagePercentage()}% utilisé
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                getBudgetUsagePercentage() >= 90 ? 'bg-red-500' :
                getBudgetUsagePercentage() >= 75 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getBudgetUsagePercentage(), 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>0 DH</span>
            <span>{formatCurrency(dashboardData?.budget?.montant || 0)}</span>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Dépenses récentes</h3>
              <span className="text-sm text-gray-500">
                {dashboardData?.recentesDepenses?.length || 0} dépenses
              </span>
            </div>
          </div>
          
          {dashboardData?.recentesDepenses?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {dashboardData.recentesDepenses.map((expense, index) => (
                <div key={expense.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expense.type === 'OPERATIONNEL' ? 'bg-blue-100 text-blue-600' :
                        expense.type === 'INVESTISSEMENT' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="material-icons text-lg">
                          {expense.type === 'OPERATIONNEL' ? 'build' :
                           expense.type === 'INVESTISSEMENT' ? 'trending_up' : 'receipt'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.titre}</h4>
                        <p className="text-sm text-gray-500">{expense.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatDate(expense.date)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            expense.type === 'OPERATIONNEL' ? 'bg-blue-100 text-blue-700' :
                            expense.type === 'INVESTISSEMENT' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {expense.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(expense.montant)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <span className="material-icons text-4xl text-gray-300 mb-4">receipt_long</span>
              <p className="text-gray-500">Aucune dépense récente</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 