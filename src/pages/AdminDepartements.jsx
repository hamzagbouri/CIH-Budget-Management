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
    email: '', 
    matricule: '', 
    departementId: '', 
    annee: new Date().getFullYear() 
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
        responsableMatricule: dept.responsableMatricule || ''
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
    setEditId(row.id);
    setForm({
      nom: row.nom,
      email: row.responsableEmail || '',
      matricule: row.responsableMatricule || '',
      departementId: row.id,
      annee: selectedYear
    });
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      return;
    }

    try {
      await departmentService.deleteDepartment(row.id);
      success('Succès', 'Département supprimé avec succès');
      fetchData();
    } catch (error) {
      showError('Erreur', error.message || 'Erreur lors de la suppression');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.nom || form.nom.trim().length < 2) {
      errs.nom = 'Nom du département requis (min 2 caractères)';
    }
    if (!form.email || !form.email.includes('@')) {
      errs.email = 'Email valide requis';
    }
    if (!form.matricule || form.matricule.trim().length < 3) {
      errs.matricule = 'Matricule requis (min 3 caractères)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const departmentData = {
        nom: form.nom,
        email: form.email,
        matricule: form.matricule,
        departementId: form.departementId,
        annee: selectedYear
      };

      if (editId) {
        // Update existing department
        await departmentService.updateDepartment(editId, departmentData);
        success('Succès', 'Département mis à jour avec succès');
      } else {
        // Create new department with responsible
        await adminDashboardService.addDepartmentWithResponsable(departmentData);
        success('Succès', 'Département créé avec succès');
      }

      setShowModal(false);
      setForm({ nom: '', email: '', matricule: '', departementId: '', annee: selectedYear });
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
    setForm({ nom: '', email: '', matricule: '', departementId: '', annee: selectedYear });
    setErrors({});
  };

  // Filter departments based on search
  const filteredDepartements = departements.filter(dep => 
    dep.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dep.responsableNom && dep.responsableNom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dep.responsableEmail && dep.responsableEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const totalBudget = departements.reduce((sum, d) => sum + (d.budgetTotal || 0), 0);
  const totalRestant = departements.reduce((sum, d) => sum + (d.budgetRestant || 0), 0);
  const nbDepartements = departements.length;
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
            label="Départements" 
            value={nbDepartements.toString()} 
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
                placeholder="Rechercher par nom, responsable ou email..."
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
          />
        </div>

        {/* Department Modal */}
        <Modal open={showModal} onClose={handleCloseModal} title={editId ? 'Modifier Département' : 'Nouveau Département'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Nom du Département"
              name="nom"
              type="text"
              value={form.nom}
              onChange={handleChange}
              error={errors.nom}
              required
            />
            <FormInput
              label="Email du Responsable"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <FormInput
              label="Matricule du Responsable"
              name="matricule"
              type="text"
              value={form.matricule}
              onChange={handleChange}
              error={errors.matricule}
              required
            />
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