import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminBudgetService, adminDashboardService, departmentService } from '../services';
import AdminSidebar from '../components/AdminSidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../components/NotificationSystem';

export default function AdminBudgets() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [mainBudget, setMainBudget] = useState(null);
  const [departmentBudgets, setDepartmentBudgets] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMainBudgetModal, setShowMainBudgetModal] = useState(false);
  const [showDepartmentBudgetModal, setShowDepartmentBudgetModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError, warning } = useNotifications();
  
  // Main budget form
  const [mainBudgetForm, setMainBudgetForm] = useState({
    annee: new Date().getFullYear(),
    montant: '',
    description: ''
  });

  // Department budget form
  const [departmentBudgetForm, setDepartmentBudgetForm] = useState({
    annee: new Date().getFullYear(),
    montant: '',
    departementId: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [departmentsData, mainBudgetData, departmentBudgetsData] = await Promise.all([
        departmentService.getAllDepartments(),
        adminBudgetService.getBudgetByYear(selectedYear).catch(() => null),
        adminDashboardService.getDepartmentsAnalytics(selectedYear)
      ]);
      
      setDepartments(departmentsData);
      setMainBudget(mainBudgetData);
      setDepartmentBudgets(departmentBudgetsData);
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

  const getDepartmentBudget = (departmentId) => {
    return departmentBudgets.find(d => d.departementId === departmentId) || null;
  };

  const getBudgetUsagePercentage = (used, total) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const handleMainBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!validateMainBudget()) return;

    try {
      setSubmitting(true);
      const budgetData = {
        annee: Number(mainBudgetForm.annee),
        montant: Number(mainBudgetForm.montant),
        description: mainBudgetForm.description
      };

      if (mainBudget) {
        // Update existing budget
        const updatedBudget = await adminBudgetService.updateBudget(mainBudget.id, {
          montant: Number(mainBudgetForm.montant),
          description: mainBudgetForm.description
        });
        setMainBudget(updatedBudget);
        success('Succès', 'Budget principal mis à jour avec succès');
      } else {
        // Create new budget
        const newBudget = await adminBudgetService.addBudget(budgetData);
        setMainBudget(newBudget);
        success('Succès', 'Budget principal créé avec succès');
      }
      
      setShowMainBudgetModal(false);
      setMainBudgetForm({ annee: new Date().getFullYear(), montant: '', description: '' });
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors de la création/modification du budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartmentBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!validateDepartmentBudget()) return;

    try {
      setSubmitting(true);
      
      const budgetData = {
        annee: Number(departmentBudgetForm.annee),
        montant: Number(departmentBudgetForm.montant),
        description: departmentBudgetForm.description
      };

      // Check if budget already exists for this department and year
      const existingBudget = departmentBudgets.find(bd => 
        bd.departementId === Number(departmentBudgetForm.departementId) && 
        bd.annee === Number(departmentBudgetForm.annee)
      );

      let newBudgetDept;
      if (existingBudget) {
        // Update existing budget
        newBudgetDept = await adminBudgetService.updateDepartmentBudget(
          Number(departmentBudgetForm.departementId), 
          {
            montant: Number(departmentBudgetForm.montant),
            description: departmentBudgetForm.description
          }
        );
        success('Succès', 'Budget département mis à jour avec succès');
      } else {
        // Create new budget
        newBudgetDept = await adminBudgetService.addDepartmentBudget(
          Number(departmentBudgetForm.departementId), 
          budgetData
        );
        success('Succès', 'Budget département créé avec succès');
      }
      
      // Refresh data
      await fetchData();
      setShowDepartmentBudgetModal(false);
      setDepartmentBudgetForm({ annee: new Date().getFullYear(), montant: '', departementId: '', description: '' });
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors de l\'attribution du budget');
    } finally {
      setSubmitting(false);
    }
  };

  const validateMainBudget = () => {
    const errs = {};
    if (!mainBudgetForm.annee || mainBudgetForm.annee < 2020) {
      errs.annee = 'Année invalide';
    }
    if (!mainBudgetForm.montant || Number(mainBudgetForm.montant) <= 0) {
      errs.montant = 'Montant invalide';
    }
    if (!mainBudgetForm.description || mainBudgetForm.description.trim().length < 10) {
      errs.description = 'Description obligatoire (min 10 caractères)';
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
      errs.departementId = 'Département obligatoire';
    }
    if (!departmentBudgetForm.description || departmentBudgetForm.description.trim().length < 10) {
      errs.description = 'Description obligatoire (min 10 caractères)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'main') {
      setMainBudgetForm(prev => ({ ...prev, [name]: value }));
    } else {
      setDepartmentBudgetForm(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const showDepartmentDetails = (department) => {
    setSelectedDepartment(department);
    setShowDetailsModal(true);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };

  const validateBudgets = async () => {
    try {
      const validation = await adminDashboardService.validateBudgets(selectedYear);
      if (validation.valid) {
        success('Validation', validation.message);
      } else {
        warning('Attention', validation.message);
      }
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors de la validation');
    }
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Gestion des Budgets</h1>
          <div className="flex gap-4">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={validateBudgets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Valider Budgets
            </button>
          </div>
        </div>

        {/* Main Budget Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Budget Principal {selectedYear}</h2>
            <button
              onClick={() => {
                setMainBudgetForm({ 
                  annee: selectedYear, 
                  montant: mainBudget?.montant?.toString() || '', 
                  description: mainBudget?.description || '' 
                });
                setShowMainBudgetModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mainBudget ? 'Modifier' : 'Créer'} Budget Principal
            </button>
          </div>

          {mainBudget ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Budget Total</p>
                <p className="text-2xl font-bold text-blue-800">{formatCurrency(mainBudget.montant)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-600">Budget Restant</p>
                <p className="text-2xl font-bold text-green-800">{formatCurrency(mainBudget.montant - departmentBudgets.reduce((sum, d) => sum + d.budgetTotal, 0))}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-orange-600">Budget Alloué</p>
                <p className="text-2xl font-bold text-orange-800">{formatCurrency(departmentBudgets.reduce((sum, d) => sum + d.budgetTotal, 0))}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun budget principal défini pour {selectedYear}
            </div>
          )}
        </div>

        {/* Department Budgets Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Budgets par Département</h2>
            <button
              onClick={() => {
                setDepartmentBudgetForm({ 
                  annee: selectedYear, 
                  montant: '', 
                  departementId: '', 
                  description: '' 
                });
                setShowDepartmentBudgetModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ajouter Budget Département
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map(department => {
              const budget = getDepartmentBudget(department.id);
              const usagePercentage = budget ? getBudgetUsagePercentage(budget.budgetUtilise, budget.budgetTotal) : 0;
              
              return (
                <div key={department.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{department.nom}</h3>
                    <button
                      onClick={() => showDepartmentDetails(department)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Détails
                    </button>
                  </div>
                  
                  {budget ? (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Budget Total:</span>
                          <span className="font-medium">{formatCurrency(budget.budgetTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Utilisé:</span>
                          <span className="font-medium">{formatCurrency(budget.budgetUtilise)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Restant:</span>
                          <span className="font-medium">{formatCurrency(budget.budgetRestant)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Utilisation</span>
                          <span className={`font-semibold ${getBudgetStatusColor(usagePercentage).split(' ')[0]}`}>
                            {usagePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              usagePercentage >= 90 ? 'bg-red-500' : 
                              usagePercentage >= 75 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucun budget défini
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setDepartmentBudgetForm({ 
                        annee: selectedYear, 
                        montant: budget?.budgetTotal?.toString() || '', 
                        departementId: department.id.toString(), 
                        description: budget?.description || '' 
                      });
                      setShowDepartmentBudgetModal(true);
                    }}
                    className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {budget ? 'Modifier' : 'Ajouter'} Budget
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Budget Modal */}
        <Modal open={showMainBudgetModal} onClose={() => setShowMainBudgetModal(false)} title="Budget Principal">
          <form onSubmit={handleMainBudgetSubmit} className="space-y-4">
            <FormInput
              label="Année"
              name="annee"
              type="number"
              value={mainBudgetForm.annee}
              onChange={(e) => handleChange(e, 'main')}
              error={errors.annee}
              required
            />
            <FormInput
              label="Montant (DH)"
              name="montant"
              type="number"
              value={mainBudgetForm.montant}
              onChange={(e) => handleChange(e, 'main')}
              error={errors.montant}
              required
            />
            <FormInput
              label="Description (obligatoire)"
              name="description"
              type="textarea"
              value={mainBudgetForm.description}
              onChange={(e) => handleChange(e, 'main')}
              error={errors.description}
              required
              placeholder="Raison de la création/modification du budget..."
            />
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : (mainBudget ? 'Modifier' : 'Créer')}
              </button>
              <button
                type="button"
                onClick={() => setShowMainBudgetModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Modal>

        {/* Department Budget Modal */}
        <Modal open={showDepartmentBudgetModal} onClose={() => setShowDepartmentBudgetModal(false)} title="Budget Département">
          <form onSubmit={handleDepartmentBudgetSubmit} className="space-y-4">
            <FormInput
              label="Année"
              name="annee"
              type="number"
              value={departmentBudgetForm.annee}
              onChange={(e) => handleChange(e, 'department')}
              error={errors.annee}
              required
            />
            <SelectInput
              label="Département"
              name="departementId"
              value={departmentBudgetForm.departementId}
              onChange={(e) => handleChange(e, 'department')}
              error={errors.departementId}
              required
              options={[
                { value: '', label: 'Sélectionner un département' },
                ...departments.map(dept => ({ 
                  value: dept.id, 
                  label: dept.nom 
                }))
              ]}
            />
            <FormInput
              label="Montant (DH)"
              name="montant"
              type="number"
              value={departmentBudgetForm.montant}
              onChange={(e) => handleChange(e, 'department')}
              error={errors.montant}
              required
            />
            <FormInput
              label="Description (obligatoire)"
              name="description"
              type="textarea"
              value={departmentBudgetForm.description}
              onChange={(e) => handleChange(e, 'department')}
              error={errors.description}
              required
              placeholder="Raison de l'attribution/modification du budget..."
            />
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setShowDepartmentBudgetModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Modal>

        {/* Department Details Modal */}
        <Modal open={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={`Détails - ${selectedDepartment?.nom}`}>
          {selectedDepartment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Informations Département</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nom</p>
                    <p className="font-semibold">{selectedDepartment.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Responsable</p>
                    <p className="font-semibold">{selectedDepartment.responsableNom || 'Non assigné'}</p>
                  </div>
                </div>
              </div>
              
              {getDepartmentBudget(selectedDepartment.id) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Budget {selectedYear}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Budget Total:</span>
                      <span className="font-semibold">{formatCurrency(getDepartmentBudget(selectedDepartment.id).budgetTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Utilisé:</span>
                      <span className="font-semibold">{formatCurrency(getDepartmentBudget(selectedDepartment.id).budgetUtilise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Restant:</span>
                      <span className="font-semibold">{formatCurrency(getDepartmentBudget(selectedDepartment.id).budgetRestant)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
} 