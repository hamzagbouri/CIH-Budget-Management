export default function InputField({ label, type, placeholder, icon, borderColor, value, onChange, rightIcon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-white text-sm mb-1 flex items-center gap-1">
        {icon}
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={label}
          className={`w-full px-4 py-2 rounded-md bg-transparent border ${borderColor} text-white focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10`}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
} 