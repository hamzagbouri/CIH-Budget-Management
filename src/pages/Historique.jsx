import { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import Modal from '../components/Modal';
import { expenses as staticExpenses, categories, users } from '../data/staticData';
import { useRole } from '../context/RoleContext';

const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'amount', label: 'Montant (DH)', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'beneficiary', label: 'Bénéficiaire', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
];

export default function Historique() {
  const [expenses, setExpenses] = useState(staticExpenses);
  const [filters, setFilters] = useState({ category: '', beneficiary: '', dateFrom: '', dateTo: '' });
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const role = useRole();

  // Filtering
  const filtered = expenses.filter(exp =>
    (!filters.category || exp.category === filters.category) &&
    (!filters.beneficiary || exp.beneficiary === filters.beneficiary) &&
    (!filters.dateFrom || exp.date >= filters.dateFrom) &&
    (!filters.dateTo || exp.date <= filters.dateTo)
  );

  const handleEdit = (row) => {
    setEditForm(row);
    setEditId(row.id);
    setEditModal(true);
  };
  const handleDelete = (row) => {
    setExpenses(exps => exps.filter(exp => exp.id !== row.id));
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const validate = () => {
    const errs = {};
    if (!editForm.name) errs.name = 'Champ requis';
    if (!editForm.amount || isNaN(editForm.amount) || Number(editForm.amount) <= 0) errs.amount = 'Montant invalide';
    if (!editForm.category) errs.category = 'Champ requis';
    if (!editForm.beneficiary) errs.beneficiary = 'Champ requis';
    if (!editForm.date) errs.date = 'Champ requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setExpenses(exps => exps.map(exp => exp.id === editId ? { ...editForm, id: editId } : exp));
    setEditModal(false);
    setEditId(null);
    setEditForm({});
    setErrors({});
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <UserSidebar />
      <main className="flex-1 p-4 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-8">Historique des Dépenses</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <SelectInput label="Catégorie" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} options={categories} />
          <SelectInput label="Bénéficiaire" value={filters.beneficiary} onChange={e => setFilters(f => ({ ...f, beneficiary: e.target.value }))} options={users.map(u => u.name)} />
          <FormInput label="De" type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
          <FormInput label="À" type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <Table
            columns={columns}
            data={filtered}
            onEdit={role === 'user' ? handleEdit : undefined}
            onDelete={role === 'user' ? handleDelete : undefined}
            enableSort enablePagination
          />
        </div>
        <Modal open={editModal} onClose={() => { setEditModal(false); setEditId(null); setEditForm({}); setErrors({}); }} title="Modifier la dépense">
          <form className="flex flex-col gap-2" onSubmit={handleEditSubmit}>
            <FormInput label="Nom de la dépense" name="name" value={editForm.name || ''} onChange={handleEditChange} required error={errors.name} />
            <FormInput label="Montant" name="amount" type="number" value={editForm.amount || ''} onChange={handleEditChange} required error={errors.amount} />
            <SelectInput label="Catégorie" name="category" value={editForm.category || ''} onChange={handleEditChange} options={categories} required error={errors.category} />
            <SelectInput label="Bénéficiaire" name="beneficiary" value={editForm.beneficiary || ''} onChange={handleEditChange} options={users.map(u => u.name)} required error={errors.beneficiary} />
            <FormInput label="Date" name="date" type="date" value={editForm.date || ''} onChange={handleEditChange} required error={errors.date} />
            <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Modifier</button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 