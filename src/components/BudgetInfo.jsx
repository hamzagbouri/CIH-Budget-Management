import React from 'react';

const BudgetInfo = ({ 
  totalBudget, 
  usedAmount, 
  remainingAmount, 
  title = "Budget", 
  showProgress = true,
  showDetails = true,
  size = 'md'
}) => {
  const percentage = totalBudget > 0 ? (usedAmount / totalBudget) * 100 : 0;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-sm',
      amount: 'text-lg',
      progress: 'h-1.5'
    },
    md: {
      container: 'p-4',
      title: 'text-base',
      amount: 'text-xl',
      progress: 'h-2'
    },
    lg: {
      container: 'p-6',
      title: 'text-lg',
      amount: 'text-2xl',
      progress: 'h-3'
    }
  };

  const sizeStyle = sizeClasses[size];

  return (
    <div className={`bg-white rounded-xl shadow-sm ${sizeStyle.container}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold text-gray-800 ${sizeStyle.title}`}>
          {title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(percentage)}`}>
          {percentage.toFixed(1)}% utilisé
        </span>
      </div>

      {showProgress && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`${getProgressColor(percentage)} ${sizeStyle.progress} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {showDetails ? (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className={`font-bold text-blue-600 ${sizeStyle.amount}`}>
              {formatCurrency(totalBudget)}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div>
            <p className={`font-bold text-orange-600 ${sizeStyle.amount}`}>
              {formatCurrency(usedAmount)}
            </p>
            <p className="text-xs text-gray-500">Utilisé</p>
          </div>
          <div>
            <p className={`font-bold text-green-600 ${sizeStyle.amount}`}>
              {formatCurrency(remainingAmount)}
            </p>
            <p className="text-xs text-gray-500">Restant</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className={`font-bold text-gray-900 ${sizeStyle.amount}`}>
            {formatCurrency(remainingAmount)}
          </p>
          <p className="text-sm text-gray-500">Budget disponible</p>
        </div>
      )}

      {percentage >= 90 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="material-icons text-red-500 text-sm mr-2">warning</span>
            <p className="text-red-700 text-xs">
              Attention : Budget presque épuisé ({formatCurrency(remainingAmount)} restant)
            </p>
          </div>
        </div>
      )}

      {percentage >= 100 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="material-icons text-red-500 text-sm mr-2">error</span>
            <p className="text-red-700 text-xs">
              Budget dépassé ! Impossible d'ajouter de nouvelles dépenses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetInfo; 