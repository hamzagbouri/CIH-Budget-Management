import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import StatCard from '../components/StatCard';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { responsableService } from '../services/responsableService';
import { departmentService } from '../services/departmentService';

const columns = [
  { key: 'utilisateurNom', label: 'Nom', sortable: true },
  { key: 'utilisateurEmail', label: 'Email', sortable: true },
  { key: 'utilisateurMatricule', label: 'Matricule', sortable: true },
  { key: 'departementNom', label: 'Département', sortable: true },
  { key: 'annee', label: 'Année', sortable: true },
  { 
    key: 'dateCreation', 
    label: 'Date de Création', 
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString('fr-FR')
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
];

export default function AdminResponsables() {
  const [responsables, setResponsables] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
  const [filterYear, setFilterYear] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [selectedResponsable, setSelectedResponsable] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [responsablesData, departementsData] = await Promise.all([
        responsableService.getAllResponsables(),
        departmentService.getAllDepartments()
      ]);
      
      setResponsables(responsablesData);
      setDepartements(departementsData);
    } catch (error) {
      showAlert('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Filter responsables based on search and filters
  const filteredResponsables = responsables.filter(resp => {
    const matchesSearch = 
      resp.utilisateurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.utilisateurEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.utilisateurMatricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = !filterYear || resp.annee === parseInt(filterYear);
    const matchesDepartment = !filterDepartment || resp.departementId === parseInt(filterDepartment);
    const matchesStatus = filterStatus === '' || resp.actif === (filterStatus === 'true');
    
    return matchesSearch && matchesYear && matchesDepartment && matchesStatus;
  });

  const handleEdit = (row) => {
    setForm({
      annee: row.annee,
      utilisateurId: row.utilisateurId,
      departementId: row.departementId,
      actif: row.actif
    });
    setEditId(row.id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le responsable "${row.utilisateurNom}" ?`)) {
      try {
        await responsableService.deleteResponsable(row.id);
        showAlert('Responsable supprimé avec succès');
        fetchData();
      } catch (error) {
        showAlert(error.message || 'Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleDeactivate = async (row) => {
    if (window.confirm(`Êtes-vous sûr de vouloir désactiver le responsable "${row.utilisateurNom}" ?`)) {
      try {
        await responsableService.deactivateResponsable(row.id);
        showAlert('Responsable désactivé avec succès');
        fetchData();
      } catch (error) {
        showAlert(error.message || 'Erreur lors de la désactivation', 'error');
      }
    }
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
    if (!form.nom?.trim()) errs.nom = 'Le nom est requis';
    if (!form.email?.trim()) errs.email = 'L\'email est requis';
    if (form.email && !form.email.includes('@')) errs.email = 'Email invalide';
    if (!form.matricule?.trim()) errs.matricule = 'Le matricule est requis';
    if (!form.departementId) errs.departementId = 'Le département est requis';
    if (!form.annee || form.annee < 2020 || form.annee > 2030) errs.annee = 'L\'année doit être entre 2020 et 2030';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      if (editId) {
        await responsableService.updateResponsable(editId, form);
        showAlert('Responsable modifié avec succès');
      } else {
        const result = await responsableService.createResponsable(form);
        showAlert('Responsable créé avec succès');
        
        // Show password modal if password was generated
        if (result.generatedPassword) {
          setGeneratedPassword(result.generatedPassword);
          setSelectedResponsable(result);
          setShowPasswordModal(true);
        }
      }
      setShowModal(false);
      setForm({ nom: '', email: '', matricule: '', departementId: '', annee: new Date().getFullYear() });
      setEditId(null);
      setErrors({});
      fetchData();
    } catch (error) {
      showAlert(error.message || 'Erreur lors de l\'opération', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ nom: '', email: '', matricule: '', departementId: '', annee: new Date().getFullYear() });
    setErrors({});
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPassword('');
    setSelectedResponsable(null);
  };

  // Calculate stats
  const totalResponsables = responsables.length;
  const activeResponsables = responsables.filter(r => r.actif).length;
  const inactiveResponsables = responsables.filter(r => !r.actif).length;
  const currentYearResponsables = responsables.filter(r => r.annee === new Date().getFullYear()).length;

  // Generate year options
  const yearOptions = Array.from({ length: 11 }, (_, i) => 2020 + i);

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
          <h1 className="text-xl md:text-2xl font-bold">Gestion des Responsables</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span className="material-icons text-sm">add</span>
            Nouveau Responsable
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Total Responsables" 
            value={totalResponsables} 
            icon="people" 
            color="bg-blue-100" 
          />
          <StatCard 
            label="Responsables Actifs" 
            value={activeResponsables} 
            icon="check_circle" 
            color="bg-green-100" 
          />
          <StatCard 
            label="Responsables Inactifs" 
            value={inactiveResponsables} 
            icon="cancel" 
            color="bg-red-100" 
          />
          <StatCard 
            label={`Responsables ${new Date().getFullYear()}`} 
            value={currentYearResponsables} 
            icon="calendar_today" 
            color="bg-purple-100" 
          />
        </div>

        {/* Responsables Table */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les années</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les départements</option>
                {departements.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </select>
            </div>
          </div>
          
          {/* Results Summary */}
          {(searchTerm || filterYear || filterDepartment || filterStatus) && (
            <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {filteredResponsables.length} responsable(s) trouvé(s) sur {responsables.length}
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterYear('');
                  setFilterDepartment('');
                  setFilterStatus('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Effacer les filtres
              </button>
            </div>
          )}
          
          <Table
            columns={columns}
            data={filteredResponsables}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort
            enablePagination
            searchable
            pageSize={10}
            customActions={(row) => (
              <div className="flex gap-2">
                {row.actif && (
                  <button
                    onClick={() => handleDeactivate(row)}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                    title="Désactiver"
                  >
                    <span className="material-icons text-sm">block</span>
                  </button>
                )}
              </div>
            )}
          />
        </div>

        {/* Create/Edit Responsable Modal */}
        <Modal 
          open={showModal} 
          onClose={handleCloseModal} 
          title={editId ? 'Modifier le responsable' : 'Créer un nouveau responsable'}
        >
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {!editId && (
              <>
                <FormInput 
                  label="Nom complet" 
                  name="nom" 
                  value={form.nom} 
                  onChange={handleChange} 
                  required 
                  error={errors.nom}
                  placeholder="Ex: John Doe"
                />
                <FormInput 
                  label="Email" 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  error={errors.email}
                  placeholder="Ex: john.doe@example.com"
                />
                <FormInput 
                  label="Matricule" 
                  name="matricule" 
                  value={form.matricule} 
                  onChange={handleChange} 
                  required 
                  error={errors.matricule}
                  placeholder="Ex: EMP001"
                />
              </>
            )}
            
            <SelectInput 
              label="Département" 
              name="departementId" 
              value={form.departementId} 
              onChange={handleChange} 
              options={[
                { label: 'Sélectionner un département...', value: '' },
                ...departements.map(dept => ({ 
                  label: dept.nom, 
                  value: dept.id.toString() 
                }))
              ]} 
              required
              error={errors.departementId}
            />
            
            <FormInput 
              label="Année" 
              name="annee" 
              type="number"
              min="2020"
              max="2030"
              value={form.annee} 
              onChange={handleChange} 
              required 
              error={errors.annee}
            />
            
            {editId && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actif"
                  name="actif"
                  checked={form.actif}
                  onChange={(e) => setForm(f => ({ ...f, actif: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="actif" className="text-sm">Responsable actif</label>
              </div>
            )}
            
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

        {/* Password Generated Modal */}
        <Modal 
          open={showPasswordModal} 
          onClose={handleClosePasswordModal} 
          title="Responsable créé avec succès"
        >
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                Le responsable <strong>{selectedResponsable?.nom}</strong> a été créé avec succès.
              </p>
              <p className="text-sm text-green-700">
                Un email avec les identifiants de connexion a été envoyé à <strong>{selectedResponsable?.email}</strong>
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 mb-2">Mot de passe généré :</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white font-mono text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPassword)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  title="Copier le mot de passe"
                >
                  <span className="material-icons text-sm">content_copy</span>
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                ⚠️ Notez ce mot de passe car il ne sera plus affiché après fermeture de cette fenêtre.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleClosePasswordModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
} 