import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { services as staticServices } from '../data/staticData';
import { useRole } from '../context/RoleContext';

const columns = [
  { key: 'name', label: 'Service', sortable: true },
  { key: 'budget', label: 'Budget Annuel (DH)', sortable: true },
];

export default function Budgets() {
  const [services, setServices] = useState(staticServices);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', budget: '' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setShowModal(true);
  };
  const handleDelete = (row) => {
    setServices(svcs => svcs.filter(s => s.id !== row.id));
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
      setServices(svcs => svcs.map(s => s.id === editId ? { ...form, id: editId } : s));
    } else {
      setServices(svcs => [...svcs, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setForm({ name: '', budget: '' });
    setEditId(null);
    setErrors({});
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Gestion Budgétaire</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition-colors"
            onClick={() => setShowModal(true)}
          >
            <span className="material-icons text-2xl">add</span>
            <span className="hidden sm:inline">Créer un budget</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <Table
            columns={columns}
            data={services}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort enablePagination
          />
        </div>
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); setForm({ name: '', budget: '' }); setErrors({}); }} title={editId ? 'Modifier le budget' : 'Créer un budget'}>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <FormInput label="Nom du service" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
            <FormInput label="Budget annuel (DH)" name="budget" type="number" value={form.budget} onChange={handleChange} required error={errors.budget} />
            <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{editId ? 'Modifier' : 'Créer'}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 