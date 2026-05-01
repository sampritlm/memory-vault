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