import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { pendingExpenses as staticPending, expenses as staticExpenses } from '../data/staticData';

const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'amount', label: 'Montant (DH)', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'beneficiary', label: 'Bénéficiaire', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'service', label: 'Département', sortable: true },
];

export default function AdminValidationDepenses() {
  const [pending, setPending] = useState(staticPending);
  const [expenses, setExpenses] = useState(staticExpenses);
  const [modal, setModal] = useState({ open: false, row: null });

  const handleValidate = (row) => {
    setExpenses(exps => [...exps, { ...row, status: 'valide' }]);
    setPending(p => p.filter(e => e.id !== row.id));
  };
  const handleRefuse = (row) => {
    setPending(p => p.filter(e => e.id !== row.id));
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-8">Validation des Dépenses</h1>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <Table
            columns={columns}
            data={pending}
            onEdit={row => setModal({ open: true, row })}
            enableSort enablePagination
          />
        </div>
        <Modal open={modal.open} onClose={() => setModal({ open: false, row: null })} title="Valider la dépense ?">
          {modal.row && (
            <div className="flex flex-col gap-4">
              <div><b>Nom :</b> {modal.row.name}</div>
              <div><b>Montant :</b> {modal.row.amount} DH</div>
              <div><b>Catégorie :</b> {modal.row.category}</div>
              <div><b>Bénéficiaire :</b> {modal.row.beneficiary}</div>
              <div><b>Département :</b> {modal.row.service}</div>
              <div className="flex gap-4 mt-4">
                <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => { handleValidate(modal.row); setModal({ open: false, row: null }); }}>Valider</button>
                <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={() => { handleRefuse(modal.row); setModal({ open: false, row: null }); }}>Refuser</button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
} 