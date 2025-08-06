import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import StatCard from '../components/StatCard';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../components/NotificationSystem';
import { adminDashboardService, departmentService } from '../services';

const columns = [
  { key: 'nom', label: 'Département', sortable: true },
  { 
    key: 'description', 
    label: 'Description', 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: 'budget', 
    label: 'Budget (DH)', 
    sortable: true,
    render: (value) => (value || 0).toLocaleString() + ' DH'
  },
  { 
    key: 'actif', 
    label: 'Statut', 
    sortable: true,
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value ? 'Actif' : 'Inactif'}
      </span>
    )
  },
  { 
    key: 'responsableNom', 
    label: 'Responsable', 
    sortable: true,
    render: (value) => value || 'Non assigné'
  },
  { 
    key: 'responsableEmail', 
    label: 'Email', 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: 'budgetTotal', 
    label: 'Budget Total (DH)', 
    sortable: true,
    render: (value) => (value || 0).toLocaleString() + ' DH'
  },
  { 
    key: 'budgetRestant', 
    label: 'Budget Restant (DH)', 
    sortable: true,
    render: (value) => {
      const amount = value || 0;
      return (
        <span className={amount < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
          {amount.toLocaleString()} DH
        </span>
      );
    }
  },
  { 
    key: 'pourcentageUtilisation', 
    label: '% Utilisation', 
    sortable: true,
    render: (value) => {
      const percentage = value || 0;
      return (
        <span className={`font-semibold ${
          percentage >= 90 ? 'text-red-600' : 
          percentage >= 75 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {percentage.toFixed(1)}%
        </span>
      );
    }
  },
];

export default function AdminDepartements() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    nom: '', 
    description: '', 
    budget: '', 
    actif: true 
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { success, error: showError } = useNotifications();

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const departementsData = await adminDashboardService.getDepartmentsWithResponsable(selectedYear);
      
      // Enrich data with default values to prevent undefined errors
      const enrichedData = departementsData.map(dept => ({
        ...dept,
        budgetTotal: dept.budgetTotal || 0,
        budgetRestant: dept.budgetRestant || 0,
        pourcentageUtilisation: dept.pourcentageUtilisation || 0,
        responsableNom: dept.responsableNom || 'Non assigné',
        responsableEmail: dept.responsableEmail || '',
        responsableMatricule: dept.responsableMatricule || '',
        description: dept.description || '',
        budget: dept.budget || 0,
        actif: dept.actif !== undefined ? dept.actif : true
      }));
      
      setDepartements(enrichedData);
    } catch (error) {
      showError('Erreur', error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleEdit = (row) => {
    setForm({
      nom: row.nom || '',
      description: row.description || '',
      budget: row.budget || '',
      actif: row.actif !== undefined ? row.actif : true
    });
    setEditId(row.id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le département "${row.nom}" ?`)) {
      try {
        await departmentService.deleteDepartment(row.id);
        success('Succès', 'Département supprimé avec succès');
        fetchData();
      } catch (error) {
        showError('Erreur', error.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleToggleStatus = async (row) => {
    const newStatus = !row.actif;
    const action = newStatus ? 'activer' : 'désactiver';
    
    if (window.confirm(`Êtes-vous sûr de vouloir ${action} le département "${row.nom}" ?`)) {
      try {
        await departmentService.toggleDepartmentStatus(row.id, newStatus);
        success('Succès', `Département ${action} avec succès`);
        fetchData();
      } catch (error) {
        showError('Erreur', error.message || `Erreur lors de la ${action}`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.nom || form.nom.trim().length < 2) {
      errs.nom = 'Nom du département requis (min 2 caractères)';
    }
    if (form.budget && (isNaN(form.budget) || parseFloat(form.budget) < 0)) {
      errs.budget = 'Le budget doit être un nombre positif';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const departmentData = {
        nom: form.nom.trim(),
        description: form.description.trim() || undefined,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        actif: form.actif
      };

      if (editId) {
        // Update existing department
        await departmentService.updateDepartment(editId, departmentData);
        success('Succès', 'Département mis à jour avec succès');
      } else {
        // Create new department
        await departmentService.createDepartment(departmentData);
        success('Succès', 'Département créé avec succès');
      }

      setShowModal(false);
      setForm({ nom: '', description: '', budget: '', actif: true });
      setEditId(null);
      setErrors({});
      fetchData();
    } catch (error) {
      showError('Erreur', error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ nom: '', description: '', budget: '', actif: true });
    setErrors({});
  };

  // Filter departments based on search
  const filteredDepartements = departements.filter(dep => 
    dep.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dep.description && dep.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dep.responsableNom && dep.responsableNom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dep.responsableEmail && dep.responsableEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const totalBudget = departements.reduce((sum, d) => sum + (d.budgetTotal || 0), 0);
  const totalRestant = departements.reduce((sum, d) => sum + (d.budgetRestant || 0), 0);
  const nbDepartements = departements.length;
  const nbDepartementsActifs = departements.filter(d => d.actif).length;
  const nbDepartementsAvecResponsable = departements.filter(d => d.responsableNom && d.responsableNom !== 'Non assigné').length;

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
          <div className="flex gap-4">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-sm">add</span>
              Nouveau Département
            </button>
          </div>
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
            label="Budget Restant" 
            value={totalRestant.toLocaleString() + ' DH'} 
            icon="savings" 
            color="bg-green-100" 
          />
          <StatCard 
            label="Départements Actifs" 
            value={nbDepartementsActifs.toString()} 
            icon="apartment" 
            color="bg-purple-100" 
          />
          <StatCard 
            label="Avec Responsable" 
            value={nbDepartementsAvecResponsable.toString()} 
            icon="supervisor_account" 
            color="bg-orange-100" 
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, description, responsable ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Departments Table */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <Table
            columns={columns}
            data={filteredDepartements}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort
            enablePagination
            searchable
            pageSize={10}
            customActions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(row)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    row.actif 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  title={row.actif ? 'Désactiver' : 'Activer'}
                >
                  <span className="material-icons text-sm">
                    {row.actif ? 'block' : 'check_circle'}
                  </span>
                </button>
              </div>
            )}
          />
        </div>

        {/* Department Modal */}
        <Modal open={showModal} onClose={handleCloseModal} title={editId ? 'Modifier Département' : 'Nouveau Département'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nom du Département *"
              name="nom"
              type="text"
              value={form.nom}
              onChange={handleChange}
              error={errors.nom}
              required
              placeholder="Ex: Département IT"
            />
            
            <FormInput
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Description du département (optionnel)"
              multiline={true}
            />
            
            <FormInput
              label="Budget (DH)"
              name="budget"
              type="number"
              value={form.budget}
              onChange={handleChange}
              error={errors.budget}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="actif"
                name="actif"
                checked={form.actif}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="actif" className="text-sm font-medium text-gray-700">
                Département actif
              </label>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editId ? 'Modifier' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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