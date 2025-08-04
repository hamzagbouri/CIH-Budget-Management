import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../components/NotificationSystem';
import { adminExpenseService } from '../services';

const columns = [
  { key: 'titre', label: 'Titre', sortable: true },
  { key: 'montant', label: 'Montant (DH)', sortable: true, render: (value) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value) },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'date', label: 'Date', sortable: true, render: (value) => new Date(value).toLocaleDateString('fr-FR') },
  { key: 'departementNom', label: 'Département', sortable: true },
  { 
    key: 'status', 
    label: 'Statut', 
    sortable: true,
    render: (value) => {
      const statusConfig = {
        'EN_ATTENTE': { text: 'En Attente', class: 'bg-yellow-100 text-yellow-800' },
        'VALID': { text: 'Validée', class: 'bg-green-100 text-green-800' },
        'INVALID': { text: 'Refusée', class: 'bg-red-100 text-red-800' }
      };
      const config = statusConfig[value] || statusConfig['EN_ATTENTE'];
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.class}`}>
          {config.text}
        </span>
      );
    }
  },
];

export default function AdminValidationDepenses() {
  const [expenses, setExpenses] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, expense: null, action: null });
  const [processing, setProcessing] = useState(false);
  const { success, error, warning } = useNotifications();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [allExpenses, pending] = await Promise.all([
        adminExpenseService.getAllExpenses(),
        adminExpenseService.getPendingExpenses()
      ]);
      
      setExpenses(allExpenses);
      setPendingExpenses(pending);
    } catch (err) {
      error('Erreur', err.message || 'Erreur lors du chargement des dépenses');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (expense) => {
    setModal({ open: true, expense, action: 'validate' });
  };

  const handleReject = async (expense) => {
    setModal({ open: true, expense, action: 'reject' });
  };

  const confirmAction = async () => {
    if (!modal.expense) return;

    try {
      setProcessing(true);
      
      if (modal.action === 'validate') {
        await adminExpenseService.validateExpense(modal.expense.id);
        success('Succès', 'Dépense validée avec succès');
      } else if (modal.action === 'reject') {
        await adminExpenseService.rejectExpense(modal.expense.id);
        success('Succès', 'Dépense rejetée avec succès');
      }

      // Refresh data
      await fetchExpenses();
      setModal({ open: false, expense: null, action: null });
    } catch (err) {
      error('Erreur', err.message || 'Erreur lors de l\'action');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'EN_ATTENTE': 'text-yellow-600',
      'VALID': 'text-green-600',
      'INVALID': 'text-red-600'
    };
    return colors[status] || colors['EN_ATTENTE'];
  };

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Validation des Dépenses</h1>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {pendingExpenses.length} en attente
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {expenses.filter(e => e.status === 'EN_ATTENTE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Validées</p>
                <p className="text-2xl font-bold text-green-600">
                  {expenses.filter(e => e.status === 'VALID').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Refusées</p>
                <p className="text-2xl font-bold text-red-600">
                  {expenses.filter(e => e.status === 'INVALID').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(expenses.reduce((sum, e) => sum + e.montant, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Toutes les Dépenses</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setPendingExpenses(expenses.filter(e => e.status === 'EN_ATTENTE'))}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                Filtrer En Attente
              </button>
              <button 
                onClick={() => setPendingExpenses(expenses)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Voir Tout
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={pendingExpenses}
            onEdit={(row) => {
              if (row.status === 'EN_ATTENTE') {
                handleValidate(row);
              }
            }}
            enableSort
            enablePagination
            actions={[
              {
                label: 'Valider',
                onClick: handleValidate,
                condition: (row) => row.status === 'EN_ATTENTE',
                className: 'bg-green-500 hover:bg-green-600 text-white'
              },
              {
                label: 'Rejeter',
                onClick: handleReject,
                condition: (row) => row.status === 'EN_ATTENTE',
                className: 'bg-red-500 hover:bg-red-600 text-white'
              }
            ]}
          />
        </div>

        {/* Confirmation Modal */}
        <Modal 
          open={modal.open} 
          onClose={() => setModal({ open: false, expense: null, action: null })}
          title={modal.action === 'validate' ? 'Valider la dépense ?' : 'Rejeter la dépense ?'}
        >
          {modal.expense && (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Titre</p>
                    <p className="font-semibold">{modal.expense.titre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Montant</p>
                    <p className="font-semibold">{formatCurrency(modal.expense.montant)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <p className="font-semibold">{modal.expense.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date</p>
                    <p className="font-semibold">{new Date(modal.expense.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {modal.expense.description && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-sm">{modal.expense.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                    modal.action === 'validate' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={confirmAction}
                  disabled={processing}
                >
                  {processing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </div>
                  ) : (
                    modal.action === 'validate' ? 'Valider' : 'Rejeter'
                  )}
                </button>
                <button 
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setModal({ open: false, expense: null, action: null })}
                  disabled={processing}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
} 