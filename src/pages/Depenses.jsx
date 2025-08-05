import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userExpenseService, userAnalyticsService } from '../services';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import BudgetInfo from '../components/BudgetInfo';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Depenses() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
     const [filters, setFilters] = useState({
     type: '',
     prestataire: '',
     dateFrom: '',
     dateTo: ''
   });

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    titre: '',
    description: '',
    type: '',
    date: '',
    montant: '',
    prestataire: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, analyticsData] = await Promise.all([
        userExpenseService.getUserExpenses(new Date().getFullYear()),
        userAnalyticsService.getUserAnalytics(new Date().getFullYear())
      ]);
      
      setExpenses(expensesData);
      
      // Set budget info from analytics
      if (analyticsData) {
        setBudgetInfo({
          totalBudget: analyticsData.budgetTotal,
          usedAmount: analyticsData.budgetUtilise,
          remainingAmount: analyticsData.budgetRestant,
          year: analyticsData.annee
        });
        setRemainingBudget(analyticsData.budgetRestant);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
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
      }, 5000);
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
      'EQUIPEMENT': 'bg-blue-100 text-blue-800 border-blue-200',
      'FORMATION': 'bg-green-100 text-green-800 border-green-200',
      'MAINTENANCE': 'bg-orange-100 text-orange-800 border-orange-200',
      'LOGISTIQUE': 'bg-purple-100 text-purple-800 border-purple-200',
      'AUTRE': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors['AUTRE'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROUVEE': 'bg-green-100 text-green-800 border-green-200',
      'REJETEE': 'bg-red-100 text-red-800 border-red-200',
      'EN_COURS': 'bg-blue-100 text-blue-800 border-blue-200',
      'TERMINEE': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors['EN_ATTENTE'];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'EN_ATTENTE': 'En Attente',
      'APPROUVEE': 'Approuvée',
      'REJETEE': 'Rejetée',
      'EN_COURS': 'En Cours',
      'TERMINEE': 'Terminée'
    };
    return labels[status] || 'En Attente';
  };

  const validateBudget = (amount, isEditing = false, originalAmount = 0) => {
    // Si on modifie une dépense existante, on doit considérer l'ancien montant
    if (isEditing) {
      const difference = amount - originalAmount;
      const availableBudget = remainingBudget + originalAmount; // On récupère l'ancien montant
      
      if (difference > remainingBudget) {
        return {
          valid: false,
          message: `Montant trop élevé. Budget disponible pour cette modification : ${formatCurrency(remainingBudget)}`
        };
      }
    } else {
      // Pour une nouvelle dépense
      if (remainingBudget <= 0) {
        return {
          valid: false,
          message: 'Budget épuisé pour cette année. Impossible d\'ajouter de nouvelles dépenses.'
        };
      }
      
      if (amount > remainingBudget) {
        return {
          valid: false,
          message: `Montant trop élevé. Budget restant : ${formatCurrency(remainingBudget)}`
        };
      }
    }
    
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amount = Number(expenseForm.montant);
    const isEditing = !!selectedExpense;
    const originalAmount = selectedExpense ? selectedExpense.montant : 0;
    const budgetValidation = validateBudget(amount, isEditing, originalAmount);
    
    if (!budgetValidation.valid) {
      addAlert('error', 'Budget insuffisant', budgetValidation.message);
      return;
    }

    try {
      setSubmitting(true);
             const expenseData = {
         titre: expenseForm.titre,
         description: expenseForm.description,
         type: expenseForm.type,
         date: expenseForm.date,
         montant: amount,
         prestataire: expenseForm.prestataire || ''
       };

      if (selectedExpense) {
        // Update existing expense
        const updatedExpense = await userExpenseService.updateExpense(selectedExpense.id, expenseData);
        setExpenses(prev => prev.map(exp => exp.id === selectedExpense.id ? updatedExpense : exp));
        setShowEditModal(false);
        addAlert('success', 'Dépense mise à jour', 'La dépense a été modifiée avec succès');
      } else {
        // Create new expense
        const newExpense = await userExpenseService.createExpense(expenseData);
        setExpenses(prev => [newExpense, ...prev]);
        setShowAddModal(false);
        addAlert('success', 'Dépense créée', 'La nouvelle dépense a été ajoutée avec succès');
        
        // Refresh data to update budget info
        await fetchData();
      }

      resetForm();
    } catch (err) {
      addAlert('error', 'Erreur', err.message || 'Erreur lors de la sauvegarde de la dépense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;

    try {
      await userExpenseService.deleteExpense(selectedExpense.id);
      setExpenses(prev => prev.filter(exp => exp.id !== selectedExpense.id));
      setShowDeleteModal(false);
      setSelectedExpense(null);
      addAlert('success', 'Dépense supprimée', 'La dépense a été supprimée avec succès');
      
      // Refresh data to update budget info
      await fetchData();
    } catch (err) {
      addAlert('error', 'Erreur', err.message || 'Erreur lors de la suppression');
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!expenseForm.titre.trim()) {
      errs.titre = 'Titre requis';
    }
    if (!expenseForm.description.trim()) {
      errs.description = 'Description requise';
    }
    if (!expenseForm.type) {
      errs.type = 'Type requis';
    }
    if (!expenseForm.date) {
      errs.date = 'Date requise';
    }
    if (!expenseForm.montant || Number(expenseForm.montant) <= 0) {
      errs.montant = 'Montant invalide';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validate budget when amount changes
    if (name === 'montant' && value) {
      const amount = Number(value);
      const isEditing = !!selectedExpense;
      const originalAmount = selectedExpense ? selectedExpense.montant : 0;
      
      if (isEditing) {
        const difference = amount - originalAmount;
        if (difference > remainingBudget) {
          setErrors(prev => ({ 
            ...prev, 
            montant: `Montant maximum autorisé pour cette modification : ${formatCurrency(remainingBudget)}` 
          }));
        }
      } else {
        if (amount > remainingBudget) {
          setErrors(prev => ({ 
            ...prev, 
            montant: `Montant maximum autorisé : ${formatCurrency(remainingBudget)}` 
          }));
        }
      }
    }
  };

     const resetForm = () => {
     setExpenseForm({
       titre: '',
       description: '',
       type: '',
       date: '',
       montant: '',
       prestataire: ''
     });
     setErrors({});
     setSelectedExpense(null);
   };

     const openEditModal = (expense) => {
     setSelectedExpense(expense);
     setExpenseForm({
       titre: expense.titre,
       description: expense.description,
       type: expense.type,
       date: expense.date,
       montant: expense.montant.toString(),
       prestataire: expense.prestataire || ''
     });
     setShowEditModal(true);
   };

  const openDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const openAddModal = () => {
    if (remainingBudget <= 0) {
      addAlert('warning', 'Budget épuisé', 'Vous ne pouvez pas ajouter de nouvelles dépenses car le budget est épuisé pour cette année.');
      return;
    }
    
    resetForm();
    setExpenseForm(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0]
    }));
    setShowAddModal(true);
  };

     // Filter expenses
   const filteredExpenses = expenses.filter(expense => {
     if (filters.type && expense.type !== filters.type) return false;
     if (filters.prestataire && expense.prestataire && !expense.prestataire.toLowerCase().includes(filters.prestataire.toLowerCase())) return false;
     if (filters.dateFrom && expense.date < filters.dateFrom) return false;
     if (filters.dateTo && expense.date > filters.dateTo) return false;
     return true;
   });

  // Chart data
  const getChartData = () => {
    const typeData = {};
    const monthlyData = {};
    const statusData = {};

    filteredExpenses.forEach(expense => {
      // Type distribution
      typeData[expense.type] = (typeData[expense.type] || 0) + expense.montant;

      // Monthly distribution
      const month = new Date(expense.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + expense.montant;

      // Status distribution
      statusData[expense.status] = (statusData[expense.status] || 0) + 1;
    });

    return {
      typeData: {
        labels: Object.keys(typeData),
        datasets: [{
          data: Object.values(typeData),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      monthlyData: {
        labels: Object.keys(monthlyData),
        datasets: [{
          label: 'Dépenses (MAD)',
          data: Object.values(monthlyData),
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
          borderWidth: 1
        }]
      },
      statusData: {
        labels: Object.keys(statusData).map(status => getStatusLabel(status)),
        datasets: [{
          data: Object.values(statusData),
          backgroundColor: [
            '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#6B7280'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      }
    };
  };

  const chartData = getChartData();

  // Table columns
  const columns = [
    {
      key: 'titre',
      label: 'Dépense',
      render: (value, row) => (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-icons text-white text-sm">receipt</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{value}</div>
            <div className="text-sm text-gray-500 line-clamp-2">{row.description}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getExpenseTypeColor(row.type)}`}>
                {row.type}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(row.date)}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (value) => (
        <div className="text-right">
          <div className="font-bold text-lg text-gray-900">{formatCurrency(value)}</div>
          <div className="text-xs text-gray-500">MAD</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}>
            {getStatusLabel(value)}
          </span>
        </div>
      )
    },
    {
      key: 'prestataire',
      label: 'Prestataire',
      render: (value) => (
        <div className="text-center">
          {value ? (
            <div className="flex items-center justify-center space-x-2">
              <span className="material-icons text-gray-400 text-sm">business</span>
              <span className="text-sm text-gray-700">{value}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
            title="Modifier"
          >
            <span className="material-icons text-sm">edit</span>
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
            title="Supprimer"
          >
            <span className="material-icons text-sm">delete</span>
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Sidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement des dépenses..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Gestion des Dépenses
              </h1>
              <p className="text-gray-600 text-lg">
                Suivi et gestion des dépenses du département {user?.departementNom}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openAddModal}
                disabled={remainingBudget <= 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  remainingBudget <= 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
                title={remainingBudget <= 0 ? 'Budget épuisé' : 'Ajouter une nouvelle dépense'}
              >
                <span className="material-icons">add</span>
                Nouvelle Dépense
              </button>
            </div>
          </div>
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

        {/* Error Display */}
        {error && (
          <Alert
            type="error"
            title="Erreur"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Budget Information */}
        {budgetInfo && (
          <div className="mb-8">
            <BudgetInfo
              totalBudget={budgetInfo.totalBudget}
              usedAmount={budgetInfo.usedAmount}
              remainingAmount={budgetInfo.remainingAmount}
              title={`Budget ${budgetInfo.year} - ${user?.departementNom || 'Département'}`}
              size="lg"
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white">receipt</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Total Dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.montant, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white">list</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Nombre</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white">trending_up</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredExpenses.length > 0 
                    ? formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.montant, 0) / filteredExpenses.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="material-icons text-white">calendar_today</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Ce Mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    filteredExpenses
                      .filter(exp => {
                        const expDate = new Date(exp.date);
                        const now = new Date();
                        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, exp) => sum + exp.montant, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Type</h3>
            <div className="h-64">
              <Pie data={chartData.typeData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution Mensuelle</h3>
            <div className="h-64">
              <Bar 
                data={chartData.monthlyData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }} 
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statut des Dépenses</h3>
            <div className="h-64">
              <Pie data={chartData.statusData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <SelectInput
                label="Type"
                name="type"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                options={[
                  { value: '', label: 'Tous les types' },
                  { value: 'EQUIPEMENT', label: 'Équipement' },
                  { value: 'FORMATION', label: 'Formation' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'LOGISTIQUE', label: 'Logistique' },
                  { value: 'AUTRE', label: 'Autre' }
                ]}
              />
              
              
              
              <FormInput
                label="Prestataire"
                name="prestataire"
                value={filters.prestataire}
                onChange={(e) => setFilters(prev => ({ ...prev, prestataire: e.target.value }))}
                placeholder="Rechercher par prestataire"
              />

              <FormInput
                label="Date de début"
                name="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />

              <FormInput
                label="Date de fin"
                name="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
                             <button
                 onClick={() => setFilters({ type: '', prestataire: '', dateFrom: '', dateTo: '' })}
                 className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
               >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Liste des Dépenses</h2>
            <p className="text-gray-600 mt-1">{filteredExpenses.length} dépense(s) trouvée(s)</p>
          </div>
          <Table
            data={filteredExpenses}
            columns={columns}
            itemsPerPage={10}
            searchable
            sortable
          />
        </div>

        {/* Add Expense Modal */}
        <Modal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
          title="Nouvelle Dépense"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Budget Warning */}
            {remainingBudget <= 0 && (
              <Alert
                type="error"
                title="Budget épuisé"
                message="Vous ne pouvez pas ajouter de nouvelles dépenses car le budget est épuisé pour cette année."
              />
            )}

            {remainingBudget > 0 && (
              <Alert
                type="info"
                title="Budget disponible"
                message={`Budget restant pour cette année : ${formatCurrency(remainingBudget)}`}
              />
            )}

            <FormInput
              label="Titre"
              name="titre"
              value={expenseForm.titre}
              onChange={handleChange}
              required
              error={errors.titre}
            />

            <FormInput
              label="Description"
              name="description"
              value={expenseForm.description}
              onChange={handleChange}
              required
              error={errors.description}
              multiline
            />

            <SelectInput
              label="Type"
              name="type"
              value={expenseForm.type}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'EQUIPEMENT', label: 'Équipement' },
                { value: 'FORMATION', label: 'Formation' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
                { value: 'LOGISTIQUE', label: 'Logistique' },
                { value: 'AUTRE', label: 'Autre' }
              ]}
              required
              error={errors.type}
            />

            <FormInput
              label="Date"
              name="date"
              type="date"
              value={expenseForm.date}
              onChange={handleChange}
              required
              error={errors.date}
            />

            <FormInput
              label={`Montant (MAD) - Max: ${formatCurrency(remainingBudget)}`}
              name="montant"
              type="number"
              value={expenseForm.montant}
              onChange={handleChange}
              required
              error={errors.montant}
              placeholder="0"
              min="0"
              max={remainingBudget}
              step="100"
            />

            <FormInput
              label="Prestataire (optionnel)"
              name="prestataire"
              value={expenseForm.prestataire}
              onChange={handleChange}
              error={errors.prestataire}
              placeholder="Nom du prestataire"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || remainingBudget <= 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Création...
                  </span>
                ) : (
                  'Créer la Dépense'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Expense Modal */}
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          title="Modifier la Dépense"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Titre"
              name="titre"
              value={expenseForm.titre}
              onChange={handleChange}
              required
              error={errors.titre}
            />

            <FormInput
              label="Description"
              name="description"
              value={expenseForm.description}
              onChange={handleChange}
              required
              error={errors.description}
              multiline
            />

            <SelectInput
              label="Type"
              name="type"
              value={expenseForm.type}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'EQUIPEMENT', label: 'Équipement' },
                { value: 'FORMATION', label: 'Formation' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
                { value: 'LOGISTIQUE', label: 'Logistique' },
                { value: 'AUTRE', label: 'Autre' }
              ]}
              required
              error={errors.type}
            />

            <FormInput
              label="Date"
              name="date"
              type="date"
              value={expenseForm.date}
              onChange={handleChange}
              required
              error={errors.date}
            />

            <FormInput
              label="Montant (MAD)"
              name="montant"
              type="number"
              value={expenseForm.montant}
              onChange={handleChange}
              required
              error={errors.montant}
              placeholder="0"
              min="0"
              step="100"
            />

            <FormInput
              label="Prestataire (optionnel)"
              name="prestataire"
              value={expenseForm.prestataire}
              onChange={handleChange}
              error={errors.prestataire}
              placeholder="Nom du prestataire"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Mise à Jour...
                  </span>
                ) : (
                  'Mettre à Jour'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedExpense(null);
          }}
          title="Confirmer la Suppression"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer la dépense "{selectedExpense?.titre}" ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedExpense(null);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
} 