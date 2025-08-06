import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import StatCard from '../components/StatCard';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import ReassignmentModal from '../components/ReassignmentModal';
import SwitchResponsablesModal from '../components/SwitchResponsablesModal';
import ValidationAlert from '../components/ValidationAlert';
import { responsableService } from '../services/responsableService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../components/NotificationSystem';



export default function AdminResponsables() {
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  
  const [responsables, setResponsables] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [selectedResponsable, setSelectedResponsable] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
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
  const [validating, setValidating] = useState(false);

  // Fetch data with pagination
  const fetchData = async (pageNum = 0, size = pageSize) => {
    try {
      setLoading(true);
      console.log('Fetching data...');
      
      const [responsablesData, departementsData] = await Promise.all([
        responsableService.getActiveResponsablesPaginated(pageNum, size),
        departmentService.getAllDepartments()
      ]);
      
      console.log('Responsables data:', responsablesData);
      console.log('Departments data:', departementsData);
      
      setResponsables(responsablesData.content || responsablesData);
      setDepartements(departementsData);
      
      // Handle pagination data
      if (responsablesData.totalPages !== undefined) {
        setTotalPages(responsablesData.totalPages);
        setTotalElements(responsablesData.totalElements);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Erreur', error.message || 'Erreur lors du chargement des données');
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
    console.log('Editing responsable:', row);
    // Store the responsable ID for updates
    setEditId(row.id);
    setForm({
      nom: row.utilisateurNom,
      email: row.utilisateurEmail,
      matricule: row.utilisateurMatricule,
      annee: row.annee
    });
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce responsable ?')) {
      try {
        await responsableService.deleteResponsable(row.id);
        showAlert('Responsable supprimé avec succès');
        fetchData(page, pageSize);
      } catch (error) {
        if (error.message.includes('Impossible de modifier les données historiques')) {
          showError('Erreur', 'Impossible de supprimer les données historiques');
        } else {
          showError('Erreur', error.message || 'Erreur lors de la suppression');
        }
      }
    }
  };

  const handleDeactivate = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver ce responsable ?')) {
      try {
        await responsableService.deactivateResponsable(row.id);
        showAlert('Responsable désactivé avec succès');
        fetchData(page, pageSize);
      } catch (error) {
        if (error.message.includes('Impossible de modifier les données historiques')) {
          showError('Erreur', 'Impossible de désactiver les données historiques');
        } else {
          showError('Erreur', error.message || 'Erreur lors de la désactivation');
        }
      }
    }
  };

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
    if (!form.nom?.trim()) errs.nom = 'Le nom est requis';
    if (!form.email?.trim()) errs.email = 'L\'email est requis';
    if (form.email && !form.email.includes('@')) errs.email = 'Email invalide';
    if (!form.matricule?.trim()) errs.matricule = 'Le matricule est requis';
    if (!form.annee || form.annee < 2020 || form.annee > 2030) errs.annee = 'L\'année doit être entre 2020 et 2030';
    
    console.log('Validation errors:', errs);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateUserAssignment = async (userId, annee) => {
    try {
      setValidating(true);
      console.log('Validating user:', userId, 'for year:', annee);
      const canBeResponsible = await responsableService.validateUserCanBeResponsible(userId, annee);
      console.log('Validation result:', canBeResponsible);
      return canBeResponsible;
    } catch (error) {
      console.error('Validation error:', error);
      showError('Erreur de validation', error.message);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form:', form);
    console.log('Edit ID:', editId);
    
    if (!validate()) {
      console.log('Validation failed');
      return;
    }
    
    try {
      if (editId) {
        console.log('Updating responsable:', editId);
        
        // Get the original responsable data to compare
        const originalResponsable = responsables.find(r => r.id === editId);
        console.log('Original responsable:', originalResponsable);
        
                 try {
           // Update responsable data (status, reason) - department is handled separately
           const responsableUpdateData = {
             annee: form.annee,
             actif: true,
             raisonModification: 'Modification via interface admin'
           };
          
          console.log('Responsable update data:', responsableUpdateData);
          await responsableService.updateResponsable(editId, responsableUpdateData);
          
          // Update user data if personal info changed
          if (originalResponsable) {
            const userDataChanged = 
              form.nom !== originalResponsable.utilisateurNom ||
              form.email !== originalResponsable.utilisateurEmail ||
              form.matricule !== originalResponsable.utilisateurMatricule;
            
            if (userDataChanged) {
              const userUpdateData = {
                nom: form.nom,
                email: form.email,
                matricule: form.matricule
              };
              
              console.log('User update data:', userUpdateData);
              await responsableService.updateUser(originalResponsable.utilisateurId, userUpdateData);
            }
          }
          
          success('Succès', 'Responsable modifié avec succès');
        } catch (error) {
          console.error('Error updating:', error);
          throw error;
        }
      } else {
        console.log('Creating new responsable');
        const result = await responsableService.createResponsable(form);
        console.log('Create result:', result);
        success('Succès', 'Responsable créé avec succès');
        
        // Show password modal if password was generated
        if (result.generatedPassword) {
          setGeneratedPassword(result.generatedPassword);
          setSelectedResponsable(result);
          setShowPasswordModal(true);
        }
      }
             setShowModal(false);
       setForm({ nom: '', email: '', matricule: '', annee: new Date().getFullYear() });
       setEditId(null);
      setErrors({});
      fetchData(page, pageSize);
    } catch (error) {
      console.error('Submit error:', error);
      if (error.message.includes('L\'utilisateur est déjà responsable')) {
        showError('Erreur', 'Cet utilisateur est déjà responsable d\'un département');
      } else if (error.message.includes('Ce département a déjà un responsable')) {
        showError('Erreur', 'Ce département a déjà un responsable pour cette année');
      } else {
        showError('Erreur', error.message || 'Erreur lors de l\'opération');
      }
    }
  };

  const handleDepartmentChange = async (responsableId, newDepartmentId) => {
    console.log('=== DEBUG: handleDepartmentChange called ===');
    console.log('responsableId:', responsableId);
    console.log('newDepartmentId:', newDepartmentId);
    console.log('Type of responsableId:', typeof responsableId);
    console.log('Type of newDepartmentId:', typeof newDepartmentId);
    
    if (!newDepartmentId) {
      console.log('No newDepartmentId provided, returning early');
      return;
    }
    
    try {
      console.log('=== DEBUG: Finding responsable in current data ===');
      console.log('Current responsables:', responsables);
      
      // Get the current responsable data
      const responsable = responsables.find(r => r.id === responsableId);
      console.log('Found responsable:', responsable);
      
      if (!responsable) {
        console.log('ERROR: Responsable not found');
        showError('Erreur', 'Responsable non trouvé');
        return;
      }
      
      console.log('=== DEBUG: Preparing update data ===');
      // Update responsable with new department
      const updateData = {
        departementId: parseInt(newDepartmentId),
        annee: responsable.annee,
        actif: true,
        raisonModification: 'Changement de département via interface'
      };
      
      console.log('Update data to send:', updateData);
      console.log('Responsable ID to update:', responsableId);
      console.log('API endpoint: PUT /api/responsables/' + responsableId);
      
      console.log('=== DEBUG: Calling API ===');
      const result = await responsableService.updateResponsable(responsableId, updateData);
      console.log('API response:', result);
      
      success('Succès', 'Département modifié avec succès');
      
      console.log('=== DEBUG: Refreshing data ===');
      // Refresh data
      fetchData(page, pageSize);
    } catch (error) {
      console.error('=== DEBUG: Error in handleDepartmentChange ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      
      if (error.message.includes('Ce département a déjà un responsable')) {
        showError('Erreur', 'Ce département a déjà un responsable pour cette année');
      } else {
        showError('Erreur', error.message || 'Erreur lors du changement de département');
      }
    }
  };

  const handleReassignmentSuccess = () => {
    fetchData(page, pageSize);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ nom: '', email: '', matricule: '', annee: new Date().getFullYear() });
    setErrors({});
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setGeneratedPassword('');
    setSelectedResponsable(null);
  };

  const handlePageChange = (newPage) => {
    fetchData(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    fetchData(0, newSize);
  };

  // Calculate stats
  const totalResponsables = totalElements || responsables.length;
  const activeResponsables = responsables.filter(r => r.actif).length;
  const inactiveResponsables = responsables.filter(r => !r.actif).length;
  const currentYearResponsables = responsables.filter(r => r.annee === new Date().getFullYear()).length;

  // Generate year options
  const yearOptions = Array.from({ length: 11 }, (_, i) => 2020 + i);

  // Define columns inside component to access state
  const columns = [
    { key: 'utilisateurNom', label: 'Nom', sortable: true },
    { key: 'utilisateurEmail', label: 'Email', sortable: true },
    { key: 'utilisateurMatricule', label: 'Matricule', sortable: true },
    { 
      key: 'departementNom', 
      label: 'Département', 
      sortable: true,
             render: (value, row) => (
         <select
           value={row.departementId || ''}
           onChange={(e) => {
             console.log('=== DEBUG: Select onChange triggered ===');
             console.log('Row data:', row);
             console.log('Row ID:', row.id);
             console.log('Selected value:', e.target.value);
             console.log('Event target:', e.target);
             handleDepartmentChange(row.id, e.target.value);
           }}
           className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
           disabled={!row.actif}
         >
          <option value="">Sélectionner...</option>
          {departements.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.nom}
            </option>
          ))}
        </select>
      )
    },
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowSwitchModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-sm">swap_horiz</span>
              Switch Responsables
            </button>
            <button
              onClick={() => {
                console.log('Opening modal, showModal:', showModal);
                setShowModal(true);
                console.log('Modal should be open now');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span className="material-icons text-sm">add</span>
              Nouveau Responsable
            </button>
          </div>
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
            label="Responsables 2024" 
            value={currentYearResponsables} 
            icon="calendar_today" 
            color="bg-purple-100" 
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <input
                type="text"
                placeholder="Nom, email ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les années</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les départements</option>
                {departements.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <Table
            columns={columns}
            data={filteredResponsables}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort
            enablePagination
            searchable
            pageSize={pageSize}
                         customActions={(row) => (
               <div className="flex gap-2">
                 <button
                   onClick={() => {
                     setSelectedResponsable(row);
                     setShowReassignmentModal(true);
                   }}
                   className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                   title="Réassigner"
                 >
                   <span className="material-icons text-sm">swap_horiz</span>
                 </button>
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

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Page {page + 1} sur {totalPages} • {totalElements} responsable(s) au total
          </div>
        )}

        {/* Debug Modal State */}
        {console.log('Modal state - showModal:', showModal, 'editId:', editId)}
        
        {/* Modals */}
                 <Modal
           open={showModal}
           onClose={handleCloseModal}
           title={editId ? `Modifier le Responsable - ${form.nom}` : 'Nouveau Responsable'}
         >
                     <form onSubmit={handleSubmit} className="space-y-4">
                           {editId && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Vous pouvez modifier l'année et les informations personnelles (nom, email, matricule) du responsable. Le département peut être modifié directement dans le tableau.
                  </p>
                </div>
              )}
             <FormInput
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              error={errors.nom}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
                         <FormInput
               label="Matricule"
               name="matricule"
               value={form.matricule}
               onChange={handleChange}
               error={errors.matricule}
               required
             />
            <SelectInput
              label="Année"
              name="annee"
              value={form.annee}
              onChange={handleChange}
              error={errors.annee}
              options={yearOptions.map(year => ({ value: year, label: year.toString() }))}
              required
            />
            
                         {/* Note: Validation is only for existing users, not for new user creation */}
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
                             <button
                 type="submit"
                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {editId ? 'Modifier' : 'Créer'}
               </button>
            </div>
          </form>
        </Modal>

        {/* Password Modal */}
        <Modal
          open={showPasswordModal}
          onClose={handleClosePasswordModal}
          title="Mot de passe généré"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Un mot de passe temporaire a été généré pour <strong>{selectedResponsable?.utilisateurNom}</strong>.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Mot de passe temporaire :</p>
              <p className="font-mono text-lg font-bold text-gray-800">{generatedPassword}</p>
            </div>
            <p className="text-sm text-red-600">
              ⚠️ Veuillez noter ce mot de passe. Il ne sera plus affiché après la fermeture de cette fenêtre.
            </p>
            <button
              onClick={handleClosePasswordModal}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              J'ai noté le mot de passe
            </button>
          </div>
        </Modal>

        {/* Reassignment Modal */}
        <ReassignmentModal
          isOpen={showReassignmentModal}
          onClose={() => setShowReassignmentModal(false)}
          currentResponsable={selectedResponsable}
          onSuccess={handleReassignmentSuccess}
        />

        {/* Switch Responsables Modal */}
        <SwitchResponsablesModal
          isOpen={showSwitchModal}
          onClose={() => setShowSwitchModal(false)}
          onSuccess={handleReassignmentSuccess}
        />
      </main>
    </div>
  );
}