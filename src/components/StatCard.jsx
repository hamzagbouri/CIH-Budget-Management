export default function StatCard({ label, value, icon, color = 'bg-blue-100' }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl shadow ${color}`}>
      {icon && <span className="material-icons text-3xl text-blue-600">{icon}</span>}
      <div>
        <div className="text-gray-700 text-sm">{label}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
} 