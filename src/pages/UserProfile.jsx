import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../components/NotificationSystem';
import { userDashboardService } from '../services';

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useNotifications();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    nom: '',
    email: '',
    matricule: ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userDashboardService.getUserProfile();
      setProfile(profileData);
      setProfileForm({
        nom: profileData.nom || '',
        email: profileData.email || '',
        matricule: profileData.matricule || ''
      });
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    try {
      setSubmitting(true);
      await userDashboardService.updateUserProfile(profileForm);
      await fetchProfile();
      setShowEditModal(false);
      success('Succès', 'Profil mis à jour avec succès');
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setSubmitting(true);
      await userDashboardService.updatePassword(passwordForm);
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      success('Succès', 'Mot de passe mis à jour avec succès');
    } catch (err) {
      showError('Erreur', err.message || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSubmitting(false);
    }
  };

  const validateProfileForm = () => {
    const errs = {};
    if (!profileForm.nom.trim()) {
      errs.nom = 'Nom requis';
    }
    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      errs.email = 'Email valide requis';
    }
    if (!profileForm.matricule.trim()) {
      errs.matricule = 'Matricule requis';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordForm.currentPassword) {
      errs.currentPassword = 'Mot de passe actuel requis';
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      errs.newPassword = 'Nouveau mot de passe requis (min 6 caractères)';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e, formType = 'profile') => {
    const { name, value } = e.target;
    if (formType === 'password') {
      setPasswordForm(prev => ({ ...prev, [name]: value }));
    } else {
      setProfileForm(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <LoadingSpinner size="lg" text="Chargement du profil..." />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
        <Sidebar />
        <main className="flex-1 p-10">
          <div className="text-center text-gray-500">
            Erreur lors du chargement du profil
          </div>
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
            Mon Profil
          </h1>
          <p className="text-gray-600">
            Gérez vos informations personnelles et votre mot de passe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Informations Personnelles</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modifier
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nom complet</label>
                <p className="text-gray-900 font-medium">{profile.nom}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Matricule</label>
                <p className="text-gray-900">{profile.matricule}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Rôle</label>
                <p className="text-gray-900 capitalize">{profile.role}</p>
              </div>
            </div>
          </div>

          {/* Current Department */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Département Actuel</h2>
            
            {profile.departementActuel ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Département</label>
                  <p className="text-gray-900 font-medium">{profile.departementActuel.nom}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ID Département</label>
                  <p className="text-gray-900">{profile.departementActuel.id}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-icons text-gray-300 text-4xl mb-2">business</span>
                <p className="text-gray-500">Aucun département assigné</p>
              </div>
            )}
          </div>

          {/* Previous Departments */}
          {profile.departementsPrecedents && profile.departementsPrecedents.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Départements Précédents</h2>
              <div className="space-y-3">
                {profile.departementsPrecedents.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{dept.nom}</p>
                      <p className="text-sm text-gray-500">ID: {dept.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Password Management */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Sécurité</h2>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Changer Mot de Passe
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-icons text-green-600">security</span>
                <div>
                  <p className="font-medium text-gray-900">Mot de passe</p>
                  <p className="text-sm text-gray-500">Dernière modification: {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le Profil">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <FormInput
              label="Nom complet"
              name="nom"
              value={profileForm.nom}
              onChange={handleChange}
              error={errors.nom}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <FormInput
              label="Matricule"
              name="matricule"
              value={profileForm.matricule}
              onChange={handleChange}
              error={errors.matricule}
              required
            />
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </Modal>

        {/* Change Password Modal */}
        <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Changer le Mot de Passe">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <FormInput
              label="Mot de passe actuel"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => handleChange(e, 'password')}
              error={errors.currentPassword}
              required
            />
            <FormInput
              label="Nouveau mot de passe"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => handleChange(e, 'password')}
              error={errors.newPassword}
              required
            />
            <FormInput
              label="Confirmer le nouveau mot de passe"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handleChange(e, 'password')}
              error={errors.confirmPassword}
              required
            />
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : 'Changer le Mot de Passe'}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
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