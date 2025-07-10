import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import { users as staticUsers } from '../data/staticData';
import { useRole } from '../context/RoleContext';

const columns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rôle', sortable: true },
  { key: 'service', label: 'Service', sortable: true },
];

export default function Utilisateurs() {
  const [users, setUsers] = useState(staticUsers);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', service: '' });
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
    if (!form.role) errs.role = 'Champ requis';
    if (!form.service) errs.service = 'Champ requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editId) {
      setUsers(us => us.map(u => u.id === editId ? { ...form, id: editId } : u));
    } else {
      setUsers(us => [...us, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setForm({ name: '', email: '', role: 'user', service: '' });
    setEditId(null);
    setErrors({});
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl md:text-2xl font-bold">Gestion des Utilisateurs</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition-colors"
            onClick={() => setShowModal(true)}
          >
            <span className="material-icons text-2xl">add</span>
            <span className="hidden sm:inline">Créer un utilisateur</span>
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
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditId(null); setForm({ name: '', email: '', role: 'user', service: '' }); setErrors({}); }} title={editId ? 'Modifier l’utilisateur' : 'Créer un utilisateur'}>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <FormInput label="Nom" name="name" value={form.name} onChange={handleChange} required error={errors.name} />
            <FormInput label="Email" name="email" value={form.email} onChange={handleChange} required error={errors.email} />
            <SelectInput label="Rôle" name="role" value={form.role} onChange={handleChange} options={['admin', 'user']} required error={errors.role} />
            <FormInput label="Service" name="service" value={form.service} onChange={handleChange} required error={errors.service} />
            <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">{editId ? 'Modifier' : 'Créer'}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
} 