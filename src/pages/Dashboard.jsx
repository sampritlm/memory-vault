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