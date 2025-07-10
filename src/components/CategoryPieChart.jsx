import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Développement', 'Formation', 'Maintenance'],
  datasets: [
    {
      data: [12000, 8000, 6000],
      backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd'],
      borderWidth: 2,
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: { color: '#222', font: { size: 14 } },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

export default function CategoryPieChart() {
  return (
    <div className="w-full h-64">
      <Pie data={data} options={options} />
    </div>
  );
} 