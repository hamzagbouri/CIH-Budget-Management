import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { budgetService, departmentService, budgetDepartmentService, expenseService } from '../services';
import AdminSidebar from '../components/AdminSidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminBudgets() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetDepartments, setBudgetDepartments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalBankBudget, setTotalBankBudget] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showTotalBudgetModal, setShowTotalBudgetModal] = useState(false);
  const [showDepartmentBudgetModal, setShowDepartmentBudgetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Total budget form
  const [totalBudgetForm, setTotalBudgetForm] = useState({
    annee: new Date().getFullYear(),
    montant: ''
  });

  // Department budget form
  const [departmentBudgetForm, setDepartmentBudgetForm] = useState({
    annee: new Date().getFullYear(),
    montant: '',
    departementId: '',
    budgetId: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsData, budgetsData, budgetDepartmentsData, expensesData] = await Promise.all([
        departmentService.getAllDepartments(),
        budgetService.getAllBudgets(),
        budgetDepartmentService.getAllBudgetDepartments(),
        expenseService.getAllExpenses()
      ]);
      
      setDepartments(departmentsData);
      setBudgets(budgetsData);
      setBudgetDepartments(budgetDepartmentsData);
      setExpenses(expensesData);
      
      // Calculate total bank budget for selected year
      const yearBudgets = budgetsData.filter(b => b.annee === selectedYear);
      const total = yearBudgets.reduce((sum, budget) => sum + budget.montant, 0);
      setTotalBankBudget(total);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
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

  const getDepartmentBudget = (departmentId) => {
    const budgetDept = budgetDepartments.find(bd => 
      bd.departementId === departmentId && bd.annee === selectedYear
    );
    return budgetDept || null;
  };

  const getDepartmentBudgetUsage = (departmentId) => {
    const budget = getDepartmentBudget(departmentId);
    if (!budget) return { used: 0, remaining: 0, percentage: 0 };
    
    // Calculate actual expenses for this department in the selected year
    const departmentExpenses = expenses.filter(exp => 
      exp.departementId === departmentId && 
      new Date(exp.date).getFullYear() === selectedYear
    );
    
    const used = departmentExpenses.reduce((sum, exp) => sum + exp.montant, 0);
    const remaining = budget.montant - used;
    const percentage = budget.montant > 0 ? (used / budget.montant) * 100 : 0;
    
    return { used, remaining, percentage };
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const handleTotalBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!validateTotalBudget()) return;

    try {
      setSubmitting(true);
      const budgetData = {
        annee: Number(totalBudgetForm.annee),
        montant: Number(totalBudgetForm.montant)
      };

      const newBudget = await budgetService.createBudget(budgetData);
      setBudgets(prev => [...prev, newBudget]);
      
      // Update total if it's for the selected year
      if (newBudget.annee === selectedYear) {
        setTotalBankBudget(prev => prev + newBudget.montant);
      }
      
      setShowTotalBudgetModal(false);
      setTotalBudgetForm({ annee: new Date().getFullYear(), montant: '' });
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartmentBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!validateDepartmentBudget()) return;

    try {
      setSubmitting(true);
      
      // Find the budget for the selected year
      const yearBudget = budgets.find(b => b.annee === Number(departmentBudgetForm.annee));
      if (!yearBudget) {
        throw new Error('Aucun budget global trouvé pour cette année');
      }

      const budgetDeptData = {
        annee: Number(departmentBudgetForm.annee),
        montant: Number(departmentBudgetForm.montant),
        departementId: Number(departmentBudgetForm.departementId),
        budgetId: yearBudget.id
      };

      // Check if budget already exists for this department and year
      const existingBudget = budgetDepartments.find(bd => 
        bd.departementId === Number(departmentBudgetForm.departementId) && 
        bd.annee === Number(departmentBudgetForm.annee)
      );

      let newBudgetDept;
      if (existingBudget) {
        // Update existing budget
        newBudgetDept = await budgetDepartmentService.updateBudgetDepartment(existingBudget.id, budgetDeptData);
        setBudgetDepartments(prev => prev.map(bd => bd.id === existingBudget.id ? newBudgetDept : bd));
      } else {
        // Create new budget
        newBudgetDept = await budgetDepartmentService.createBudgetDepartment(budgetDeptData);
        setBudgetDepartments(prev => [...prev, newBudgetDept]);
      }
      
      setShowDepartmentBudgetModal(false);
      setDepartmentBudgetForm({ annee: new Date().getFullYear(), montant: '', departementId: '', budgetId: '' });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'attribution du budget');
    } finally {
      setSubmitting(false);
    }
  };

  const validateTotalBudget = () => {
    const errs = {};
    if (!totalBudgetForm.annee || totalBudgetForm.annee < 2020) {
      errs.annee = 'Année invalide';
    }
    if (!totalBudgetForm.montant || Number(totalBudgetForm.montant) <= 0) {
      errs.montant = 'Montant invalide';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateDepartmentBudget = () => {
    const errs = {};
    if (!departmentBudgetForm.annee || departmentBudgetForm.annee < 2020) {
      errs.annee = 'Année invalide';
    }
    if (!departmentBudgetForm.montant || Number(departmentBudgetForm.montant) <= 0) {
      errs.montant = 'Montant invalide';
    }
    if (!departmentBudgetForm.departementId) {
      errs.departementId = 'Département requis';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'total') {
      setTotalBudgetForm(prev => ({ ...prev, [name]: value }));
    } else {
      setDepartmentBudgetForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const showDepartmentDetails = (department) => {
    setSelectedDepartment(department);
    setShowDetailsModal(true);
  };

  const handleDeleteDepartmentBudget = async (departmentId) => {
    const budget = getDepartmentBudget(departmentId);
    if (!budget) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce budget département ?')) {
      return;
    }

    try {
      await budgetDepartmentService.deleteBudgetDepartment(budget.id);
      setBudgetDepartments(prev => prev.filter(bd => bd.id !== budget.id));
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const getAvailableYears = () => {
    const years = [...new Set([
      ...budgets.map(b => b.annee),
      ...budgetDepartments.map(bd => bd.annee),
      new Date().getFullYear()
    ])];
    
    return years.sort((a, b) => b - a);
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <AdminSidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement des budgets..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Gestion des Budgets
          </h1>
          <p className="text-gray-600">
            Administration des budgets de la banque CIH
          </p>
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

        {/* Year Selector */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Sélectionner l'année</h3>
            <SelectInput
              label=""
              name="selectedYear"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={getAvailableYears().map(year => ({ value: year, label: year.toString() }))}
            />
          </div>
        </div>

        {/* Total Bank Budget Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Budget Total de la Banque - {selectedYear}</h2>
              <p className="text-blue-100">Budget global disponible pour tous les départements</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatCurrency(totalBankBudget)}</p>
              <p className="text-blue-100 text-sm">Budget total {selectedYear}</p>
            </div>
          </div>
          <button
            onClick={() => setShowTotalBudgetModal(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            <span className="material-icons mr-2">add</span>
            Ajouter un Budget
          </button>
        </div>

        {/* Department Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {departments.map((department) => {
            const budget = getDepartmentBudget(department.id);
            const usage = getDepartmentBudgetUsage(department.id);
            
            return (
              <div key={department.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="material-icons text-blue-600">apartment</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{department.nom}</h3>
                      <p className="text-sm text-gray-500">Département</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => showDepartmentDetails(department)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <span className="material-icons">visibility</span>
                    </button>
                    {budget && (
                      <button
                        onClick={() => handleDeleteDepartmentBudget(department.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer le budget"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {budget ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Budget alloué</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(budget.montant)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            usage.percentage >= 90 ? 'bg-red-500' :
                            usage.percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(usage.used)}</p>
                        <p className="text-xs text-gray-500">Utilisé</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(usage.remaining)}</p>
                        <p className="text-xs text-gray-500">Restant</p>
                      </div>
                    </div>

                    <div className={`text-center p-2 rounded-lg ${getBudgetStatusColor(usage.percentage)}`}>
                      <span className="text-sm font-medium">
                        {usage.percentage.toFixed(1)}% utilisé
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <span className="material-icons text-gray-300 text-4xl mb-2">account_balance_wallet</span>
                    <p className="text-gray-500 text-sm mb-3">Aucun budget alloué</p>
                    <button
                      onClick={() => {
                        setDepartmentBudgetForm(prev => ({ 
                          ...prev, 
                          departementId: department.id.toString(),
                          annee: selectedYear
                        }));
                        setShowDepartmentBudgetModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Allouer un budget
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowTotalBudgetModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="material-icons">add_circle</span>
              Nouveau Budget Global
            </button>
            <button
              onClick={() => setShowDepartmentBudgetModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="material-icons">assignment</span>
              Attribuer Budget Département
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="material-icons">refresh</span>
              Actualiser
            </button>
          </div>
        </div>

        {/* Total Budget Modal */}
        <Modal
          open={showTotalBudgetModal}
          onClose={() => {
            setShowTotalBudgetModal(false);
            setTotalBudgetForm({ annee: new Date().getFullYear(), montant: '' });
            setErrors({});
          }}
          title="Nouveau Budget Global"
        >
          <form onSubmit={handleTotalBudgetSubmit} className="space-y-4">
            <FormInput
              label="Année"
              name="annee"
              type="number"
              value={totalBudgetForm.annee}
              onChange={(e) => handleChange(e, 'total')}
              required
              error={errors.annee}
              min="2020"
              max="2030"
            />
            
            <FormInput
              label="Montant Total (MAD)"
              name="montant"
              type="number"
              value={totalBudgetForm.montant}
              onChange={(e) => handleChange(e, 'total')}
              required
              error={errors.montant}
              placeholder="0"
              min="0"
              step="1000"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTotalBudgetModal(false);
                  setTotalBudgetForm({ annee: new Date().getFullYear(), montant: '' });
                  setErrors({});
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
                    Création...
                  </span>
                ) : (
                  'Créer le Budget'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Department Budget Modal */}
        <Modal
          open={showDepartmentBudgetModal}
          onClose={() => {
            setShowDepartmentBudgetModal(false);
            setDepartmentBudgetForm({ annee: new Date().getFullYear(), montant: '', departementId: '', budgetId: '' });
            setErrors({});
          }}
          title="Attribuer Budget au Département"
        >
          <form onSubmit={handleDepartmentBudgetSubmit} className="space-y-4">
            <SelectInput
              label="Département"
              name="departementId"
              value={departmentBudgetForm.departementId}
              onChange={(e) => handleChange(e, 'department')}
              options={departments.map(d => ({ value: d.id, label: d.nom }))}
              required
              error={errors.departementId}
            />
            
            <FormInput
              label="Année"
              name="annee"
              type="number"
              value={departmentBudgetForm.annee}
              onChange={(e) => handleChange(e, 'department')}
              required
              error={errors.annee}
              min="2020"
              max="2030"
            />

            <FormInput
              label="Montant (MAD)"
              name="montant"
              type="number"
              value={departmentBudgetForm.montant}
              onChange={(e) => handleChange(e, 'department')}
              required
              error={errors.montant}
              placeholder="0"
              min="0"
              step="1000"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDepartmentBudgetModal(false);
                  setDepartmentBudgetForm({ annee: new Date().getFullYear(), montant: '', departementId: '', budgetId: '' });
                  setErrors({});
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Attribution...
                  </span>
                ) : (
                  'Attribuer le Budget'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Department Details Modal */}
        <Modal
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDepartment(null);
          }}
          title={`Détails - ${selectedDepartment?.nom}`}
        >
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Informations du Département</h4>
                <p><strong>Nom:</strong> {selectedDepartment.nom}</p>
                <p><strong>ID:</strong> {selectedDepartment.id}</p>
              </div>

              {getDepartmentBudget(selectedDepartment.id) ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Budget Alloué - {selectedYear}</h4>
                  <p><strong>Montant:</strong> {formatCurrency(getDepartmentBudget(selectedDepartment.id).montant)}</p>
                  <p><strong>Année:</strong> {getDepartmentBudget(selectedDepartment.id).annee}</p>
                  
                  {(() => {
                    const usage = getDepartmentBudgetUsage(selectedDepartment.id);
                    return (
                      <div className="mt-3">
                        <p><strong>Utilisé:</strong> {formatCurrency(usage.used)}</p>
                        <p><strong>Restant:</strong> {formatCurrency(usage.remaining)}</p>
                        <p><strong>Pourcentage utilisé:</strong> {usage.percentage.toFixed(1)}%</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-yellow-800">Aucun budget alloué à ce département pour {selectedYear}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDepartmentBudgetForm(prev => ({ 
                      ...prev, 
                      departementId: selectedDepartment.id.toString(),
                      annee: selectedYear
                    }));
                    setShowDepartmentBudgetModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {getDepartmentBudget(selectedDepartment.id) ? 'Modifier le Budget' : 'Allouer un Budget'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
} 