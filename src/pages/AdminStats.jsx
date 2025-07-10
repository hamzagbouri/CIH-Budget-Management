import AdminSidebar from '../components/AdminSidebar';
import StatCard from '../components/StatCard';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { departements, expenses } from '../data/staticData';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];

export default function AdminStats() {
  // Global stats
  const totalBudget = departements.reduce((sum, d) => sum + Number(d.budget), 0);
  const totalDepenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  // Per-department
  const depLabels = departements.map(d => d.name);
  const depBudgets = departements.map(d => d.budget);
  const depDepenses = departements.map(d => expenses.filter(e => e.service === d.name).reduce((s, e) => s + Number(e.amount), 0));
  // Monthly (dummy)
  const monthlyData = [5000, 18000, 7000, 15000, 12000, 9000, 35000];
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-8">Statistiques Générales</h1>
        <div className="flex flex-wrap gap-4 mb-8">
          <StatCard label="Total Budgets" value={totalBudget + ' DH'} icon="account_balance" color="bg-blue-100" />
          <StatCard label="Total Dépenses" value={totalDepenses + ' DH'} icon="bar_chart" color="bg-orange-100" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Dépenses par département</h2>
            <div className="w-full h-64"><Bar data={{ labels: depLabels, datasets: [{ label: 'Dépenses', data: depDepenses, backgroundColor: '#f97316' }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Budgets par département</h2>
            <div className="w-full h-64"><Bar data={{ labels: depLabels, datasets: [{ label: 'Budgets', data: depBudgets, backgroundColor: '#2563eb' }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col max-w-md mx-auto mb-6">
          <h2 className="text-lg font-semibold mb-4">Évolution mensuelle globale</h2>
          <div className="w-full h-64"><Pie data={{ labels: months, datasets: [{ data: monthlyData, backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd', '#fbbf24', '#f97316', '#22c55e', '#a21caf'] }] }} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </main>
    </div>
  );
} 