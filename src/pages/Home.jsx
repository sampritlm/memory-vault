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