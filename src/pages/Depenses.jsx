import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService, departmentService, budgetDepartmentService } from '../services';
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
  const [departments, setDepartments] = useState([]);
  const [budgetDepartments, setBudgetDepartments] = useState([]);
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
    departementId: '',
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
    departementId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, departmentsData, budgetDepartmentsData] = await Promise.all([
        expenseService.getAllExpenses(),
        departmentService.getAllDepartments(),
        budgetDepartmentService.getAllBudgetDepartments()
      ]);
      
      setExpenses(expensesData);
      setDepartments(departmentsData);
      setBudgetDepartments(budgetDepartmentsData);
      
      // Calculate budget info for user's department
      if (user?.departementId) {
        await fetchBudgetInfo(user.departementId);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetInfo = async (departmentId) => {
    try {
      const currentYear = new Date().getFullYear();
      const remaining = await expenseService.getRemainingBudget(departmentId, currentYear);
      setRemainingBudget(remaining);
      
      // Get department budget
      const deptBudget = budgetDepartments.find(bd => 
        bd.departementId === departmentId && bd.annee === currentYear
      );
      
      if (deptBudget) {
        const usedAmount = deptBudget.montant - remaining;
        setBudgetInfo({
          totalBudget: deptBudget.montant,
          usedAmount: usedAmount,
          remainingAmount: remaining,
          year: currentYear
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du budget:', err);
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
      'EQUIPEMENT': 'bg-blue-100 text-blue-800',
      'FORMATION': 'bg-green-100 text-green-800',
      'MAINTENANCE': 'bg-orange-100 text-orange-800',
      'LOGISTIQUE': 'bg-purple-100 text-purple-800',
      'AUTRE': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['AUTRE'];
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.nom : 'Inconnu';
  };

  const validateBudget = (amount) => {
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
    
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const amount = Number(expenseForm.montant);
    const budgetValidation = validateBudget(amount);
    
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
        departementId: Number(expenseForm.departementId)
      };

      if (selectedExpense) {
        // Update existing expense
        const updatedExpense = await expenseService.updateExpense(selectedExpense.id, expenseData);
        setExpenses(prev => prev.map(exp => exp.id === selectedExpense.id ? updatedExpense : exp));
        setShowEditModal(false);
        addAlert('success', 'Dépense mise à jour', 'La dépense a été modifiée avec succès');
      } else {
        // Create new expense
        const newExpense = await expenseService.createExpense(expenseData);
        setExpenses(prev => [newExpense, ...prev]);
        setShowAddModal(false);
        addAlert('success', 'Dépense créée', 'La nouvelle dépense a été ajoutée avec succès');
        
        // Update budget info
        if (user?.departementId) {
          await fetchBudgetInfo(user.departementId);
        }
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
      await expenseService.deleteExpense(selectedExpense.id);
      setExpenses(prev => prev.filter(exp => exp.id !== selectedExpense.id));
      setShowDeleteModal(false);
      setSelectedExpense(null);
      addAlert('success', 'Dépense supprimée', 'La dépense a été supprimée avec succès');
      
      // Update budget info
      if (user?.departementId) {
        await fetchBudgetInfo(user.departementId);
      }
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
    if (!expenseForm.departementId) {
      errs.departementId = 'Département requis';
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
      if (amount > remainingBudget) {
        setErrors(prev => ({ 
          ...prev, 
          montant: `Montant maximum autorisé : ${formatCurrency(remainingBudget)}` 
        }));
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
      departementId: ''
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
      departementId: expense.departementId.toString()
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
      departementId: user?.departementId?.toString() || '',
      date: new Date().toISOString().split('T')[0]
    }));
    setShowAddModal(true);
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (filters.type && expense.type !== filters.type) return false;
    if (filters.departementId && expense.departementId !== Number(filters.departementId)) return false;
    if (filters.dateFrom && expense.date < filters.dateFrom) return false;
    if (filters.dateTo && expense.date > filters.dateTo) return false;
    return true;
  });

  // Chart data
  const getChartData = () => {
    const typeData = {};
    const monthlyData = {};

    filteredExpenses.forEach(expense => {
      // Type distribution
      typeData[expense.type] = (typeData[expense.type] || 0) + expense.montant;

      // Monthly distribution
      const month = new Date(expense.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + expense.montant;
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
      }
    };
  };

  const chartData = getChartData();

  // Table columns
  const columns = [
    {
      key: 'titre',
      label: 'Titre',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (value) => (
        <span className="font-semibold text-gray-900">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'departementId',
      label: 'Département',
      render: (value) => getDepartmentName(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Modifier"
          >
            <span className="material-icons text-sm">edit</span>
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement des dépenses..." />
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
            Gestion des Dépenses
          </h1>
          <p className="text-gray-600">
            Suivi et gestion des dépenses du département
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
              title={`Budget ${budgetInfo.year} - ${getDepartmentName(user?.departementId)}`}
              size="lg"
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-icons text-blue-600">receipt</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.montant, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="material-icons text-green-600">list</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="material-icons text-orange-600">trending_up</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredExpenses.length > 0 
                    ? formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.montant, 0) / filteredExpenses.length)
                    : formatCurrency(0)
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="material-icons text-purple-600">calendar_today</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Ce Mois</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Type</h3>
            <div className="h-64">
              <Pie data={chartData.typeData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
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
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
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
              
              <SelectInput
                label="Département"
                name="departementId"
                value={filters.departementId}
                onChange={(e) => setFilters(prev => ({ ...prev, departementId: e.target.value }))}
                options={[
                  { value: '', label: 'Tous les départements' },
                  ...departments.map(d => ({ value: d.id, label: d.nom }))
                ]}
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
                onClick={() => setFilters({ type: '', departementId: '', dateFrom: '', dateTo: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={openAddModal}
                disabled={remainingBudget <= 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  remainingBudget <= 0 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={remainingBudget <= 0 ? 'Budget épuisé' : 'Ajouter une nouvelle dépense'}
              >
                <span className="material-icons">add</span>
                Nouvelle Dépense
              </button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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

            <SelectInput
              label="Département"
              name="departementId"
              value={expenseForm.departementId}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sélectionner un département' },
                ...departments.map(d => ({ value: d.id, label: d.nom }))
              ]}
              required
              error={errors.departementId}
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

            <SelectInput
              label="Département"
              name="departementId"
              value={expenseForm.departementId}
              onChange={handleChange}
              options={[
                { value: '', label: 'Sélectionner un département' },
                ...departments.map(d => ({ value: d.id, label: d.nom }))
              ]}
              required
              error={errors.departementId}
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