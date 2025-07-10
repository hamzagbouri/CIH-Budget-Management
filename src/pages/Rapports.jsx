import UserSidebar from '../components/UserSidebar';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { expenses, categories, services } from '../data/staticData';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Monthly evolution
const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
const monthlyData = [5000, 18000, 7000, 15000, 12000, 9000, 35000];
const barData = {
  labels: months,
  datasets: [{ label: 'Dépenses', data: monthlyData, backgroundColor: '#2563eb', borderRadius: 6, barThickness: 28 }],
};

// Type breakdown
const typeSums = categories.map(cat => expenses.filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0));
const pieData = {
  labels: categories,
  datasets: [{ data: typeSums, backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd', '#fbbf24', '#f97316'] }],
};

// Remaining budget (dummy: total - used)
const totalBudget = services.reduce((sum, s) => sum + s.budget, 0);
const used = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
const doughnutData = {
  labels: ['Utilisé', 'Restant'],
  datasets: [{ data: [used, totalBudget - used], backgroundColor: ['#f97316', '#22c55e'] }],
};

export default function Rapports() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <UserSidebar />
      <main className="flex-1 p-4 md:p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-8">Rapports Budgétaires</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Évolution mensuelle du budget</h2>
            <div className="w-full h-64"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Répartition des dépenses par type</h2>
            <div className="w-full h-64"><Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Solde budgétaire restant</h2>
          <div className="w-full h-64"><Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
        </div>
      </main>
    </div>
  );
} 