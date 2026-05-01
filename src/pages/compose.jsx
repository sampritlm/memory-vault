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
  const [videoStream, setVideoStream] = useState(null)
  
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

  useEffect(() => {
    if (liveVideoRef.current && videoStream) {
      liveVideoRef.current.srcObject = videoStream
    }
  }, [isVideoRec, videoStream])

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
      setVideoStream(stream)
      
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
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                      <p className="text-sm font-bold tracking-widest text-red-400 drop-shadow-md">{formatDuration(videoRecDuration)}</p>
                    </div>
                    <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-auto">
                      <button type="button" onClick={stopVideoRecording} className="px-6 py-2 rounded-full text-sm font-bold tracking-wider text-white shadow-lg transition-transform hover:scale-105" style={{ background: 'rgba(200,50,50,0.9)' }}>
                        STOP RECORDING
                      </button>
                    </div>
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