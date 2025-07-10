import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import StatCard from '../components/StatCard';
import { departements as staticDepartements, users, expenses } from '../data/staticData';
import { useRole } from '../context/RoleContext';

const columns = [
  { key: 'name', label: 'Département', sortable: true },
  { key: 'budget', label: 'Budget (DH)', sortable: true },
  { key: 'totalDepenses', label: 'Dépenses (DH)', sortable: true },
  { key: 'responsableName', label: 'Responsable', sortable: true },
];

function enrichDepartements(deps) {
  return deps.map(dep => {
    const totalDepenses = expenses.filter(e => e.service === dep.name && e.status === 'valide').reduce((sum, e) => sum + Number(e.amount), 0);
    const responsableName = users.find(u => u.id === dep.responsable)?.name || '-';
    return { ...dep, totalDepenses, responsableName };
  });
}

export default function AdminDepartements() {
  const [departements, setDepartements] = useState(staticDepartements);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', budget: '', responsable: '' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const handleEdit = (row) => {
    setForm({ name: row.name, budget: row.budget, responsable: row.responsable || '' });
    setEditId(row.id);
    setShowModal(true);
  };
  const handleDelete = (row) => {
    setDepartements(deps => deps.filter(d => d.id !== row.id));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Champ requis';
    if (!form.budget || isNaN(form.budget) || Number(form.budget) <= 0) errs.budget = 'Budget invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      setDepartements(deps => deps.map(d => d.id === editId ? { ...d, ...form, id: editId } : d));
    } else {
      setDepartements(deps => [...deps, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setForm({ name: '', budget: '', responsable: '' });
    setEditId(null);
    setErrors({});
  };
  // Stats
  const totalBudget = departements.reduce((sum, d) => sum + Number(d.budget), 0);
  const totalDepenses = departements.reduce((sum, d) => sum + (expenses.filter(e => e.service === d.name && e.status === 'valide').reduce((s, e) => s + Number(e.amount), 0)), 0);
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-8">Départements & Budgets</h1>
        <div className="flex flex-wrap gap-4 mb-8">
          <StatCard label="Total Budgets" value={totalBudget + ' DH'} icon="account_balance" color="bg-blue-100" />
          <StatCard label="Total Dépenses" value={totalDepenses + ' DH'} icon="bar_chart" color="bg-orange-100" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <Table
            columns={columns}
            data={enrichDepartements(departements)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort enablePagination
          />
        </div>
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); setForm({ name: '', budget: '', responsable: '' }); setErrors({}); }} title={editId ? 'Modifier le département' : 'Créer un département'}>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <FormInput label="Nom du département" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
            <FormInput label="Budget (DH)" name="budget" type="number" value={form.budget} onChange={handleChange} required error={errors.budget} />
            <SelectInput label="Responsable" name="responsable" value={form.responsable} onChange={handleChange} options={users.filter(u => u.role === 'responsable').map(u => ({ label: u.name, value: u.id }))} />
            <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{editId ? 'Modifier' : 'Créer'}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 