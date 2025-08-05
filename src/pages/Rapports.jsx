import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../components/NotificationSystem';
import { userExpenseService, userAnalyticsService } from '../services';
import * as XLSX from 'xlsx';

export default function Rapports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const { success, error: showError } = useNotifications();

  // Filter state
  const [filters, setFilters] = useState({
    type: 'prestataire', // 'prestataire' or 'date'
    prestataire: '',
    dateFrom: '',
    dateTo: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, prestatairesData] = await Promise.all([
        userExpenseService.getUserExpenses(filters.year),
        userAnalyticsService.getPrestataires()
      ]);
      
      setExpenses(expensesData);
      setPrestataires(prestatairesData);
      setFilteredExpenses(expensesData);
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors du chargement des données');
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

  const getStatusColor = (status) => {
    const colors = {
      'VALID': 'bg-green-100 text-green-800',
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'INVALID': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors['EN_ATTENTE'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'VALID': 'Validée',
      'EN_ATTENTE': 'En Attente',
      'INVALID': 'Refusée'
    };
    return labels[status] || status;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (filters.type === 'prestataire' && filters.prestataire) {
      filtered = filtered.filter(expense => 
        expense.prestataire && 
        expense.prestataire.toLowerCase().includes(filters.prestataire.toLowerCase())
      );
    } else if (filters.type === 'date') {
      if (filters.dateFrom) {
        filtered = filtered.filter(expense => expense.date >= filters.dateFrom);
      }
      if (filters.dateTo) {
        filtered = filtered.filter(expense => expense.date <= filters.dateTo);
      }
    }

    setFilteredExpenses(filtered);
  };

  const generateExcel = () => {
    if (filteredExpenses.length === 0) {
      showError('Erreur', 'Aucune donnée à exporter');
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = filteredExpenses.map(expense => ({
        'ID': expense.id,
        'Titre': expense.titre,
        'Description': expense.description,
        'Type': expense.type,
        'Date': formatDate(expense.date),
        'Montant (MAD)': expense.montant,
        'Prestataire': expense.prestataire || '-',
        'Statut': getStatusLabel(expense.status),
        'Département ID': expense.departementId
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 },  // ID
        { wch: 30 }, // Titre
        { wch: 40 }, // Description
        { wch: 15 }, // Type
        { wch: 12 }, // Date
        { wch: 15 }, // Montant
        { wch: 20 }, // Prestataire
        { wch: 12 }, // Statut
        { wch: 15 }  // Département ID
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport Dépenses');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filterType = filters.type === 'prestataire' ? 'Prestataire' : 'Date';
      const filterValue = filters.type === 'prestataire' ? filters.prestataire : `${filters.dateFrom}_${filters.dateTo}`;
      const filename = `Rapport_Depenses_${filterType}_${filterValue}_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      success('Succès', `Rapport Excel généré: ${filename}`);
    } catch (err) {
      showError('Erreur', 'Erreur lors de la génération du rapport Excel');
    }
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + (expense.montant || 0), 0);
  };

  const getExpenseCount = () => {
    return filteredExpenses.length;
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement des rapports..." />
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
            Rapports et Export
          </h1>
          <p className="text-gray-600">
            Générez des rapports Excel filtrés par prestataire ou période
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Filtres de Rapport</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Filtre
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="prestataire">Par Prestataire</option>
                <option value="date">Par Période</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année
              </label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Prestataire Filter */}
            {filters.type === 'prestataire' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prestataire
                </label>
                <input
                  type="text"
                  name="prestataire"
                  value={filters.prestataire}
                  onChange={handleFilterChange}
                  placeholder="Rechercher un prestataire..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Date Filters */}
            {filters.type === 'date' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Appliquer les Filtres
            </button>
            <button
              onClick={() => {
                setFilters({
                  type: 'prestataire',
                  prestataire: '',
                  dateFrom: '',
                  dateTo: '',
                  year: new Date().getFullYear()
                });
                setFilteredExpenses(expenses);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dépenses</p>
                <p className="text-2xl font-bold text-gray-900">{getExpenseCount()}</p>
              </div>
              <span className="material-icons text-blue-600 text-3xl">receipt</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalAmount())}</p>
              </div>
              <span className="material-icons text-green-600 text-3xl">account_balance_wallet</span>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moyenne par Dépense</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getExpenseCount() > 0 ? formatCurrency(getTotalAmount() / getExpenseCount()) : '0 DH'}
                </p>
              </div>
              <span className="material-icons text-orange-600 text-3xl">trending_up</span>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Export Excel</h2>
            <button
              onClick={generateExcel}
              disabled={filteredExpenses.length === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                filteredExpenses.length === 0
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <span className="material-icons">download</span>
              Générer Excel
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Le rapport Excel contiendra {filteredExpenses.length} dépense(s) pour un total de {formatCurrency(getTotalAmount())}</p>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Résultats du Filtre</h2>
          </div>
          
          {filteredExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dépense
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prestataire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{expense.titre}</div>
                          <div className="text-sm text-gray-500">{expense.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                          {expense.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(expense.montant)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.prestataire || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {getStatusLabel(expense.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons text-gray-300 text-4xl mb-2">assessment</span>
              <p className="text-gray-500">Aucune dépense trouvée avec les filtres actuels</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 