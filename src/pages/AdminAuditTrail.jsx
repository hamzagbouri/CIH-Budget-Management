import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { responsableService } from '../services/responsableService';
import { useNotifications } from '../components/NotificationSystem';

export default function AdminAuditTrail() {
  const { error: showError } = useNotifications();
  
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
    endDate: new Date().toISOString().split('T')[0] + 'T23:59:59'
  });
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadModifications();
  }, [dateRange, selectedUser]);

  const loadModifications = async () => {
    try {
      setLoading(true);
      let data;
      
      if (selectedUser) {
        data = await responsableService.getAuditByUser(selectedUser);
      } else {
        data = await responsableService.getAuditByDateRange(dateRange.startDate, dateRange.endDate);
      }
      
      setModifications(data);
    } catch (error) {
      showError('Erreur', error.message || 'Erreur lors du chargement des modifications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionType = (item) => {
    if (item.raisonModification?.includes('Réassignation')) return 'Réassignation';
    if (item.raisonModification?.includes('Changement')) return 'Changement';
    if (item.dateCreation === item.dateModification) return 'Création';
    return 'Modification';
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'Création':
        return 'bg-green-100 text-green-800';
      case 'Réassignation':
        return 'bg-blue-100 text-blue-800';
      case 'Changement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserChange = (value) => {
    setSelectedUser(value);
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Utilisateur',
      'Département',
      'Année',
      'Action',
      'Raison',
      'Modifié par'
    ];

    const csvContent = [
      headers.join(','),
      ...modifications.map(item => [
        formatDate(item.dateModification || item.dateCreation),
        `"${item.utilisateurNom}"`,
        `"${item.departementNom}"`,
        item.annee,
        `"${getActionType(item)}"`,
        `"${item.raisonModification || 'N/A'}"`,
        `"${item.utilisateurModification || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Piste d'Audit - Responsables</h1>
          <button
            onClick={exportToCSV}
            disabled={modifications.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span className="material-icons text-sm">download</span>
            Exporter CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="datetime-local"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="datetime-local"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Utilisateur (optionnel)
              </label>
              <input
                type="text"
                placeholder="Email de l'utilisateur"
                value={selectedUser}
                onChange={(e) => handleUserChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={loadModifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualiser
            </button>
            <button
              onClick={() => {
                setDateRange({
                  startDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
                  endDate: new Date().toISOString().split('T')[0] + 'T23:59:59'
                });
                setSelectedUser('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Modifications ({modifications.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : modifications.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons text-gray-300 text-4xl mb-2">search</span>
              <p className="text-gray-500">Aucune modification trouvée pour les critères sélectionnés</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Année
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raison
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modifié par
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modifications.map((item, index) => {
                    const actionType = getActionType(item);
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.dateModification || item.dateCreation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.utilisateurNom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.utilisateurEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.departementNom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.annee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(actionType)}`}>
                            {actionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={item.raisonModification || 'N/A'}>
                            {item.raisonModification || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.utilisateurModification || 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 