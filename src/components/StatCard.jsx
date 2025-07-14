export default function StatCard({ label, value, icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <div className={`flex items-center gap-4 p-6 rounded-2xl shadow-sm border ${colorClasses[color] || colorClasses.blue}`}>
      <div className={`p-3 rounded-xl bg-white shadow-sm`}>
        <span className={`material-icons text-2xl ${iconColorClasses[color] || iconColorClasses.blue}`}>
          {icon}
        </span>
      </div>
      <div className="flex-1">
        <div className="text-gray-600 text-sm font-medium mb-1">{label}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="flex items-center mt-1">
            <span className={`material-icons text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-xs ml-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? 'En hausse' : 'En baisse'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 