export default function FormInput({ label, value, onChange, type = 'text', placeholder = '', required = false, error }) {
  return (
    <div className="mb-3">
      <label className="block text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${error ? 'border-red-500' : ''}`}
      />
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
} 