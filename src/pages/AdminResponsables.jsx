import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import { users as staticUsers, departements } from '../data/staticData';

const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'service', label: 'Département', sortable: true },
];

export default function AdminResponsables() {
  const [users, setUsers] = useState(staticUsers.filter(u => u.role === 'responsable'));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', service: '' });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const handleEdit = (row) => {
    setForm(row);
    setEditId(row.id);
    setShowModal(true);
  };
  const handleDelete = (row) => {
    setUsers(us => us.filter(u => u.id !== row.id));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Champ requis';
    if (!form.email || !form.email.includes('@')) errs.email = 'Email invalide';
    if (!form.service) errs.service = 'Champ requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      setUsers(us => us.map(u => u.id === editId ? { ...form, id: editId, role: 'responsable' } : u));
    } else {
      setUsers(us => [...us, { ...form, id: Date.now(), role: 'responsable' }]);
    }
    setShowModal(false);
    setForm({ name: '', email: '', service: '' });
    setEditId(null);
    setErrors({});
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Gestion des Responsables</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition-colors"
            onClick={() => setShowModal(true)}
          >
            <span className="material-icons text-2xl">add</span>
            <span className="hidden sm:inline">Créer un responsable</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
          <Table
            columns={columns}
            data={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
            enableSort enablePagination
          />
        </div>
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); setForm({ name: '', email: '', service: '' }); setErrors({}); }} title={editId ? 'Modifier le responsable' : 'Créer un responsable'}>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <FormInput label="Nom" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
            <FormInput label="Email" name="email" value={form.email} onChange={handleChange} required error={errors.email} />
            <SelectInput label="Département" name="service" value={form.service} onChange={handleChange} options={departements.map(d => d.name)} required error={errors.service} />
            <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{editId ? 'Modifier' : 'Créer'}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 