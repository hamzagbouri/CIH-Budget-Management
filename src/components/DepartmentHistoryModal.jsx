import { useState, useEffect } from 'react';
import { responsableService } from '../services/responsableService';
import LoadingSpinner from './LoadingSpinner';

export default function DepartmentHistoryModal({ 
  isOpen, 
  onClose, 
  department 
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && department?.id) {
      loadHistory();
    }
  }, [isOpen, department]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await responsableService.getDepartmentHistory(department.id);
      setHistory(historyData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de l\'historique');
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

  const getStatusBadge = (actif) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
      actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {actif ? 'Actif' : 'Inactif'}
    </span>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Historique des Responsables - {department?.nom}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="material-icons text-red-600">error</span>
              <span className="font-medium">Erreur</span>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button
              onClick={loadHistory}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-icons text-gray-300 text-4xl mb-2">history</span>
                <p className="text-gray-500">Aucun historique disponible pour ce département</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.utilisateurNom}
                        </h3>
                        <p className="text-sm text-gray-600">{item.utilisateurEmail}</p>
                        <p className="text-xs text-gray-500">Matricule: {item.utilisateurMatricule}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.actif)}
                        <span className="text-sm text-gray-500">Année {item.annee}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date de création:</span>
                        <p className="text-gray-600">{formatDate(item.dateCreation)}</p>
                      </div>
                      
                      {item.dateModification && (
                        <div>
                          <span className="font-medium text-gray-700">Dernière modification:</span>
                          <p className="text-gray-600">{formatDate(item.dateModification)}</p>
                        </div>
                      )}
                    </div>

                    {item.raisonModification && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800 text-sm">Raison de la modification:</span>
                        <p className="text-blue-700 text-sm mt-1">{item.raisonModification}</p>
                      </div>
                    )}

                    {item.utilisateurModification && (
                      <div className="mt-2 text-xs text-gray-500">
                        Modifié par: {item.utilisateurModification}
                      </div>
                    )}

                    {index < history.length - 1 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-center">
                          <span className="material-icons text-gray-400 text-sm">arrow_downward</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
} 