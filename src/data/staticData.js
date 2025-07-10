// Utilisateurs
export const users = [
  { id: 1, name: 'Admin', email: 'admin@cihbank.ma', role: 'admin', service: 'Informatique' },
  { id: 2, name: 'Yassine', email: 'yassine@cihbank.ma', role: 'responsable', service: 'Informatique' },
  { id: 3, name: 'Sara', email: 'sara@cihbank.ma', role: 'user', service: 'RH' },
];

// Départements
export const departements = [
  { id: 1, name: 'Informatique', budget: 100000, responsable: 2 },
  { id: 2, name: 'RH', budget: 80000, responsable: 3 },
  { id: 3, name: 'Marketing', budget: 60000, responsable: null },
];

// Services et budgets (deprecated, use departements)
export const services = departements;

// Dépenses
export const expenses = [
  { id: 1, name: 'Dev API', amount: 7000, category: 'Développement', beneficiary: 'Yassine', date: '2025-07-02', service: 'Informatique', status: 'valide' },
  { id: 2, name: 'Maintenance Sys', amount: 5000, category: 'Maintenance', beneficiary: 'Sara', date: '2025-07-01', service: 'RH', status: 'valide' },
  { id: 3, name: 'Formation', amount: 5000, category: 'Formation', beneficiary: 'Yassine', date: '2025-06-29', service: 'Informatique', status: 'valide' },
];

// Dépenses en attente de validation
export const pendingExpenses = [
  { id: 4, name: 'Achat PC', amount: 12000, category: 'Achats', beneficiary: 'Yassine', date: '2025-07-10', service: 'Informatique', status: 'pending' },
  { id: 5, name: 'Séminaire', amount: 3000, category: 'Formation', beneficiary: 'Sara', date: '2025-07-11', service: 'RH', status: 'pending' },
];

// Catégories de dépenses
export const categories = [
  'Développement',
  'Formation',
  'Maintenance',
  'Prestations',
  'Achats',
]; 