import { useState, useEffect } from 'react';
import { responsableService, userService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './NotificationSystem';
import LoadingSpinner from './LoadingSpinner';

export default function ReassignmentModal({ 
  isOpen, 
  onClose, 
  currentResponsable, 
  onSuccess 
}) {
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  
  const [formData, setFormData] = useState({
    departementId: currentResponsable?.departementId || '',
    newUserId: '',
    annee: new Date().getFullYear(),
    reason: 'Réassignation'
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setFormData({
        departementId: currentResponsable?.departementId || '',
        newUserId: '',
        annee: new Date().getFullYear(),
        reason: 'Réassignation'
      });
      setErrors({});
    }
  }, [isOpen, currentResponsable]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      // Filter out the current responsible
      const filteredUsers = usersData.filter(u => 
        u.id !== currentResponsable?.utilisateurId && u.actif
      );
      setUsers(filteredUsers);
    } catch (err) {
      showError('Erreur', 'Impossible de charger la liste des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.newUserId) {
      newErrors.newUserId = 'Sélectionnez un nouvel utilisateur';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'La raison est obligatoire';
    }
    
    if (formData.reason.trim().length < 5) {
      newErrors.reason = 'La raison doit contenir au moins 5 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUser = async () => {
    if (!formData.newUserId || !formData.annee) return false;
    
    try {
      setValidating(true);
      const canBeResponsible = await responsableService.validateUserCanBeResponsible(
        formData.newUserId, 
        formData.annee
      );
      return canBeResponsible;
    } catch (err) {
      showError('Erreur de validation', err.message);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleReassign = async () => {
    if (!validateForm()) return;
    
    const isValid = await validateUser();
    if (!isValid) {
      showError('Validation échouée', 'Cet utilisateur ne peut pas être assigné comme responsable pour cette année');
      return;
    }

    try {
      setLoading(true);
      
      const reassignmentData = {
        departementId: Number(formData.departementId),
        newUserId: Number(formData.newUserId),
        annee: Number(formData.annee),
        modifiedBy: user.email,
        reason: formData.reason.trim()
      };

      const result = await responsableService.reassignResponsable(
        reassignmentData.departementId,
        reassignmentData.newUserId,
        reassignmentData.annee,
        reassignmentData.modifiedBy,
        reassignmentData.reason
      );

      success('Succès', 'Responsable réassigné avec succès');
      onSuccess && onSuccess(result);
      onClose();
    } catch (err) {
      if (err.message.includes('Impossible de modifier les données historiques')) {
        showError('Erreur', 'Impossible de modifier les données historiques');
      } else if (err.message.includes('L\'utilisateur est déjà responsable')) {
        showError('Erreur', 'Cet utilisateur est déjà responsable d\'un département');
      } else if (err.message.includes('Ce département a déjà un responsable')) {
        showError('Erreur', 'Ce département a déjà un responsable pour cette année');
      } else {
        showError('Erreur', err.message || 'Erreur lors de la réassignation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Réassigner le Responsable
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Department Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Département</p>
            <p className="font-medium">{currentResponsable?.departementNom}</p>
          </div>

          {/* Current Responsible Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Responsable Actuel</p>
            <p className="font-medium">{currentResponsable?.utilisateurNom}</p>
            <p className="text-sm text-gray-500">{currentResponsable?.utilisateurEmail}</p>
          </div>

          {/* New User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau Responsable *
            </label>
            <select
              name="newUserId"
              value={formData.newUserId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.newUserId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Sélectionnez un utilisateur</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nom} ({user.email})
                </option>
              ))}
            </select>
            {errors.newUserId && (
              <p className="text-red-500 text-sm mt-1">{errors.newUserId}</p>
            )}
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Année
            </label>
            <select
              name="annee"
              value={formData.annee}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison de la Réassignation *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Expliquez la raison de cette réassignation..."
              disabled={loading}
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Validation Status */}
          {validating && (
            <div className="flex items-center gap-2 text-blue-600">
              <LoadingSpinner size="sm" />
              <span className="text-sm">Validation en cours...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleReassign}
            disabled={loading || validating || !formData.newUserId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Réassignation...</span>
              </div>
            ) : (
              'Réassigner'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 