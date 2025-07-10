export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Fermer"
        >
          <span className="material-icons text-2xl">close</span>
        </button>
        {title && <h2 className="text-xl font-bold mb-6">{title}</h2>}
        {children}
      </div>
    </div>
  );
} 