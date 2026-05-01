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
