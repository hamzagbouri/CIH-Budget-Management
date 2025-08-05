import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../components/NotificationSystem';
import { adminDashboardService } from '../services';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Pagination from '../components/Pagination';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  Title
);

export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [departmentsAnalytics, setDepartmentsAnalytics] = useState([]);
  const [pagedDepartments, setPagedDepartments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { success, error } = useNotifications();

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboard, analytics] = await Promise.all([
        adminDashboardService.getAdminDashboard(selectedYear),
        adminDashboardService.getDepartmentsAnalytics(selectedYear)
      ]);
      
      setDashboardData(dashboard);
      setDepartmentsAnalytics(analytics);
    } catch (err) {
      error('Erreur', err.message || 'Erreur lors du chargement des données');
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

  const getBudgetUsagePercentage = (used, total) => {
    const usedAmount = used || 0;
    const totalAmount = total || 0;
    return totalAmount > 0 ? (usedAmount / totalAmount) * 100 : 0;
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handlePageChange = (pagedData) => {
    setPagedDepartments(pagedData);
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-10 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-10">
          <div className="text-center text-gray-500">
            Aucune donnée disponible pour l'année {selectedYear}
          </div>
        </main>
      </div>
    );
  }

  // Prepare chart data
  const departmentNames = departmentsAnalytics.map(d => d.departementNom || 'Département inconnu');
  const departmentBudgets = departmentsAnalytics.map(d => d.budgetTotal || 0);
  const departmentUsed = departmentsAnalytics.map(d => d.budgetUtilise || 0);
  const departmentRemaining = departmentsAnalytics.map(d => d.budgetRestant || 0);

  const barChartData = {
    labels: departmentNames,
    datasets: [
      {
        label: 'Budget Utilisé',
        data: departmentUsed,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Budget Restant',
        data: departmentRemaining,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      }
    ]
  };

  const pieChartData = {
    labels: ['Budget Utilisé', 'Budget Restant'],
    datasets: [{
      data: [dashboardData.totalBudgetUtilise || 0, dashboardData.totalBudgetRestant || 0],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)'
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(34, 197, 94, 1)'
      ],
      borderWidth: 2,
    }]
  };

  const expenseStatusData = {
    labels: ['Validées', 'En Attente', 'Refusées'],
    datasets: [{
      data: [
        dashboardData.depensesValidees || 0,
        dashboardData.depensesEnAttente || 0,
        dashboardData.depensesRefusees || 0
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Statistiques Générales</h1>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            label="Budget Total" 
            value={formatCurrency(dashboardData.totalBudget)} 
            icon="account_balance" 
            color="bg-blue-100" 
          />
          <StatCard 
            label="Budget Utilisé" 
            value={formatCurrency(dashboardData.totalBudgetUtilise)} 
            icon="bar_chart" 
            color="bg-orange-100" 
          />
          <StatCard 
            label="Budget Restant" 
            value={formatCurrency(dashboardData.totalBudgetRestant)} 
            icon="savings" 
            color="bg-green-100" 
          />
          <StatCard 
            label="Départements" 
            value={dashboardData.totalDepartements.toString()} 
            icon="business" 
            color="bg-purple-100" 
          />
        </div>

        {/* Expense Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            label="Dépenses Validées" 
            value={dashboardData.depensesValidees.toString()} 
            icon="check_circle" 
            color="bg-green-100" 
          />
          <StatCard 
            label="En Attente" 
            value={dashboardData.depensesEnAttente.toString()} 
            icon="pending" 
            color="bg-yellow-100" 
          />
          <StatCard 
            label="Dépenses Refusées" 
            value={dashboardData.depensesRefusees.toString()} 
            icon="cancel" 
            color="bg-red-100" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budget Usage by Department */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Budget par Département</h2>
            <div className="h-80">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>

          {/* Global Budget Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Répartition du Budget Global</h2>
            <div className="h-80">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* Expense Status Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Statut des Dépenses</h2>
          <div className="h-80">
            <Pie data={expenseStatusData} options={pieChartOptions} />
          </div>
        </div>

        {/* Department Details Table */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Détails par Département</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Département</th>
                  <th className="text-left py-3 px-4 font-semibold">Responsable</th>
                  <th className="text-right py-3 px-4 font-semibold">Budget Total</th>
                  <th className="text-right py-3 px-4 font-semibold">Utilisé</th>
                  <th className="text-right py-3 px-4 font-semibold">Restant</th>
                  <th className="text-right py-3 px-4 font-semibold">% Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {(pagedDepartments.length > 0 ? pagedDepartments : departmentsAnalytics).map((dept, index) => {
                  const usagePercentage = getBudgetUsagePercentage(dept.budgetUtilise, dept.budgetTotal);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{dept.departementNom}</td>
                      <td className="py-3 px-4">{dept.responsableNom}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(dept.budgetTotal)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(dept.budgetUtilise)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(dept.budgetRestant)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${getStatusColor(usagePercentage)}`}>
                        {usagePercentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {departmentsAnalytics.length > 0 && (
            <Pagination 
              data={departmentsAnalytics}
              pageSize={10}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
} 