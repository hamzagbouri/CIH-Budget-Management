import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import StatCard from '../components/StatCard';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { departmentService } from '../services/departmentService';
import { userService } from '../services/userService';
import { budgetDepartmentService } from '../services/budgetDepartmentService';
import { budgetService } from '../services/budgetService';
import { expenseService } from '../services/expenseService';

const columns = [
  { key: 'nom', label: 'Département', sortable: true },
  { key: 'responsableName', label: 'Responsable', sortable: true },
  { 
    key: 'budgetAnnuel', 
    label: 'Budget Annuel (DH)', 
    sortable: true,
    render: (value) => value.toLocaleString() + ' DH'
  },
  { 
    key: 'depensesTotales', 
    label: 'Dépenses (DH)', 
    sortable: true,
    render: (value) => value.toLocaleString() + ' DH'
  },
  { 
    key: 'resteBudget', 
    label: 'Reste (DH)', 
    sortable: true,
    render: (value) => (
      <span className={value < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
        {value.toLocaleString()} DH
      </span>
    )
  },
  { key: 'nbUtilisateurs', label: 'Utilisateurs', sortable: true },
];

export default function AdminDepartements() {
  const [departements, setDepartements] = useState([]);
  const [users, setUsers] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [actualBudgets, setActualBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [form, setForm] = useState({ nom: '' });
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManager, setFilterManager] = useState('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [departementsData, usersData, budgetDepartmentsData, budgetsData, expensesData] = await Promise.all([
        departmentService.getAllDepartments(),
        userService.getAllUsers(),
        budgetDepartmentService.getAllBudgetDepartments(),
        budgetService.getAllBudgets(),
        expenseService.getAllExpenses()
      ]);
      
      setDepartements(departementsData);
      setUsers(usersData);
      setBudgets(budgetDepartmentsData);
      setExpenses(expensesData);
      
      // Store actual budgets for amount calculations
      setActualBudgets(budgetsData);
    } catch (error) {
      showAlert('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enrich departments with additional data
  const enrichDepartements = (deps) => {
    const currentYear = new Date().getFullYear();
    
    return deps.map(dep => {
      // Get department budget for current year
      const budgetDeptInfo = budgets.find(b => b.departementId === dep.id);
      let budgetAnnuel = 0;
      
      if (budgetDeptInfo) {
        // Find the actual budget amount for this budget ID
        const actualBudget = actualBudgets.find(b => b.id === budgetDeptInfo.budgetId);
        budgetAnnuel = actualBudget ? actualBudget.montant : 0;
      }
      
      // Calculate total expenses for this department
      const depensesTotales = expenses
        .filter(e => e.departementId === dep.id)
        .reduce((sum, e) => sum + Number(e.montant), 0);
      
      // Calculate remaining budget
      const resteBudget = budgetAnnuel - depensesTotales;
      
      // Get department manager
      const responsable = users.find(u => u.departementId === dep.id && u.role === 'responsable');
      const responsableName = responsable ? responsable.nom : 'Non assigné';
      
      // Count users in department
      const nbUtilisateurs = users.filter(u => u.departementId === dep.id).length;
      
      return {
        ...dep,
        budgetAnnuel,
        depensesTotales,
        resteBudget,
        responsableName,
        nbUtilisateurs,
        responsableId: responsable?.id || null
      };
    });
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleEdit = (row) => {
    setForm({ nom: row.nom });
    setEditId(row.id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le département "${row.nom}" ?`)) {
      try {
        await departmentService.deleteDepartment(row.id);
        showAlert('Département supprimé avec succès');
        fetchData();
      } catch (error) {
        showAlert(error.message || 'Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleAssignManager = (row) => {
    setSelectedDepartment(row);
    setSelectedManager(row.responsableId || '');
    setShowManagerModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors(e => ({ ...e, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = 'Le nom du département est requis';
    if (form.nom.trim().length < 2) errs.nom = 'Le nom doit contenir au moins 2 caractères';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      if (editId) {
        await departmentService.updateDepartment(editId, form);
        showAlert('Département modifié avec succès');
      } else {
        await departmentService.createDepartment(form);
        showAlert('Département créé avec succès');
      }
      setShowModal(false);
      setForm({ nom: '' });
      setEditId(null);
      setErrors({});
      fetchData();
    } catch (error) {
      showAlert(error.message || 'Erreur lors de l\'opération', 'error');
    }
  };

  const handleAssignManagerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedManager) {
      showAlert('Veuillez sélectionner un responsable', 'error');
      return;
    }

    try {
      // Update the selected user to be the department manager
      const userToUpdate = users.find(u => u.id === parseInt(selectedManager));
      if (userToUpdate) {
        await userService.updateUser(userToUpdate.id, {
          ...userToUpdate,
          departementId: selectedDepartment.id,
          role: 'responsable'
        });
        showAlert('Responsable assigné avec succès');
        setShowManagerModal(false);
        setSelectedDepartment(null);
        setSelectedManager('');
        fetchData();
      }
    } catch (error) {
      showAlert(error.message || 'Erreur lors de l\'assignation', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ nom: '' });
    setErrors({});
  };

  const handleCloseManagerModal = () => {
    setShowManagerModal(false);
    setSelectedDepartment(null);
    setSelectedManager('');
  };

  // Calculate stats
  const enrichedDepartements = enrichDepartements(departements);
  
  // Filter departments based on search and manager filter
  const filteredDepartements = enrichedDepartements.filter(dep => {
    const matchesSearch = dep.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesManager = !filterManager || dep.responsableId === parseInt(filterManager);
    return matchesSearch && matchesManager;
  });
  
  const totalBudget = enrichedDepartements.reduce((sum, d) => sum + d.budgetAnnuel, 0);
  const totalDepenses = enrichedDepartements.reduce((sum, d) => sum + d.depensesTotales, 0);
  const totalReste = enrichedDepartements.reduce((sum, d) => sum + d.resteBudget, 0);
  const nbDepartements = departements.length;
  const nbDepartementsAvecResponsable = enrichedDepartements.filter(d => d.responsableId).length;

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
        {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Gestion des Départements</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span className="material-icons text-sm">add</span>
            Nouveau Département
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Total Budgets" 
            value={totalBudget.toLocaleString() + ' DH'} 
            icon="account_balance" 
            color="bg-blue-100" 
          />
          <StatCard 
            label="Total Dépenses" 
            value={totalDepenses.toLocaleString() + ' DH'} 
            icon="bar_chart" 
            color="bg-orange-100" 
          />
          <StatCard 
            label="Reste Total" 
            value={totalReste.toLocaleString() + ' DH'} 
            icon="savings" 
            color={totalReste >= 0 ? "bg-green-100" : "bg-red-100"} 
          />
          <StatCard 
            label="Départements" 
            value={`${nbDepartementsAvecResponsable}/${nbDepartements}`} 
            icon="business" 
            color="bg-purple-100" 
          />
        </div>

        {/* Departments Table */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un département..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64">
              <select
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les responsables</option>
                {users
                  .filter(u => u.role === 'responsable')
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nom}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          
          {/* Results Summary */}
          {(searchTerm || filterManager) && (
            <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {filteredDepartements.length} département(s) trouvé(s) sur {enrichedDepartements.length}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterManager('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Effacer les filtres
              </button>
            </div>
          )}

          <Table
            columns={columns}
            data={filteredDepartements}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort
            enablePagination
            customActions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAssignManager(row)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  title="Assigner un responsable"
                >
                  <span className="material-icons text-sm">person_add</span>
                </button>
              </div>
            )}
          />
        </div>

        {/* Create/Edit Department Modal */}
        <Modal 
          open={showModal} 
          onClose={handleCloseModal} 
          title={editId ? 'Modifier le département' : 'Créer un nouveau département'}
        >
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <FormInput 
              label="Nom du département" 
              name="nom" 
              value={form.nom} 
              onChange={handleChange} 
              required 
              error={errors.nom}
              placeholder="Ex: Ressources Humaines"
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                type="submit" 
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                {editId ? 'Modifier' : 'Créer'}
              </button>
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="flex-1 py-2 px-4 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Modal>

        {/* Assign Manager Modal */}
        <Modal 
          open={showManagerModal} 
          onClose={handleCloseManagerModal} 
          title={`Assigner un responsable - ${selectedDepartment?.nom}`}
        >
          <form className="flex flex-col gap-4" onSubmit={handleAssignManagerSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Sélectionnez un utilisateur pour le nommer responsable du département <strong>{selectedDepartment?.nom}</strong>
              </p>
            </div>
            
            <SelectInput 
              label="Responsable" 
              name="responsable" 
              value={selectedManager} 
              onChange={(e) => setSelectedManager(e.target.value)} 
              options={[
                { label: 'Sélectionner un responsable...', value: '' },
                ...users
                  .filter(u => u.role !== 'admin') // Exclude admins
                  .map(u => ({ 
                    label: `${u.nom} (${u.email})`, 
                    value: u.id.toString() 
                  }))
              ]} 
              required
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                type="submit" 
                className="flex-1 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                Assigner
              </button>
              <button 
                type="button" 
                onClick={handleCloseManagerModal}
                className="flex-1 py-2 px-4 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
} 