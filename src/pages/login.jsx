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