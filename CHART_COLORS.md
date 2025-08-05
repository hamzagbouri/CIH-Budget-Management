# Chart.js Colors Used in CIH Budget Management

## Overview
This document contains all the colors used in Chart.js components throughout the CIH Budget Management application.

---

## 🎨 Color Palette

### Primary Colors
- **Blue**: `#2563eb`, `#60a5fa`, `#93c5fd`, `#3B82F6`
- **Green**: `#10B981`, `rgba(34, 197, 94, 0.8)`
- **Red**: `#EF4444`, `rgba(239, 68, 68, 0.8)`
- **Orange**: `#f97316`, `#F59E0B`, `rgba(245, 158, 11, 0.8)`
- **Purple**: `#8B5CF6`
- **Gray**: `#6B7280`

---

## 📊 Chart-Specific Colors

### CategoryPieChart.jsx
```javascript
backgroundColor: ['#2563eb', '#60a5fa', '#93c5fd']
```
- **Blue gradient**: Primary blue to light blue shades

### AdminDashboard.jsx & AdminStats.jsx - Budget Usage Pie Chart
```javascript
backgroundColor: [
  'rgba(239, 68, 68, 0.8)',  // Red - Budget Utilisé
  'rgba(34, 197, 94, 0.8)'   // Green - Budget Restant
]
borderColor: [
  'rgba(239, 68, 68, 1)',    // Red border
  'rgba(34, 197, 94, 1)'     // Green border
]
```

### AdminDashboard.jsx & AdminStats.jsx - Expense Status Pie Chart
```javascript
backgroundColor: [
  'rgba(34, 197, 94, 0.8)',  // Green - Validées
  'rgba(245, 158, 11, 0.8)', // Orange - En Attente
  'rgba(239, 68, 68, 0.8)'   // Red - Refusées
]
borderColor: [
  'rgba(34, 197, 94, 1)',    // Green border
  'rgba(245, 158, 11, 1)',   // Orange border
  'rgba(239, 68, 68, 1)'     // Red border
]
```

### Depenses.jsx - Type Chart
```javascript
backgroundColor: [
  '#3B82F6',  // Blue
  '#10B981',  // Green
  '#F59E0B',  // Orange
  '#8B5CF6',  // Purple
  '#6B7280'   // Gray
]
```

### Depenses.jsx - Status Chart
```javascript
backgroundColor: [
  '#F59E0B',  // Orange
  '#10B981',  // Green
  '#EF4444',  // Red
  '#3B82F6',  // Blue
  '#6B7280'   // Gray
]
```

### MonthlyBarChart.jsx
```javascript
backgroundColor: '#f97316'  // Orange
```

### Depenses.jsx - Monthly Bar Chart
```javascript
backgroundColor: '#3B82F6'  // Blue
borderColor: '#2563EB'     // Darker Blue
```

---

## 🎯 Chart Options Colors

### Text & Labels
- **Text color**: `#222`
- **Legend labels**: `#222`
- **Font size**: `12px` to `14px`

### Grid & Background
- **Grid color**: `#e5e7eb`
- **Background**: `#e9eff2` (page background)

---

## 📋 Color Usage Guidelines

### Semantic Color Mapping
- **🟢 Green**: Success, validated, positive values
- **🔴 Red**: Errors, rejected, negative values  
- **🟠 Orange**: Warnings, pending, neutral states
- **🔵 Blue**: Primary data, neutral information
- **🟣 Purple**: Secondary categories
- **⚫ Gray**: Tertiary categories, disabled states

### Opacity Usage
- **0.8 opacity**: For filled areas (backgroundColor)
- **1.0 opacity**: For borders and outlines (borderColor)

---

## 📁 Files Using Chart.js Colors

1. `src/components/CategoryPieChart.jsx`
2. `src/components/MonthlyBarChart.jsx`
3. `src/pages/AdminDashboard.jsx`
4. `src/pages/AdminStats.jsx`
5. `src/pages/Depenses.jsx`

---

## 🔐 Auth Page JSX

### src/pages/Auth.jsx
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'ADMIN') {
          navigate('/admin/stats');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#0B1926] bg-gradient-to-br from-[#0B1926] via-[#0B1926] to-[#2d1a1a]">
      {/* Left Side */}
      <div className="flex flex-col h-full flex-1 p-12 min-w-0">
      <Logo />
        <div className="flex flex-col flex-1 justify-center mt-[-150px] items-start">
         
          <h1 className="text-white text-4xl font-semibold mt-16 mb-8 leading-tight">
            La rigueur budgétaire,<br />au service des fonctions CIH.
          </h1>
        </div>
        <p className="text-gray-400 text-sm">Usage réservé aux fonctionnaires CIH</p>
      </div>
      {/* Right Side */}
      <div className="flex items-center justify-center flex-1 min-w-0">
        <div
          className="w-[400px] rounded-2xl p-10 shadow-2xl border border-white/20 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(10,20,40,0.7) 60%, rgba(0,174,239,0.3) 80%, rgba(241,90,41,0.3) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          <h2 className="text-white text-2xl font-semibold mb-8">Authentification</h2>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-white text-base mb-1 flex items-center gap-1">
                <span className="material-icons text-white mr-2">mail</span>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-md bg-transparent border ${error ? 'border-red-500' : 'border-blue-400'} text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-white text-base mb-1 flex items-center gap-1">
                <span className="material-icons text-white mr-2">lock</span>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-md bg-transparent border ${error ? 'border-red-500' : 'border-blue-400'} text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>
            <a href="#" className="text-sm text-blue-200 hover:underline self-start">Mot de passe oublié ?</a>
            {error && <div className="text-red-400 text-sm -mt-4 text-center">{error}</div>}
            <div className="relative flex items-center justify-center mt-2 group">
              {/* Sparkles (only on hover) */}
              <span className="absolute -left-4 -top-2 w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -left-3 top-5 w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -right-4 -top-2 w-1.5 h-1.5 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -right-3 top-5 w-1 h-1 rounded-full bg-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <button
                type="submit"
                disabled={isLoading}
                className="relative px-8 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-blue-700 to-indigo-500 shadow-md border border-transparent transition-all duration-300 text-xl focus:outline-none focus:ring-2 focus:ring-orange-400 group-hover:bg-transparent group-hover:border-orange-500 group-hover:shadow-none group-hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### Auth Page Color Scheme
- **Background**: `#0B1926` (dark blue) with gradient to `#2d1a1a`
- **Card Background**: Linear gradient with blue and orange tints
- **Text**: White (`text-white`)
- **Input Borders**: Blue (`border-blue-400`) or Red (`border-red-500` for errors)
- **Button**: Blue gradient (`from-blue-700 to-indigo-500`)
- **Accent Colors**: Blue, Pink, Orange for hover effects

---

*Generated from CIH Budget Management project* 