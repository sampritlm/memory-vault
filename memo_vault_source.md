# MemoVault Project Source Code

This document contains all the frontend and backend source code for the MemoVault application.

## `src/App.css`

```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s;
  margin-bottom: 24px;

  &:hover {
    border-color: var(--accent-border);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.hero {
  position: relative;

  .base,
  .framework,
  .vite {
    inset-inline: 0;
    margin: 0 auto;
  }

  .base {
    width: 170px;
    position: relative;
    z-index: 0;
  }

  .framework,
  .vite {
    position: absolute;
  }

  .framework {
    z-index: 1;
    top: 34px;
    height: 28px;
    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)
      scale(1.4);
  }

  .vite {
    z-index: 0;
    top: 107px;
    height: 26px;
    width: auto;
    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)
      scale(0.8);
  }
}

#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  place-content: center;
  place-items: center;
  flex-grow: 1;

  @media (max-width: 1024px) {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}

#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;

  & > div {
    flex: 1 1 0;
    padding: 32px;
    @media (max-width: 1024px) {
      padding: 24px 20px;
    }
  }

  .icon {
    margin-bottom: 16px;
    width: 22px;
    height: 22px;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    text-align: center;
  }
}

#docs {
  border-right: 1px solid var(--border);

  @media (max-width: 1024px) {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;

  .logo {
    height: 18px;
  }

  a {
    color: var(--text-h);
    font-size: 16px;
    border-radius: 6px;
    background: var(--social-bg);
    display: flex;
    padding: 6px 12px;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: var(--shadow);
    }
    .button-icon {
      height: 18px;
      width: 18px;
    }
  }

  @media (max-width: 1024px) {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;

    li {
      flex: 1 1 calc(50% - 8px);
    }

    a {
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
    }
  }
}

#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  @media (max-width: 1024px) {
    height: 48px;
  }
}

.ticks {
  position: relative;
  width: 100%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: -4.5px;
    border: 5px solid transparent;
  }

  &::before {
    left: 0;
    border-left-color: var(--border);
  }
  &::after {
    right: 0;
    border-right-color: var(--border);
  }
}

```

## `src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/login'
import Signup from './pages/signup'
import Dashboard from './pages/Dashboard'
import Compose from './pages/compose'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <div className="loader" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--accent-border)',
              backdropFilter: 'blur(12px)',
            }
          }} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
```

## `src/components/MemoryCalendar.jsx`

```javascript
import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

export default function MemoryCalendar({ memories, onDateSelect, selectedDate, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Identify dates with memories
  const memoryDates = memories.reduce((acc, memory) => {
    const d = new Date(memory.date);
    const dateStr = format(d, 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(memory);
    return acc;
  }, {});

  return (
    <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#050505', border: '1px solid var(--accent)', boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)' }}>
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex flex-col mb-6 gap-4">
        <h2 className="text-xl font-black tracking-wider flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>
          <Calendar className="w-5 h-5" />
          {format(currentDate, dateFormat).toUpperCase()}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="px-4 py-2 rounded-lg transition-all flex-1 flex justify-center" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-pale)'}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="px-4 py-2 rounded-lg transition-all flex-1 flex justify-center" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-pale)'}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] md:text-xs font-bold tracking-wider py-2" style={{ color: 'var(--text-muted)' }}>
            {day.toUpperCase()}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasMemories = memoryDates[dateStr] && memoryDates[dateStr].length > 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          
          let bgColor = 'transparent';
          let textColor = isCurrentMonth ? 'var(--text-primary)' : 'var(--text-faint)';
          let borderColor = 'transparent';
          
          if (isSelected) {
            bgColor = 'var(--accent)';
            textColor = '#000'; // Dark text on bright accent for contrast regardless of dark/light mode
          } else if (hasMemories) {
            bgColor = 'var(--accent-pale)';
            textColor = 'var(--accent)';
            borderColor = 'var(--accent-border)';
          }

          if (isDayToday && !isSelected) {
            borderColor = 'var(--text-muted)';
            if (!hasMemories && !isCurrentMonth) borderColor = 'var(--text-faint)';
          }
          
          return (
            <button 
              key={day.toString()} 
              onClick={() => onDateSelect(day)}
              className="relative flex flex-col items-center justify-center p-1 md:p-2 h-10 md:h-12 rounded-lg transition-all"
              style={{
                background: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                opacity: isCurrentMonth ? 1 : 0.4
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.border = '1px solid var(--accent)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.border = `1px solid ${borderColor}`;
                }
              }}
              title={hasMemories ? `${memoryDates[dateStr].length} memory(s)` : ''}
            >
              <span className="text-xs md:text-sm font-bold z-10">{format(day, 'd')}</span>
              {hasMemories && !isSelected && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }}></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

```

## `src/components/ThemeToggle.jsx`

```javascript
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300"
            style={{
                background: isDark ? 'rgba(196,168,112,0.12)' : 'rgba(184,150,90,0.1)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,150,90,0.2)'; e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(196,168,112,0.12)' : 'rgba(184,150,90,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
        >
            {isDark
                ? <Sun className="w-4.5 h-4.5" style={{ color: 'var(--accent)', width: 18, height: 18 }} />
                : <Moon className="w-4.5 h-4.5" style={{ color: 'var(--accent)', width: 18, height: 18 }} />
            }
        </button>
    )
}

```

## `src/context/AuthContext.jsx`

```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then(res => setUser(res.data))
        .catch((err) => {
          if (err.response && [400, 401, 404].includes(err.response.status)) {
            localStorage.removeItem('token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    const res = await authAPI.login({ identifier, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const signup = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

## `src/context/ThemeContext.jsx`

```javascript
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

    useEffect(() => {
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}

```

## `src/index.css`

```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

@utility line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@utility line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@utility line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ──────────────────────────────────────
   LIGHT THEME (default)
────────────────────────────────────── */
:root {
  --page-bg: #f5f0e8;
  --page-bg-alt: #ede8df;
  --card-bg: rgba(255, 255, 255, 0.75);
  --nav-bg: rgba(253, 252, 248, 0.92);
  --input-bg: rgba(255, 255, 255, 0.85);
  --input-focus-bg: #ffffff;
  --stat-bg: rgba(255, 255, 255, 0.75);
  --empty-bg: rgba(255, 255, 255, 0.6);
  --modal-overlay: rgba(42, 31, 14, 0.5);

  --accent: #b8965a;
  --accent-dim: #9a7a42;
  --accent-pale: rgba(184, 150, 90, 0.1);
  --accent-border: rgba(184, 150, 90, 0.28);
  --accent-glow: rgba(184, 150, 90, 0.2);

  --text-primary: #2a1f0e;
  --text-secondary: rgba(80, 55, 20, 0.65);
  --text-muted: rgba(80, 55, 20, 0.48);
  --text-faint: rgba(80, 55, 20, 0.33);
  --border-color: rgba(184, 150, 90, 0.22);

  --grid-color: rgba(184, 150, 90, 0.04);
}

/* ──────────────────────────────────────
   DARK THEME
────────────────────────────────────── */
.dark {
  --page-bg: #1a1510;
  --page-bg-alt: #231c14;
  --card-bg: rgba(38, 28, 16, 0.78);
  --nav-bg: rgba(15, 11, 6, 0.93);
  --input-bg: rgba(28, 20, 10, 0.85);
  --input-focus-bg: rgba(35, 26, 13, 0.95);
  --stat-bg: rgba(30, 22, 12, 0.78);
  --empty-bg: rgba(25, 18, 10, 0.6);
  --modal-overlay: rgba(8, 5, 2, 0.72);

  --accent: #aa884a;
  --accent-dim: #8b6d36;
  --accent-pale: rgba(170, 136, 74, 0.12);
  --accent-border: rgba(170, 136, 74, 0.25);
  --accent-glow: rgba(170, 136, 74, 0.18);

  --text-primary: #d4c5ab;
  --text-secondary: rgba(212, 197, 171, 0.68);
  --text-muted: rgba(212, 197, 171, 0.46);
  --text-faint: rgba(212, 197, 171, 0.32);
  --border-color: rgba(170, 136, 74, 0.2);

  --grid-color: rgba(170, 136, 74, 0.03);
}

/* ─── Base ─── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', 'Rajdhani', sans-serif;
  background-color: var(--page-bg);
  color: var(--text-primary);
  transition: background-color 0.4s ease, color 0.4s ease;
  min-height: 100vh;
  background-image:
    linear-gradient(var(--grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ─── Keyframes ─── */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glowFloat {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* ─── Animation classes ─── */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.35s ease-out;
}

.animate-float {
  animation: glowFloat 4s ease-in-out infinite;
}

/* ─── Glassmorphic card ─── */
.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--accent-border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: all 0.35s ease;
}

.glass-card:hover {
  border-color: var(--accent);
  box-shadow: 0 8px 40px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

/* ─── Text helpers ─── */
.neon-text {
  color: var(--accent);
}

.text-gradient {
  background: linear-gradient(135deg, var(--accent), var(--accent-dim));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ─── Primary button ─── */
.btn-primary {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%);
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #d4b87a 0%, var(--accent) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-primary:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 20px var(--accent-glow), 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:hover span,
.btn-primary:hover svg {
  position: relative;
  z-index: 1;
}

/* ─── Input fields ─── */
.razer-input {
  background: var(--input-bg) !important;
  border: 1px solid var(--accent-border) !important;
  color: var(--text-primary) !important;
  transition: all 0.3s ease;
}

.razer-input::placeholder {
  color: var(--text-faint) !important;
}

.razer-input:focus {
  outline: none !important;
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px var(--accent-pale), 0 2px 8px var(--accent-glow) !important;
  background: var(--input-focus-bg) !important;
}

/* ─── Card hover ─── */
.card-hover {
  transition: all 0.35s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px var(--accent-glow);
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--page-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--accent-dim);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

/* ─── Loader ─── */
.loader {
  width: 48px;
  height: 48px;
  border: 3px solid var(--accent-pale);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ─── Nav ─── */
.razer-nav {
  background: var(--nav-bg) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color) !important;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  transition: background 0.4s ease, border-color 0.4s ease;
}

/* ─── Stat card ─── */
.stat-card {
  background: var(--stat-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--accent-border);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.35s ease;
}

.stat-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 24px var(--accent-glow);
}

/* ─── Icon bg ─── */
.icon-bg {
  background: var(--accent-pale);
  border: 1px solid var(--accent-border);
}

/* ─── Theme transition ─── */
*,
*::before,
*::after {
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}

/* override for transforms so they don't get the slow transition */
.glass-card,
.card-hover,
.btn-primary {
  transition: all 0.35s ease;
}

/* ─── Quill Editor Theme Customization ─── */
.quill-custom .ql-toolbar {
  background: var(--nav-bg) !important;
  border-color: var(--accent-border) !important;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  padding: 12px !important;
}

.quill-custom .ql-container {
  background: var(--input-bg) !important;
  border-color: var(--accent-border) !important;
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
  font-family: inherit !important;
  font-size: 1rem !important;
  color: var(--text-primary) !important;
}

.quill-custom .ql-editor {
  min-height: 250px;
}

.quill-custom .ql-editor.ql-blank::before {
  color: var(--text-faint) !important;
  font-style: normal !important;
}

/* Toolbar Icon Colors */
.quill-custom .ql-stroke {
  stroke: var(--text-secondary) !important;
}

.quill-custom .ql-fill {
  fill: var(--text-secondary) !important;
}

.quill-custom .ql-picker-label,
.quill-custom .ql-picker-item {
  color: var(--text-secondary) !important;
}

/* Dropdown background */
.quill-custom .ql-picker-options {
  background: var(--card-bg) !important;
  border-color: var(--accent-border) !important;
  backdrop-filter: blur(16px);
}

/* Hover/Active states */
.quill-custom button:hover .ql-stroke,
.quill-custom button:focus .ql-stroke,
.quill-custom button.ql-active .ql-stroke,
.quill-custom .ql-picker-label:hover .ql-stroke,
.quill-custom .ql-picker-label.ql-active .ql-stroke {
  stroke: var(--accent) !important;
}

.quill-custom button:hover .ql-fill,
.quill-custom button:focus .ql-fill,
.quill-custom button.ql-active .ql-fill,
.quill-custom .ql-picker-label:hover .ql-fill,
.quill-custom .ql-picker-label.ql-active .ql-fill {
  fill: var(--accent) !important;
}

.quill-custom .ql-picker-item:hover,
.quill-custom .ql-picker-item.ql-selected,
.quill-custom .ql-picker-label:hover,
.quill-custom .ql-picker-label.ql-active {
  color: var(--accent) !important;
}
```

## `src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## `src/pages/compose.jsx`

```javascript
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X, Image, Archive, Mic, Video } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import ThemeToggle from '../components/ThemeToggle'
import { memoriesAPI } from '../services/api'

export default function Compose() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '', content: '', category: 'Personal',
    date: new Date().toISOString().split('T')[0],
    unlockDate: '',
    isPrivate: false, password: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [audioDragActive, setAudioDragActive] = useState(false)
  const [videoDragActive, setVideoDragActive] = useState(false)
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const audioInputRef = useRef(null)

  const [isVideoRec, setIsVideoRec] = useState(false)
  const [videoRecDuration, setVideoRecDuration] = useState(0)
  const videoMediaRecorderRef = useRef(null)
  const videoChunksRef = useRef([])
  const videoTimerRef = useRef(null)
  const liveVideoRef = useRef(null)
  const videoInputRef = useRef(null)

  const categories = ['Travel', 'Friends', 'Work', 'Personal']

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Image size should be less than 10MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover') }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { toast.error('Image size should be less than 10MB'); return }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else toast.error('Please upload an image file')
  }

  const handleAudioUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { toast.error('Audio size should be less than 50MB'); return }
    setAudioFile(file)
    setAudioPreview(URL.createObjectURL(file))
  }

  const handleAudioDrag = (e) => { e.preventDefault(); e.stopPropagation(); setAudioDragActive(e.type === 'dragenter' || e.type === 'dragover') }

  const handleAudioDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setAudioDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      if (file.size > 50 * 1024 * 1024) { toast.error('Audio size should be less than 50MB'); return }
      setAudioFile(file)
      setAudioPreview(URL.createObjectURL(file))
    } else toast.error('Please upload an audio file')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioPreview(audioUrl)
        
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
        setAudioFile(file)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      toast.error('Could not access microphone')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAudioUploadClick = () => {
    audioInputRef.current?.click()
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 200 * 1024 * 1024) { toast.error('Video size should be less than 200MB'); return }
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      videoMediaRecorderRef.current = mediaRecorder
      videoChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) videoChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' })
        const videoUrl = URL.createObjectURL(videoBlob)
        setVideoPreview(videoUrl)
        
        const file = new File([videoBlob], 'video_recording.webm', { type: 'video/webm' })
        setVideoFile(file)
        
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsVideoRec(true)
      setVideoRecDuration(0)
      
      videoTimerRef.current = setInterval(() => {
        setVideoRecDuration(prev => prev + 1)
      }, 1000)

    } catch (err) {
      toast.error('Could not access camera/microphone')
      console.error(err)
    }
  }

  const stopVideoRecording = () => {
    if (videoMediaRecorderRef.current && isVideoRec) {
      videoMediaRecorderRef.current.stop()
      setIsVideoRec(false)
      clearInterval(videoTimerRef.current)
    }
  }

  const handleVideoUploadClick = () => {
    videoInputRef.current?.click()
  }

  const handleVideoDrag = (e) => { e.preventDefault(); e.stopPropagation(); setVideoDragActive(e.type === 'dragenter' || e.type === 'dragover') }

  const handleVideoDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setVideoDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      if (file.size > 200 * 1024 * 1024) { toast.error('Video size should be less than 200MB'); return }
      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    } else toast.error('Please upload a video file')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) { toast.error('Title is required'); return }
    if (!formData.content.trim()) { toast.error('Content is required'); return }
    if (formData.isPrivate && !formData.password) { toast.error('Password required for private memories'); return }
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('content', formData.content)
      payload.append('category', formData.category)
      payload.append('date', formData.date)
      if (formData.unlockDate) payload.append('unlockDate', formData.unlockDate)
      payload.append('isPrivate', formData.isPrivate)
      if (formData.password) payload.append('password', formData.password)
      
      if (imageFile) payload.append('image', imageFile)
      if (audioFile) payload.append('audio', audioFile)
      if (videoFile) payload.append('video', videoFile)

      await memoriesAPI.create(payload)
      toast.success('Memory saved!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save memory')
    } finally {
      setLoading(false)
    }
  }

  const inp = "razer-input w-full px-4 py-3 rounded-lg text-sm"

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      {/* Nav unchanged */}
      <nav className="razer-nav sticky top-0" style={{ zIndex: 50 }}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="icon-bg p-1.5 rounded-lg"><Archive className="w-5 h-5" style={{ color: 'var(--accent)' }} /></div>
            <span className="text-xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>MEMOVAULT</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] mb-6 transition-all" style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </Link>

        <div className="glass-card animate-scaleIn rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="icon-bg p-2 rounded-lg"><Save className="w-5 h-5" style={{ color: 'var(--accent)' }} /></div>
            <h1 className="text-2xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>NEW MEMORY</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>TITLE *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Enter a meaningful title" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>MEMORY / DIARY ENTRY *</label>
              <div className="quill-custom rounded-xl transition-all">
                <ReactQuill theme="snow" value={formData.content} onChange={val => setFormData({ ...formData, content: val })} placeholder="Write your thoughts, memories, or anything you want to preserve..." />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>CATEGORY</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={inp} style={{ cursor: 'pointer' }}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>DATE</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--accent)' }}>🔒 UNLOCK DATE (OPTIONAL)</label>
                <input type="date" value={formData.unlockDate} onChange={e => setFormData({ ...formData, unlockDate: e.target.value })} className={inp} style={{ borderColor: 'var(--accent)' }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>IMAGE (OPTIONAL)</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-contain rounded-xl" style={{ border: '1px solid var(--accent-border)' }} />
                  <button type="button" onClick={() => setImagePreview(null)} className="absolute top-2 right-2 p-1.5 rounded-full" style={{ background: 'rgba(180,50,50,0.85)' }}><X className="w-4 h-4 text-white" /></button>
                </div>
              ) : (
                <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  className="relative border-2 border-dashed rounded-xl p-10 text-center transition-all"
                  style={{ borderColor: dragActive ? 'var(--accent)' : 'var(--accent-border)', background: dragActive ? 'var(--accent-pale)' : 'transparent', boxShadow: dragActive ? '0 0 20px var(--accent-glow)' : 'none' }}
                >
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="space-y-2 pointer-events-none">
                    <div className="flex justify-center">
                      {dragActive ? <Upload className="w-12 h-12 animate-bounce" style={{ color: 'var(--accent)' }} /> : <Image className="w-12 h-12" style={{ color: 'var(--text-faint)' }} />}
                    </div>
                    <p className="text-sm font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>{dragActive ? 'DROP YOUR IMAGE HERE' : 'DRAG & DROP AN IMAGE OR CLICK TO BROWSE'}</p>
                    <p className="text-xs tracking-wide" style={{ color: 'var(--text-faint)' }}>PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>VOICE NOTE OR MUSIC (OPTIONAL)</label>
              {audioPreview ? (
                <div className="relative p-4 rounded-xl border border-solid flex items-center justify-between" style={{ borderColor: 'var(--accent-border)', background: 'var(--nav-bg)' }}>
                  <audio src={audioPreview} controls className="w-full mr-4" />
                  <button type="button" onClick={() => { setAudioPreview(null); setAudioFile(null) }} className="p-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(180,50,50,0.85)' }}><X className="w-4 h-4 text-white" /></button>
                </div>
              ) : isRecording ? (
                <div className="relative border-2 border-solid rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center" style={{ borderColor: 'var(--accent)', background: 'rgba(255,50,50,0.1)', boxShadow: '0 0 20px rgba(255,50,50,0.2)' }}>
                  <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mb-4"></div>
                  <p className="text-xl font-bold tracking-widest text-red-400 mb-6">{formatDuration(recordingDuration)}</p>
                  <button type="button" onClick={stopRecording} className="px-6 py-2 rounded-full font-bold tracking-wider text-white" style={{ background: 'rgba(200,50,50,0.9)' }}>
                    STOP RECORDING
                  </button>
                </div>
              ) : (
                <div onDragEnter={handleAudioDrag} onDragLeave={handleAudioDrag} onDragOver={handleAudioDrag} onDrop={handleAudioDrop}
                  className="relative border-2 border-dashed rounded-xl p-8 text-center transition-all"
                  style={{ borderColor: audioDragActive ? 'var(--accent)' : 'var(--accent-border)', background: audioDragActive ? 'var(--accent-pale)' : 'transparent', boxShadow: audioDragActive ? '0 0 20px var(--accent-glow)' : 'none' }}
                >
                  <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                       <button type="button" onClick={handleAudioUploadClick} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold tracking-wider transition-all" style={{ background: 'var(--nav-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
                         <Upload className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                         UPLOAD FILE
                       </button>
                       <button type="button" onClick={startRecording} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold tracking-wider transition-all" style={{ background: 'var(--nav-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
                         <Mic className="w-5 h-5 text-red-400" />
                         RECORD VOICE
                       </button>
                    </div>
                    <p className="text-sm font-bold tracking-wider mt-4" style={{ color: 'var(--text-muted)' }}>{audioDragActive ? 'DROP AUDIO HERE' : 'OR DRAG & DROP AUDIO FILE'}</p>
                    <p className="text-xs tracking-wide" style={{ color: 'var(--text-faint)' }}>MP3, WAV, M4A up to 50MB</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>VIDEO (OPTIONAL)</label>
              {videoPreview ? (
                <div className="relative p-4 rounded-xl border border-solid flex items-center justify-center" style={{ borderColor: 'var(--accent-border)', background: 'var(--nav-bg)' }}>
                  <video src={videoPreview} controls className="w-full max-h-64 object-contain rounded-lg" />
                  <button type="button" onClick={() => { setVideoPreview(null); setVideoFile(null) }} className="absolute top-2 right-2 p-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(180,50,50,0.85)' }}><X className="w-4 h-4 text-white" /></button>
                </div>
              ) : isVideoRec ? (
                <div className="relative border-2 border-solid rounded-xl overflow-hidden flex flex-col items-center justify-center" style={{ borderColor: 'var(--accent)', background: 'black', boxShadow: '0 0 20px rgba(255,50,50,0.2)' }}>
                  <video ref={liveVideoRef} autoPlay muted className="w-full h-auto max-h-64 object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse mb-4"></div>
                    <p className="text-xl font-bold tracking-widest text-red-400 mb-6 drop-shadow-md">{formatDuration(videoRecDuration)}</p>
                    <button type="button" onClick={stopVideoRecording} className="px-6 py-2 rounded-full font-bold tracking-wider text-white shadow-lg" style={{ background: 'rgba(200,50,50,0.9)' }}>
                      STOP RECORDING
                    </button>
                  </div>
                </div>
              ) : (
                <div onDragEnter={handleVideoDrag} onDragLeave={handleVideoDrag} onDragOver={handleVideoDrag} onDrop={handleVideoDrop}
                  className="relative border-2 border-dashed rounded-xl p-8 text-center transition-all"
                  style={{ borderColor: videoDragActive ? 'var(--accent)' : 'var(--accent-border)', background: videoDragActive ? 'var(--accent-pale)' : 'transparent', boxShadow: videoDragActive ? '0 0 20px var(--accent-glow)' : 'none' }}
                >
                  <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                       <button type="button" onClick={handleVideoUploadClick} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold tracking-wider transition-all" style={{ background: 'var(--nav-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
                         <Upload className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                         UPLOAD VIDEO
                       </button>
                       <button type="button" onClick={startVideoRecording} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold tracking-wider transition-all" style={{ background: 'var(--nav-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }}>
                         <Video className="w-5 h-5 text-red-400" />
                         RECORD VIDEO
                       </button>
                    </div>
                    <p className="text-sm font-bold tracking-wider mt-4" style={{ color: 'var(--text-muted)' }}>{videoDragActive ? 'DROP VIDEO HERE' : 'OR DRAG & DROP VIDEO FILE'}</p>
                    <p className="text-xs tracking-wide" style={{ color: 'var(--text-faint)' }}>MP4, WEBM, MOV up to 200MB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isPrivate} onChange={e => setFormData({ ...formData, isPrivate: e.target.checked, password: e.target.checked ? formData.password : '' })} className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
                <span className="text-sm font-bold tracking-wider" style={{ color: 'var(--accent)' }}>🔒 MARK AS PRIVATE MEMORY</span>
              </label>
              {formData.isPrivate && (
                <div className="mt-4">
                  <input type="password" placeholder="Set an unlock password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={`${inp} mb-1`} />
                  <p className="text-xs tracking-wider" style={{ color: 'var(--text-faint)' }}>You'll need this password to view the memory later</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold tracking-[0.15em] disabled:opacity-40 relative overflow-hidden" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.95rem' }}>
              <Save className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{loading ? 'SAVING...' : 'SAVE MEMORY'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

## `src/pages/Dashboard.jsx`

```javascript
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, Search, Star, Lock, LogOut, Grid, List, Pin, Trash2, Eye, X, Calendar, Folder, ChevronDown, ChevronRight, ArrowLeft, Archive, BookOpen, Download } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'
import html2pdf from 'html2pdf.js'
import ThemeToggle from '../components/ThemeToggle'
import MemoryCalendar from '../components/MemoryCalendar'
import { useAuth } from '../context/AuthContext'
import { memoriesAPI } from '../services/api'

const getMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
  return url;
};

export default function Dashboard() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedDateFilter, setSelectedDateFilter] = useState(null)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memoryToDelete, setMemoryToDelete] = useState(null)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [memoryToUnlock, setMemoryToUnlock] = useState(null)
  const [showPrivateSection, setShowPrivateSection] = useState(true)
  const [showPublicSection, setShowPublicSection] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const categories = ['All', 'Travel', 'Friends', 'Work', 'Personal']

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      const res = await memoriesAPI.getAll()
      // sort: pinned first, then newest
      const sorted = res.data.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.date) - new Date(a.date)
      })
      setMemories(sorted)
    } catch (err) {
      toast.error('Failed to load memories')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleFavorite = async (id) => {
    try {
      const mem = memories.find(m => m._id === id)
      const res = await memoriesAPI.update(id, { isFavorite: !mem.isFavorite })
      setMemories(prev => prev.map(m => m._id === id ? res.data : m))
      toast.success(res.data.isFavorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const togglePin = async (id) => {
    try {
      const mem = memories.find(m => m._id === id)
      const res = await memoriesAPI.update(id, { isPinned: !mem.isPinned })
      setMemories(prev => {
        const updated = prev.map(m => m._id === id ? res.data : m)
        return updated.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.date) - new Date(a.date))
      })
      toast.success(res.data.isPinned ? 'Pinned' : 'Unpinned')
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const deleteMemory = (id) => {
    setMemoryToDelete(id)
    setShowDeleteModal(true)
  }

  const executeDelete = async () => {
    if (!memoryToDelete) return
    try {
      await memoriesAPI.delete(memoryToDelete)
      setMemories(prev => prev.filter(m => m._id !== memoryToDelete))
      toast.success('Memory deleted')
    } catch (err) {
      toast.error('Delete failed')
    } finally {
      setShowDeleteModal(false)
      setMemoryToDelete(null)
    }
  }

  const handleUnlock = (memory) => { setMemoryToUnlock(memory); setUnlockPassword(''); setShowUnlockModal(true) }
  const verifyUnlock = () => {
    if (unlockPassword === memoryToUnlock.password) { setSelectedMemory(memoryToUnlock); setShowModal(true); setShowUnlockModal(false) }
    else toast.error('Incorrect password')
  }
  const viewMemory = (memory) => {
    if (memory.unlockDate && new Date(memory.unlockDate) > new Date()) {
      toast.error(`Time-Locked until ${format(new Date(memory.unlockDate), 'MMM dd, yyyy')}`)
      return
    }
    if (memory.isPrivate) handleUnlock(memory)
    else { setSelectedMemory(memory); setShowModal(true) }
  }

  const filteredMemories = memories
    .filter(m => searchTerm === '' || m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(m => selectedCategory === 'All' || m.category === selectedCategory)
    .filter(m => !showFavoritesOnly || m.isFavorite)
    .filter(m => !selectedDateFilter || isSameDay(new Date(m.date), selectedDateFilter))

  const privateMemories = filteredMemories.filter(m => m.isPrivate)
  const publicMemories = filteredMemories.filter(m => !m.isPrivate)
  const stats = { total: memories.length, private: memories.filter(m => m.isPrivate).length, favorites: memories.filter(m => m.isFavorite).length }

  const today = new Date()
  const flashbacks = memories.filter(m => {
    const mDate = new Date(m.date)
    return mDate.getDate() === today.getDate() && mDate.getMonth() === today.getMonth() && mDate.getFullYear() < today.getFullYear()
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
      <div className="text-center"><div className="loader mx-auto mb-4" /><p className="text-xs tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>LOADING...</p></div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      {/* Nav */}
      <nav className="razer-nav sticky top-0" style={{ zIndex: 50 }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="icon-bg p-1.5 rounded-lg"><Archive className="w-5 h-5" style={{ color: 'var(--accent)' }} /></div>
              <span className="text-xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>MEMOVAULT</span>
            </Link>
            <div className="flex items-center space-x-3">
              <span className="text-xs tracking-wider hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                WELCOME, <span style={{ color: 'var(--accent)' }}>{user?.name?.toUpperCase() || 'USER'}</span>
              </span>
              <ThemeToggle />
              <button onClick={handleLogout} className="flex items-center space-x-1.5 text-xs font-bold tracking-wider px-3 py-2 rounded-lg transition-all" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--accent-pale)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent' }}
              >
                <LogOut className="w-4 h-4" /><span>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Flashbacks */}
        {flashbacks.length > 0 && (
          <div className="mb-8 p-6 rounded-xl relative overflow-hidden" style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent)' }}>
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Star className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-black tracking-widest mb-2" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>⏳ ON THIS DAY</h2>
            <p className="text-sm tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>You have {flashbacks.length} memor{flashbacks.length === 1 ? 'y' : 'ies'} from this exact day in previous years!</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {flashbacks.map(m => (
                <div key={m._id} className="min-w-[300px] max-w-[300px] flex-shrink-0">
                  <MemoryCard memory={m} onView={viewMemory} onFavorite={toggleFavorite} onPin={togglePin} onDelete={deleteMemory} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[{ label: 'TOTAL MEMORIES', value: stats.total }, { label: 'PRIVATE MEMORIES', value: stats.private }, { label: 'FAVORITES', value: stats.favorites }].map(({ label, value }) => (
            <div key={label} className="stat-card rounded-xl p-6">
              <p className="text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-4xl font-black" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <Link to="/compose" className="btn-primary px-5 py-3 rounded-xl flex items-center space-x-2 font-bold tracking-wider text-sm relative overflow-hidden" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            <PlusCircle className="w-5 h-5 relative z-10" /><span className="relative z-10">NEW MEMORY</span>
          </Link>
          <div className="flex items-center space-x-1 p-1 rounded-xl" style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent-border)' }}>
            {[{ mode: 'grid', Icon: Grid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} className="p-2 rounded-lg transition-all" style={{ background: viewMode === mode ? 'var(--accent-border)' : 'transparent', color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)' }}>
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="SEARCH MEMORIES..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="razer-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm tracking-wider" />
          </div>
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="razer-input px-4 py-2.5 rounded-xl text-sm tracking-wider" style={{ cursor: 'pointer' }}>
            {categories.map(c => <option key={c} style={{ background: 'var(--page-bg)' }}>{c}</option>)}
          </select>
          <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className="px-4 py-2.5 rounded-xl flex items-center space-x-2 font-bold tracking-wider text-sm transition-all" style={{ background: showFavoritesOnly ? 'var(--accent-pale)' : 'var(--card-bg)', border: `1px solid ${showFavoritesOnly ? 'var(--accent)' : 'var(--accent-border)'}`, color: showFavoritesOnly ? 'var(--accent)' : 'var(--text-muted)' }}>
            <Star className="w-4 h-4" fill={showFavoritesOnly ? 'var(--accent)' : 'none'} /><span>FAVORITES</span>
          </button>
          <button onClick={() => setShowCalendarModal(true)} className="px-4 py-2.5 rounded-xl flex items-center space-x-2 font-bold tracking-wider text-sm transition-all" style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-border)', color: 'var(--text-secondary)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-pale)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--card-bg)' }}>
            <Calendar className="w-4 h-4" /><span>CALENDAR</span>
          </button>
        </div>

        {selectedDateFilter && (
          <div className="mb-6 flex justify-between items-center bg-opacity-10 p-4 rounded-xl" style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent-border)' }}>
             <span className="text-sm tracking-wider" style={{ color: 'var(--text-secondary)' }}>SHOWING MEMORIES FOR: <strong style={{ color: 'var(--accent)' }}>{format(selectedDateFilter, 'MMMM do, yyyy').toUpperCase()}</strong></span>
             <button onClick={() => setSelectedDateFilter(null)} className="text-xs font-bold tracking-wider transition hover:scale-105" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>CLEAR DATE FILTER ✕</button>
          </div>
        )}

        {filteredMemories.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--empty-bg)', border: '1px solid var(--border-color)' }}>
            <Archive className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--text-faint)' }} />
            <p className="text-lg font-bold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>NO MEMORIES FOUND</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-faint)' }}>Create your first memory to get started</p>
            <Link to="/compose" className="btn-primary inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold tracking-wider text-sm relative overflow-hidden">
              <PlusCircle className="w-5 h-5 relative z-10" /><span className="relative z-10">CREATE MEMORY</span>
            </Link>
          </div>
        ) : (
          <>
            {privateMemories.length > 0 && (
              <div className="mb-8">
                <button onClick={() => setShowPrivateSection(!showPrivateSection)} className="flex items-center space-x-2 text-sm font-bold tracking-[0.15em] mb-4 transition-all" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  {showPrivateSection ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <Lock className="w-4 h-4" /><span>PRIVATE MEMORIES</span>
                  <span style={{ color: 'var(--text-faint)' }}>({privateMemories.length})</span>
                </button>
                {showPrivateSection && (
                  viewMode === 'grid'
                    ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{privateMemories.map(m => <MemoryCard key={m._id} memory={m} onView={viewMemory} onFavorite={toggleFavorite} onPin={togglePin} onDelete={deleteMemory} />)}</div>
                    : <div className="space-y-3">{privateMemories.map(m => <MemoryCard key={m._id} memory={m} viewMode="list" onView={viewMemory} onFavorite={toggleFavorite} onPin={togglePin} onDelete={deleteMemory} />)}</div>
                )}
              </div>
            )}
            {publicMemories.length > 0 && (
              <div>
                <button onClick={() => setShowPublicSection(!showPublicSection)} className="flex items-center space-x-2 text-sm font-bold tracking-[0.15em] mb-4 transition-all" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  {showPublicSection ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  <BookOpen className="w-4 h-4" /><span>PUBLIC MEMORIES</span>
                  <span style={{ color: 'var(--text-faint)' }}>({publicMemories.length})</span>
                </button>
                {showPublicSection && (
                  viewMode === 'grid'
                    ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{publicMemories.map(m => <MemoryCard key={m._id} memory={m} onView={viewMemory} onFavorite={toggleFavorite} onPin={togglePin} onDelete={deleteMemory} />)}</div>
                    : <div className="space-y-3">{publicMemories.map(m => <MemoryCard key={m._id} memory={m} viewMode="list" onView={viewMemory} onFavorite={toggleFavorite} onPin={togglePin} onDelete={deleteMemory} />)}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Memory view modal (unchanged except for close handler) */}
      {showModal && selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(10px)' }} onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <button onClick={() => setShowModal(false)} className="flex items-center space-x-2 text-sm font-bold tracking-wider transition-all" style={{ color: 'var(--text-secondary)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <ArrowLeft className="w-5 h-5" /><span>BACK</span>
              </button>
              <div className="flex items-center space-x-3">
                <button onClick={() => {
                  const element = document.getElementById('memory-export-content')
                  const opt = { margin: 0.5, filename: `${selectedMemory.title}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } }
                  html2pdf().set(opt).from(element).save()
                }} className="flex items-center space-x-2 text-xs font-bold tracking-wider px-3 py-1.5 rounded-lg transition-all" style={{ background: 'var(--accent)', color: '#000' }}>
                  <Download className="w-4 h-4" /><span>EXPORT PDF</span>
                </button>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div id="memory-export-content" className="flex-1 overflow-y-auto p-6 bg-white dark:bg-transparent" style={{ color: 'var(--text-secondary)' }}>
              <h2 className="text-3xl font-black mb-4 tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>{selectedMemory.mood} {selectedMemory.title}</h2>
              <div className="flex items-center space-x-4 mb-6 text-xs tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(selectedMemory.date), 'MMMM dd, yyyy')}</span>
                <span className="flex items-center gap-1"><Folder className="w-3.5 h-3.5" />{selectedMemory.category}</span>
                {selectedMemory.isPrivate && <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" />PRIVATE</span>}
              </div>
              {selectedMemory.image && (
                <div className="mb-6 flex justify-center rounded-xl p-4" style={{ background: 'var(--accent-pale)' }}>
                  <img src={getMediaUrl(selectedMemory.image)} alt={selectedMemory.title} className="max-w-full max-h-[50vh] object-contain rounded-lg" />
                </div>
              )}
              {selectedMemory.audio && (
                <div className="mb-6 flex justify-center rounded-xl p-4" style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent-border)' }}>
                  <audio src={getMediaUrl(selectedMemory.audio)} controls className="w-full" />
                </div>
              )}
              {selectedMemory.video && (
                <div className="mb-6 flex justify-center rounded-xl p-4" style={{ background: 'var(--accent-pale)' }}>
                  <video src={getMediaUrl(selectedMemory.video)} controls className="max-w-full max-h-[60vh] object-contain rounded-lg" />
                </div>
              )}
              <div className="prose prose-sm md:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: selectedMemory.content }} />
            </div>
          </div>
        </div>
      )}

      {/* Unlock modal unchanged */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(10px)' }} onClick={() => setShowUnlockModal(false)}>
          <div className="glass-card rounded-2xl p-6 w-96 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>🔐 UNLOCK MEMORY</h3>
            <p className="text-xs tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Enter password to view this private memory</p>
            <input type="password" placeholder="Enter password" value={unlockPassword} onChange={e => setUnlockPassword(e.target.value)} className="razer-input w-full px-4 py-3 rounded-xl text-sm mb-4" onKeyDown={e => e.key === 'Enter' && verifyUnlock()} />
            <div className="flex space-x-3">
              <button onClick={verifyUnlock} className="btn-primary flex-1 py-2.5 rounded-xl font-bold tracking-wider text-sm relative overflow-hidden"><span className="relative z-10">UNLOCK</span></button>
              <button onClick={() => setShowUnlockModal(false)} className="flex-1 py-2.5 rounded-xl font-bold tracking-wider text-sm transition-all" style={{ border: '1px solid var(--accent-border)', color: 'var(--text-muted)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal unchanged */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} onClick={() => setShowCalendarModal(false)}>
          <div className="w-full max-w-sm animate-scaleIn" onClick={e => e.stopPropagation()}>
            <MemoryCalendar 
              memories={memories} 
              selectedDate={selectedDateFilter} 
              onDateSelect={(date) => {
                if (selectedDateFilter && isSameDay(selectedDateFilter, date)) {
                  setSelectedDateFilter(null)
                } else {
                  setSelectedDateFilter(date)
                }
                setShowCalendarModal(false)
              }} 
              onClose={() => setShowCalendarModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(10px)' }} onClick={() => {setShowDeleteModal(false); setMemoryToDelete(null)}}>
          <div className="glass-card rounded-2xl p-6 w-96 animate-scaleIn text-center" onClick={e => e.stopPropagation()}>
            <Trash2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#c0392b' }} />
            <h3 className="text-lg font-black tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>DELETE MEMORY</h3>
            <p className="text-xs tracking-wider mb-6" style={{ color: 'var(--text-muted)' }}>Are you sure you want to delete this memory permanently? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={executeDelete} className="flex-1 py-2.5 rounded-xl font-bold tracking-wider text-sm transition-all" style={{ background: 'rgba(180,50,50,0.1)', border: '1px solid #c0392b', color: '#c0392b' }} onMouseEnter={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(180,50,50,0.1)'; e.currentTarget.style.color = '#c0392b' }}>
                DELETE
              </button>
              <button onClick={() => {setShowDeleteModal(false); setMemoryToDelete(null)}} className="flex-1 py-2.5 rounded-xl font-bold tracking-wider text-sm transition-all" style={{ border: '1px solid var(--accent-border)', color: 'var(--text-muted)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function MemoryCard({ memory, viewMode = 'grid', onView, onFavorite, onPin, onDelete }) {
  const isTimeLocked = memory.unlockDate && new Date(memory.unlockDate) > new Date()
  if (viewMode === 'list') {
    return (
      <div className="glass-card p-4 rounded-xl flex justify-between items-center transition-all">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold tracking-wide" style={{ color: 'var(--text-primary)', fontFamily: "'Rajdhani', sans-serif" }}>{memory.mood} {memory.title}</h3>
            {memory.isPrivate && <Lock className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
            {isTimeLocked && <span className="text-[10px] px-2 py-0.5 rounded font-bold tracking-wider" style={{ background: 'var(--accent-pale)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>TIME-LOCKED</span>}
            {memory.isFavorite && <Star className="w-3.5 h-3.5" fill="var(--accent)" style={{ color: 'var(--accent)' }} />}
            {memory.isPinned && <Pin className="w-3.5 h-3.5" fill="var(--accent)" style={{ color: 'var(--accent)' }} />}
          </div>
          <p className="text-xs tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{format(new Date(memory.date), 'MMM dd, yyyy')} &nbsp;•&nbsp; {memory.category}</p>
          <p className="line-clamp-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isTimeLocked ? `🔒 Locked until ${format(new Date(memory.unlockDate), 'MMM dd, yyyy')}` : memory.isPrivate ? '🔒 Private memory' : stripHtml(memory.content)}
          </p>
        </div>
        <div className="flex space-x-1 ml-4">
          <IBtn onClick={() => onView(memory)}><Eye className="w-4 h-4" /></IBtn>
          <IBtn onClick={() => onFavorite(memory._id)}><Star className="w-4 h-4" fill={memory.isFavorite ? 'var(--accent)' : 'none'} stroke={memory.isFavorite ? 'var(--accent)' : 'currentColor'} /></IBtn>
          <IBtn onClick={() => onPin(memory._id)}><Pin className="w-4 h-4" fill={memory.isPinned ? 'var(--accent)' : 'none'} stroke={memory.isPinned ? 'var(--accent)' : 'currentColor'} /></IBtn>
          <IBtn danger onClick={() => onDelete(memory._id)}><Trash2 className="w-4 h-4" /></IBtn>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {memory.image && (
        <div className="relative">
          <img src={getMediaUrl(memory.image)} alt={memory.title} className="w-full h-44 object-cover" style={{ filter: isTimeLocked ? 'blur(10px)' : 'none' }} />
          {isTimeLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-black bg-opacity-70 px-4 py-2 rounded-xl text-center border border-white border-opacity-20 backdrop-blur-sm">
                 <Lock className="w-6 h-6 mx-auto mb-1 text-white" />
                 <p className="text-xs font-bold tracking-widest text-white">LOCKED</p>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2 flex-1">
            <h3 className="font-bold tracking-wide truncate" style={{ color: 'var(--text-primary)', fontFamily: "'Rajdhani', sans-serif" }}>{memory.mood} {memory.title}</h3>
            {memory.isPrivate && <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />}
            {memory.isPinned && <Pin className="w-3.5 h-3.5 flex-shrink-0" fill="var(--accent)" style={{ color: 'var(--accent)' }} />}
          </div>
          <button onClick={() => onFavorite(memory._id)} className="flex-shrink-0 transition hover:scale-110">
            <Star className="w-5 h-5" fill={memory.isFavorite ? 'var(--accent)' : 'none'} stroke={memory.isFavorite ? 'var(--accent)' : 'var(--text-faint)'} />
          </button>
        </div>
        <p className="text-xs tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{format(new Date(memory.date), 'MMM dd, yyyy')} &nbsp;•&nbsp; {memory.category}</p>
        <p className="line-clamp-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {isTimeLocked ? `🔒 Time-Locked until ${format(new Date(memory.unlockDate), 'MMM dd, yyyy')}` : memory.isPrivate ? '🔒 Private memory — Click to unlock' : stripHtml(memory.content)}
        </p>
        <div className="flex justify-between items-center">
          <button onClick={() => onView(memory)} className="text-xs font-bold tracking-wider transition-all" style={{ color: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-dim)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}>
            {isTimeLocked ? 'WAIT TO READ ⏳' : 'READ MORE →'}
          </button>
          <div className="flex space-x-1">
            <IBtn onClick={() => onPin(memory._id)}><Pin className="w-4 h-4" fill={memory.isPinned ? 'var(--accent)' : 'none'} stroke={memory.isPinned ? 'var(--accent)' : 'currentColor'} /></IBtn>
            <IBtn danger onClick={() => onDelete(memory._id)}><Trash2 className="w-4 h-4" /></IBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper icon button (unchanged)
function IBtn({ children, onClick, danger }) {
  return (
    <button onClick={onClick} className="p-1.5 rounded-lg transition-all" style={{ color: danger ? 'rgba(180,50,50,0.6)' : 'var(--text-muted)' }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(180,50,50,0.08)' : 'var(--accent-pale)'; e.currentTarget.style.color = danger ? '#c0392b' : 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = danger ? 'rgba(180,50,50,0.6)' : 'var(--text-muted)' }}
    >{children}</button>
  )
}

function stripHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}
```

## `src/pages/Home.jsx`

```javascript
import { Link } from 'react-router-dom'
import { Archive, Clock, Lock, Calendar, Shield, Bell, LayoutDashboard } from 'lucide-react'
import { useEffect, useRef } from 'react'
import ThemeToggle from '../components/ThemeToggle'


export default function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.25 + 0.08,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b8965a'
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184,150,90,${p.alpha})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const features = [
    { icon: <Clock className="w-6 h-6" />, title: 'Future Delivery', description: 'Set a specific date and time for your message to be unlocked.' },
    { icon: <Lock className="w-6 h-6" />, title: 'Secure & Private', description: 'Your memories are sealed and encrypted until the unlock date.' },
    { icon: <Bell className="w-6 h-6" />, title: 'Reminders', description: 'Get notified when your messages are ready to be opened.' },
    { icon: <Calendar className="w-6 h-6" />, title: 'Conditional Unlock', description: 'Set conditions to automatically send messages to your future self.' },
    { icon: <Archive className="w-6 h-6" />, title: 'Digital Time Capsule', description: 'Store notes and memories for your future self or loved ones.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Your Legacy', description: 'Create a digital legacy that lasts for years to come.' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--page-bg)' }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <nav className="razer-nav sticky top-0" style={{ zIndex: 50 }}>
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="icon-bg p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6" style={{ color: 'var(--accent)' }} />
              </div>
              <span className="text-2xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>
                MEMO<span style={{ color: 'var(--text-primary)' }}>VAULT</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link
                to="/login"
                className="text-sm font-semibold tracking-wider px-4 py-2 rounded-lg transition-all duration-300"
                style={{ color: 'var(--accent)', border: '1px solid var(--accent-border)', letterSpacing: '0.08em' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-pale)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--accent-border)' }}
              >
                SIGN IN
              </Link>
              <Link to="/signup" className="btn-primary text-sm font-bold tracking-wider px-5 py-2 rounded-lg relative overflow-hidden" style={{ letterSpacing: '0.08em' }}>
                <span className="relative z-10">GET STARTED</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="container mx-auto px-4 pt-24 pb-12 md:pt-36 md:pb-16 text-center relative">
          <div
            className="inline-block text-xs font-bold tracking-[0.3em] px-4 py-1.5 rounded-full mb-6 animate-fadeIn"
            style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
          >
            DIGITAL TIME CAPSULE
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-fadeIn" style={{ fontFamily: "'Orbitron', sans-serif", animationDelay: '0.05s', lineHeight: 1.1 }}>
            <span style={{ color: 'var(--text-primary)' }}>PRESERVE YOUR</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>MEMORIES</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fadeIn" style={{ color: 'var(--text-secondary)', animationDelay: '0.15s', lineHeight: 1.8 }}>
            Lock away your precious moments and rediscover them in the future.
            Build your digital legacy — sealed until the moment is right.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
            <Link to="/signup" className="btn-primary text-base font-bold tracking-wider px-10 py-4 rounded-xl" style={{ letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif" }}>
              <span className="relative z-10">START YOUR JOURNEY</span>
            </Link>
            <Link
              to="/login"
              className="text-base font-semibold px-10 py-4 rounded-xl transition-all duration-300"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent-border)', letterSpacing: '0.08em', fontFamily: "'Rajdhani', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-pale)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
            >
              SIGN IN
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 rounded-full pointer-events-none" style={{ width: 300, height: 300, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: -1 }} />
        </section>

        {/* Why This Is Needed */}
        <section className="py-8 relative">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-6" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--text-primary)' }}>
              WHY YOU NEED A <span style={{ color: 'var(--accent)' }}>MEMORY VAULT</span>
            </h2>
            <div className="glass-card rounded-2xl p-8 md:p-12 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <p className="text-md md:text-lg mb-6 leading-relaxed text-left md:text-center" style={{ color: 'var(--text-secondary)' }}>
                In today's fast-paced digital world, we document everything but preserve almost nothing. Endless camera rolls and messy note apps bury our most meaningful reflections entirely out of sight.
              </p>
              <p className="text-md md:text-lg leading-relaxed text-left md:text-center" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Memory Vault was built to fix this.</strong> We provide a dedicated, distraction-free environment to deliberately safe-keep your life's precious details. Whether it's a profound thought, an inside joke, or a milestone — lock it away deliberately so it stays exactly where you left it for years to come.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-block text-xs font-bold tracking-[0.3em] px-4 py-1.5 rounded-full" style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
                FEATURES
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <div key={i} className="glass-card card-hover rounded-xl p-6 animate-fadeIn" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="icon-bg w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ color: 'var(--accent)' }}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 tracking-wide" style={{ color: 'var(--text-primary)', fontFamily: "'Rajdhani', sans-serif" }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-12 mt-10" style={{ borderTop: '1px solid var(--border-color)', background: 'var(--nav-bg)' }}>
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-4 hover:opacity-80 transition cursor-pointer">
              <Archive className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span className="text-xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>
                MEMO<span style={{ color: 'var(--text-primary)' }}>VAULT</span>
              </span>
            </div>
            <p className="mb-6 max-w-lg" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              A secure, beautifully constructed environment to preserve your personal history, lock away important moments, and remember the good old days with absolute clarity.
            </p>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              © {new Date().getFullYear()} MEMOVAULT INC. ALL RIGHTS RESERVED.<br/>
              DESIGNED WITH PRECISION AND MODERN AESTHETICS.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
```

## `src/pages/login.jsx`

```javascript
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, X, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(identifier, password)
      if (rememberMe) localStorage.setItem('savedIdentifier', identifier)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--page-bg)' }}>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="fixed pointer-events-none" style={{ top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '10%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="glass-card animate-scaleIn rounded-2xl p-8 w-full max-w-md relative" style={{ zIndex: 1 }}>
        <Link to="/" className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-medium transition-all duration-300 px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-pale)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <X className="w-3.5 h-3.5" /><span>HOME</span>
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 icon-bg">
            <Archive className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-2xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>MEMOVAULT</h1>
          <p className="text-sm mt-1 tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}>SIGN IN</p>
        </div>

        <div className="text-center text-xs mb-6 py-2 px-3 rounded-lg" style={{ background: 'var(--accent-pale)', border: '1px solid var(--accent-border)', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          demo@example.com &nbsp;/&nbsp; demo123
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>EMAIL OR USERNAME</label>
            <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} className="razer-input w-full px-4 py-3 rounded-lg text-sm" placeholder="your@email.com or username" required />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>PASSWORD</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="razer-input w-full px-4 py-3 pr-12 rounded-lg text-sm" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-all" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent)' }} />
              <span className="text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>REMEMBER ME</span>
            </label>
            <span className="text-xs tracking-wider" style={{ color: 'var(--text-faint)' }}>Forgot password?</span>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-bold tracking-[0.15em] disabled:opacity-40 relative overflow-hidden" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.95rem' }}>
            <span className="relative z-10">{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
          </button>
        </form>

        <p className="text-center mt-6 text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>
          NO ACCOUNT?{' '}
          <Link to="/signup" className="font-bold transition-all" style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-dim)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >CREATE ONE</Link>
        </p>
      </div>
    </div>
  )
}
```

## `src/pages/signup.jsx`

```javascript
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, X, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup, user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    if (password.length < 4) { toast.error('Password must be at least 4 characters'); return }
    setLoading(true)
    try {
      await signup(name, email, password)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--page-bg)' }}>
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="fixed pointer-events-none" style={{ top: '15%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed pointer-events-none" style={{ bottom: '15%', left: '5%', width: 300, height: 300, background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="glass-card animate-scaleIn rounded-2xl p-8 w-full max-w-md relative" style={{ zIndex: 1 }}>
        <Link to="/" className="absolute top-4 right-4 flex items-center space-x-1.5 text-xs font-medium transition-all duration-300 px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-pale)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <X className="w-3.5 h-3.5" /><span>HOME</span>
        </Link>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 icon-bg">
            <Archive className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-2xl font-black tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>MEMOVAULT</h1>
          <p className="text-sm mt-1 tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}>CREATE ACCOUNT</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'FULL NAME', type: 'text', val: name, set: setName, ph: 'John Doe' },
            { label: 'EMAIL ADDRESS', type: 'email', val: email, set: setEmail, ph: 'your@email.com' },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label}>
              <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type={type} value={val} onChange={e => set(e.target.value)} className="razer-input w-full px-4 py-3 rounded-lg text-sm" placeholder={ph} required />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>PASSWORD</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="razer-input w-full px-4 py-3 pr-12 rounded-lg text-sm" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-all" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-[0.15em] mb-2" style={{ color: 'var(--text-secondary)' }}>CONFIRM PASSWORD</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="razer-input w-full px-4 py-3 rounded-lg text-sm" placeholder="••••••••" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-bold tracking-[0.15em] disabled:opacity-40 mt-2 relative overflow-hidden" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.95rem' }}>
            <span className="relative z-10">{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</span>
          </button>
        </form>

        <p className="text-center mt-6 text-xs tracking-wider" style={{ color: 'var(--text-muted)' }}>
          ALREADY HAVE AN ACCOUNT?{' '}
          <Link to="/login" className="font-bold" style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-dim)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >SIGN IN</Link>
        </p>
      </div>
    </div>
  )
}
```

## `src/services/api.js`

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/me'),
};

export const memoriesAPI = {
  create: (data) => API.post('/memories', data),
  getAll: () => API.get('/memories'),
  getOne: (id) => API.get(`/memories/${id}`),
  update: (id, data) => API.put(`/memories/${id}`, data),
  delete: (id) => API.delete(`/memories/${id}`),
};
```

## `server/index.js`

```javascript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import memoryRoutes from './routes/memories.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ limit: '250mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## `server/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;   // { userId: '...' }
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};
```

## `server/middleware/upload.js`

```javascript
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'server', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure upload limits and filters
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 250 * 1024 * 1024 // 250MB max file size
  }
});

```

## `server/models/Memory.js`

```javascript
import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Personal' },
  date: { type: Date, default: Date.now },
  image: { type: String, default: null },
  isPrivate: { type: Boolean, default: false },
  password: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  mood: { type: String, default: '😐' },
  audio: { type: String, default: null },
  video: { type: String, default: null },
  unlockDate: { type: Date, default: null }
});

export default mongoose.model('Memory', memorySchema);
```

## `server/models/User.js`

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model('User', userSchema);
```

## `server/routes/auth.js`

```javascript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { name: identifier }] 
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user (protected)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

## `server/routes/memories.js`

```javascript
import express from 'express';
import Sentiment from 'sentiment';
import Memory from '../models/Memory.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
const sentiment = new Sentiment();

// Create memory
router.post('/', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, content, category, date, unlockDate, isPrivate, password, isFavorite, isPinned } = req.body;
    const cleanContent = content ? content.replace(/<[^>]+>/g, '') : '';
    const result = sentiment.analyze(cleanContent);
    let moodEmoji = '😐';
    if (result.score >= 2) moodEmoji = '😄';
    else if (result.score > 0) moodEmoji = '🙂';
    else if (result.score <= -2) moodEmoji = '😢';
    else if (result.score < 0) moodEmoji = '😟';

    const imagePath = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
    const audioPath = req.files && req.files['audio'] ? `/uploads/${req.files['audio'][0].filename}` : null;
    const videoPath = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

    const memory = new Memory({
      userId: req.user.userId,
      title,
      content,
      category,
      date: date || Date.now(),
      unlockDate: unlockDate || null,
      image: imagePath,
      audio: audioPath,
      video: videoPath,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      password: (isPrivate === 'true' || isPrivate === true) ? password : '',
      isFavorite: isFavorite === 'true' || isFavorite === true,
      isPinned: isPinned === 'true' || isPinned === true,
      mood: moodEmoji
    });
    await memory.save();
    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all memories for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.userId })
      .sort({ isPinned: -1, date: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single memory
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: 'Not found' });
    if (memory.userId.toString() !== req.user.userId)
      return res.status(401).json({ message: 'Not authorized' });
    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update memory
router.put('/:id', verifyToken, async (req, res) => {
  try {
    let memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: 'Not found' });
    if (memory.userId.toString() !== req.user.userId)
      return res.status(401).json({ message: 'Not authorized' });

    const { title, content, category, date, image, isPrivate, password, isFavorite, isPinned } = req.body;
    if (title) memory.title = title;
    if (content) memory.content = content;
    if (category) memory.category = category;
    if (date) memory.date = date;
    if (image !== undefined) memory.image = image;
    if (isPrivate !== undefined) memory.isPrivate = isPrivate;
    if (password !== undefined) memory.password = password;
    if (isFavorite !== undefined) memory.isFavorite = isFavorite;
    if (isPinned !== undefined) memory.isPinned = isPinned;

    await memory.save();
    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete memory
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: 'Not found' });
    if (memory.userId.toString() !== req.user.userId)
      return res.status(401).json({ message: 'Not authorized' });

    await memory.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MemoVault - Digital Time Capsule</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

