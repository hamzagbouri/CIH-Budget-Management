import { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import Table from '../components/Table';
import { expenses as staticExpenses, categories, users } from '../data/staticData';
import { useRole } from '../context/RoleContext';

const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'amount', label: 'Montant (DH)', sortable: true },
  { key: 'category', label: 'Catégorie', sortable: true },
  { key: 'beneficiary', label: 'Bénéficiaire', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
];

export default function Depenses() {
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState(staticExpenses);
  const [form, setForm] = useState({ name: '', amount: '', category: '', beneficiary: '', date: '' });
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const role = useRole();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Champ requis';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Montant invalide';
    if (!form.category) errs.category = 'Champ requis';
    if (!form.beneficiary) errs.beneficiary = 'Champ requis';
    if (!form.date) errs.date = 'Champ requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      setExpenses(exps => exps.map(exp => exp.id === editId ? { ...form, id: editId } : exp));
    } else {
      setExpenses(exps => [
        ...exps,
        { ...form, id: Date.now() }
      ]);
    }
    setShowModal(false);
    setForm({ name: '', amount: '', category: '', beneficiary: '', date: '' });
    setEditId(null);
    setErrors({});
  };

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setShowModal(true);
  };

  const handleDelete = (row) => {
    setExpenses(exps => exps.filter(exp => exp.id !== row.id));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <UserSidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Gestion des Dépenses</h1>
          {role === 'user' && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition-colors"
              onClick={() => setShowModal(true)}
            >
              <span className="material-icons text-2xl">add</span>
              <span className="hidden sm:inline">Ajouter</span>
            </button>
          )}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <Table
            columns={columns}
            data={expenses}
            onEdit={role === 'user' ? handleEdit : undefined}
            onDelete={role === 'user' ? handleDelete : undefined}
            enableSort enablePagination
          />
        </div>
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); setForm({ name: '', amount: '', category: '', beneficiary: '', date: '' }); setErrors({}); }} title={editId ? 'Modifier la dépense' : 'Ajouter une dépense'}>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <FormInput label="Nom de la dépense" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
            <FormInput label="Montant" name="amount" type="number" value={form.amount} onChange={handleChange} required error={errors.amount} />
            <SelectInput label="Catégorie" name="category" value={form.category} onChange={handleChange} options={categories} required error={errors.category} />
            <SelectInput label="Bénéficiaire" name="beneficiary" value={form.beneficiary} onChange={handleChange} options={users.map(u => u.name)} required error={errors.beneficiary} />
            <FormInput label="Date" name="date" type="date" value={form.date} onChange={handleChange} required error={errors.date} />
            <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{editId ? 'Modifier' : 'Ajouter'}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 