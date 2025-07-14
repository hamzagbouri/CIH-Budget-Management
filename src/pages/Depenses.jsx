import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseService, departmentService } from '../services';
import UserSidebar from '../components/UserSidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import LoadingSpinner from '../components/LoadingSpinner';

const expenseTypes = [
  { value: 'OPERATIONNEL', label: 'Opérationnel' },
  { value: 'INVESTISSEMENT', label: 'Investissement' },
  { value: 'FORMATION', label: 'Formation' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'AUTRE', label: 'Autre' }
];

export default function Depenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    type: '',
    date: '',
    montant: '',
    departementId: ''
  });
  const [errors, setErrors] = useState({});

  // Fetch expenses and departments on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesData, departmentsData] = await Promise.all([
          expenseService.getAllExpenses(),
          departmentService.getAllDepartments()
        ]);
        setExpenses(expensesData);
        setDepartments(departmentsData);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.titre?.trim()) errs.titre = 'Le titre est requis';
    if (!form.description?.trim()) errs.description = 'La description est requise';
    if (!form.type) errs.type = 'Le type est requis';
    if (!form.date) errs.date = 'La date est requise';
    if (!form.montant || isNaN(form.montant) || Number(form.montant) <= 0) {
      errs.montant = 'Le montant doit être un nombre positif';
    }
    if (!form.departementId) errs.departementId = 'Le département est requis';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setForm({
      titre: '',
      description: '',
      type: '',
      date: '',
      montant: '',
      departementId: user?.departementId?.toString() || ''
    });
    setErrors({});
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const expenseData = {
        ...form,
        montant: Number(form.montant),
        departementId: Number(form.departementId)
      };

      if (editId) {
        // Update existing expense
        const updatedExpense = await expenseService.updateExpense(editId, expenseData);
        setExpenses(prev => prev.map(exp => exp.id === editId ? updatedExpense : exp));
      } else {
        // Create new expense
        const newExpense = await expenseService.createExpense(expenseData);
        setExpenses(prev => [newExpense, ...prev]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setForm({
      titre: expense.titre,
      description: expense.description,
      type: expense.type,
      date: expense.date,
      montant: expense.montant.toString(),
      departementId: expense.departementId.toString()
    });
    setEditId(expense.id);
    setShowModal(true);
  };

  const handleDelete = async (expense) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }

    try {
      await expenseService.deleteExpense(expense.id);
      setExpenses(prev => prev.filter(exp => exp.id !== expense.id));
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

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

  const getExpenseTypeColor = (type) => {
    switch (type) {
      case 'OPERATIONNEL': return 'bg-blue-100 text-blue-800';
      case 'INVESTISSEMENT': return 'bg-purple-100 text-purple-800';
      case 'FORMATION': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpenseTypeIcon = (type) => {
    switch (type) {
      case 'OPERATIONNEL': return 'build';
      case 'INVESTISSEMENT': return 'trending_up';
      case 'FORMATION': return 'school';
      case 'MAINTENANCE': return 'handyman';
      default: return 'receipt';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <UserSidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement des dépenses..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <UserSidebar />
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Gestion des Dépenses
            </h1>
            <p className="text-gray-600">
              {expenses.length} dépense{expenses.length !== 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <span className="material-icons text-xl">add</span>
            <span className="hidden sm:inline">Nouvelle Dépense</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <span className="material-icons text-red-500 mr-3">error</span>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {expenses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getExpenseTypeColor(expense.type)}`}>
                        <span className="material-icons text-lg">
                          {getExpenseTypeIcon(expense.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {expense.titre}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {expense.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <span className="material-icons text-sm mr-1">calendar_today</span>
                            {formatDate(expense.date)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExpenseTypeColor(expense.type)}`}>
                            {expense.type}
                          </span>
                          <span className="flex items-center">
                            <span className="material-icons text-sm mr-1">apartment</span>
                            {departments.find(d => d.id === expense.departementId)?.nom || 'Département inconnu'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          {formatCurrency(expense.montant)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <span className="material-icons text-6xl text-gray-300 mb-4">receipt_long</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune dépense</h3>
              <p className="text-gray-500 mb-6">Commencez par ajouter votre première dépense</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="material-icons">add</span>
                Ajouter une dépense
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal 
          open={showModal} 
          onClose={() => {
            setShowModal(false);
            resetForm();
          }} 
          title={editId ? 'Modifier la dépense' : 'Nouvelle dépense'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Titre de la dépense"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              required
              error={errors.titre}
              placeholder="Ex: Achat fournitures de bureau"
            />
            
            <FormInput
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              error={errors.description}
              placeholder="Description détaillée de la dépense"
              multiline
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                label="Type de dépense"
                name="type"
                value={form.type}
                onChange={handleChange}
                options={expenseTypes}
                required
                error={errors.type}
              />

              <FormInput
                label="Montant (MAD)"
                name="montant"
                type="number"
                value={form.montant}
                onChange={handleChange}
                required
                error={errors.montant}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                error={errors.date}
              />

              <SelectInput
                label="Département"
                name="departementId"
                value={form.departementId}
                onChange={handleChange}
                options={departments.map(d => ({ value: d.id, label: d.nom }))}
                required
                error={errors.departementId}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
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
                    {editId ? 'Modification...' : 'Création...'}
                  </span>
                ) : (
                  editId ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
} 