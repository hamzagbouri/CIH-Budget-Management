import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const data = {
  labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
  datasets: [
    {
      label: 'Dépenses',
      data: [5000, 18000, 7000, 15000, 12000, 9000, 35000],
      backgroundColor: '#f97316',
      borderRadius: 6,
      barThickness: 28,
    },
  ],
};

const options = {
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: '#222', font: { size: 13 } },
      grid: { color: '#e5e7eb' },
    },
    x: {
      ticks: { color: '#222', font: { size: 13 } },
      grid: { display: false },
    },
  },
};

export default function MonthlyBarChart() {
  return (
    <div className="w-full h-64">
      <Bar data={data} options={options} />
    </div>
  );
} 