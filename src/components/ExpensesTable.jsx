const expenses = [
  { date: '02/07/2025', desc: 'Dev API', amount: '7000 DH', cat: 'Développement' },
  { date: '01/07/2025', desc: 'Maintenance Sys', amount: '5000 DH', cat: 'Maintenance' },
  { date: '29/06/2025', desc: 'Formation', amount: '5000 DH', cat: 'Formation' },
];

export default function ExpensesTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-[#f5f7fa]">
            <th colSpan={4} className="text-lg font-semibold py-3 border-b text-center">Tableau des dernières dépenses</th>
          </tr>
          <tr className="bg-[#f5f7fa]">
            <th className="py-2 px-4 border-b text-left font-medium">Date</th>
            <th className="py-2 px-4 border-b text-left font-medium">Description</th>
            <th className="py-2 px-4 border-b text-left font-medium">Montant</th>
            <th className="py-2 px-4 border-b text-left font-medium">Catégorie</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp, idx) => (
            <tr key={idx} className="hover:bg-blue-50">
              <td className="py-2 px-4 border-b">{exp.date}</td>
              <td className="py-2 px-4 border-b">{exp.desc}</td>
              <td className="py-2 px-4 border-b">{exp.amount}</td>
              <td className="py-2 px-4 border-b">{exp.cat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 