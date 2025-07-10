import cihLogo from '../assets/Cih.png';

export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-4 group">
      <img src={cihLogo} alt="CIH Logo" className="w-14 h-14 object-contain transition-transform group-hover:scale-105" />
      <span className="text-white text-3xl font-semibold transition-colors group-hover:text-blue-300">CIH budget manager</span>
    </a>
  );
} 