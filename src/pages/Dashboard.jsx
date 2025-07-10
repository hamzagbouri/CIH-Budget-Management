import UserSidebar from '../components/UserSidebar';
import SummaryCard from '../components/SummaryCard';
import ExpensesTable from '../components/ExpensesTable';

export default function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e9eff2]">
      <UserSidebar />
      <main className="flex-1 p-10">
        <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Tableau de bord budgétaire</h1>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
          <SummaryCard label="Budget total" value="100 000 DH" />
          <SummaryCard label="Montant utilisé" value="20 000 DH" />
          <SummaryCard label="Budget restant" value="80 000 DH" />
        </div>
        <div className="bg-white rounded-2xl p-3 md:p-6 shadow-md">
          <ExpensesTable />
        </div>
      </main>
    </div>
  );
} 