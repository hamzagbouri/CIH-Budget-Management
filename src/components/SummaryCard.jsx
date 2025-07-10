export default function SummaryCard({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-[#f5f7fa] rounded-xl px-8 py-6 shadow text-center min-w-[180px]">
      <span className="text-gray-700 text-lg mb-1">{label}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
  );
} 