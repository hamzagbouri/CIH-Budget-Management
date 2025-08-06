import { useState, useEffect } from 'react';
import { responsableService, userService, departmentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './NotificationSystem';
import LoadingSpinner from './LoadingSpinner';

export default function SwitchResponsablesModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const { user } = useAuth();
  const { success, error: showError } = useNotifications();
  
  const [formData, setFormData] = useState({
    user1Id: '',
    user2Id: '',
    dept1Id: '',
    dept2Id: '',
    annee: new Date().getFullYear(),
    reason: 'Switch avec autre utilisateur'
  });
  
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFormData({
        user1Id: '',
        user2Id: '',
        dept1Id: '',
        dept2Id: '',
        annee: new Date().getFullYear(),
        reason: 'Switch avec autre utilisateur'
      });
      setErrors({});
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, departmentsData] = await Promise.all([
        userService.getAllUsers(),
        departmentService.getAllDepartments()
      ]);
      
      // Filter active users and departments (handle both boolean and undefined values)
      const activeUsers = usersData.filter(u => u.actif !== false);
      const activeDepartments = departmentsData.filter(d => d.actif !== false);
      
      setUsers(activeUsers);
      setDepartments(activeDepartments);
      
      // Debug: Log the data
      console.log('Users loaded:', activeUsers.length);
      console.log('Departments loaded:', activeDepartments.length);
    } catch (err) {
      console.error('Error loading data:', err);
      showError('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.user1Id) {
      newErrors.user1Id = 'Sélectionnez le premier utilisateur';
    }
    
    if (!formData.user2Id) {
      newErrors.user2Id = 'Sélectionnez le deuxième utilisateur';
    }
    
    if (!formData.dept1Id) {
      newErrors.dept1Id = 'Sélectionnez le premier département';
    }
    
    if (!formData.dept2Id) {
      newErrors.dept2Id = 'Sélectionnez le deuxième département';
    }
    
    if (formData.user1Id === formData.user2Id) {
      newErrors.user2Id = 'Les deux utilisateurs doivent être différents';
    }
    
    if (formData.dept1Id === formData.dept2Id) {
      newErrors.dept2Id = 'Les deux départements doivent être différents';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'La raison est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUsers = async () => {
    if (!formData.user1Id || !formData.user2Id || !formData.annee) return false;
    
    try {
      setValidating(true);
      const [user1Valid, user2Valid] = await Promise.all([
        responsableService.validateUserCanBeResponsible(formData.user1Id, formData.annee),
        responsableService.validateUserCanBeResponsible(formData.user2Id, formData.annee)
      ]);
      return user1Valid && user2Valid;
    } catch (err) {
      showError('Erreur de validation', err.message);
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSwitch = async () => {
    if (!validateForm()) return;
    
    const isValid = await validateUsers();
    if (!isValid) {
      showError('Validation échouée', 'Un ou les deux utilisateurs ne peuvent pas être assignés comme responsables pour cette année');
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Move User 1 to Department 2
      await responsableService.changeDepartmentResponsible(
        formData.dept2Id,
        formData.user1Id,
        formData.annee,
        user.email,
        formData.reason
      );
      
      // Step 2: Move User 2 to Department 1
      await responsableService.changeDepartmentResponsible(
        formData.dept1Id,
        formData.user2Id,
        formData.annee,
        user.email,
        formData.reason
      );

      success('Succès', 'Switch des responsables effectué avec succès');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      if (err.message.includes('Impossible de modifier les données historiques')) {
        showError('Erreur', 'Impossible de modifier les données historiques');
      } else if (err.message.includes('L\'utilisateur est déjà responsable')) {
        showError('Erreur', 'Un utilisateur est déjà responsable d\'un département');
      } else if (err.message.includes('Ce département a déjà un responsable')) {
        showError('Erreur', 'Un département a déjà un responsable pour cette année');
      } else {
        showError('Erreur', err.message || 'Erreur lors du switch');
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

  const getUserName = (userId) => {
    const user = users.find(u => u.id === parseInt(userId));
    return user ? `${user.nom} (${user.email})` : '';
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === parseInt(deptId));
    return dept ? dept.nom : '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Switch des Responsables
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="space-y-6">
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

          {/* User 1 and Department 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premier Utilisateur *
              </label>
              <select
                name="user1Id"
                value={formData.user1Id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.user1Id ? 'border-red-500' : 'border-gray-300'
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
              {errors.user1Id && (
                <p className="text-red-500 text-sm mt-1">{errors.user1Id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premier Département *
              </label>
              <select
                name="dept1Id"
                value={formData.dept1Id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dept1Id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un département</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nom}
                  </option>
                ))}
              </select>
              {errors.dept1Id && (
                <p className="text-red-500 text-sm mt-1">{errors.dept1Id}</p>
              )}
            </div>
          </div>

          {/* Switch Arrow */}
          <div className="flex justify-center">
            <div className="bg-blue-100 p-2 rounded-full">
              <span className="material-icons text-blue-600">swap_horiz</span>
            </div>
          </div>

          {/* User 2 and Department 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deuxième Utilisateur *
              </label>
              <select
                name="user2Id"
                value={formData.user2Id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.user2Id ? 'border-red-500' : 'border-gray-300'
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
              {errors.user2Id && (
                <p className="text-red-500 text-sm mt-1">{errors.user2Id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deuxième Département *
              </label>
              <select
                name="dept2Id"
                value={formData.dept2Id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dept2Id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Sélectionnez un département</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nom}
                  </option>
                ))}
              </select>
              {errors.dept2Id && (
                <p className="text-red-500 text-sm mt-1">{errors.dept2Id}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          {(formData.user1Id && formData.user2Id && formData.dept1Id && formData.dept2Id) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Aperçu du Switch :</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Avant :</strong></p>
                <p>• {getUserName(formData.user1Id)} → {getDepartmentName(formData.dept1Id)}</p>
                <p>• {getUserName(formData.user2Id)} → {getDepartmentName(formData.dept2Id)}</p>
                <p className="mt-2"><strong>Après :</strong></p>
                <p>• {getUserName(formData.user1Id)} → {getDepartmentName(formData.dept2Id)}</p>
                <p>• {getUserName(formData.user2Id)} → {getDepartmentName(formData.dept1Id)}</p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison du Switch *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Expliquez la raison de ce switch..."
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
            onClick={handleSwitch}
            disabled={loading || validating || !formData.user1Id || !formData.user2Id || !formData.dept1Id || !formData.dept2Id}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Switch en cours...</span>
              </div>
            ) : (
              'Effectuer le Switch'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 