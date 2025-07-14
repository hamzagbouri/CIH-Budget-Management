export default function FormInput({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  required = false, 
  error, 
  multiline = false,
  name,
  min,
  max,
  step
}) {
  return (
    <div className="mb-3">
      <label className="block text-gray-700 font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      )}
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
} 