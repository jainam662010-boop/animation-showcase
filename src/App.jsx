import React, { useState, useEffect, useRef, useCallback, useMemo, memo, Suspense, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import snippets from './codeSnippets'
import TemplatesPage from './Templates'

// ==================== CONTEXT ====================
const ThemeCtx = createContext()
const CartCtx = createContext()

function useTheme() { return useContext(ThemeCtx) }
function useCart() { return useContext(CartCtx) }

// ==================== HOOKS ====================
function useInView(th = .3) {
  const ref = useRef(null); const [v, setV] = useState(false)
  useEffect(() => { if (!ref.current) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold: th }); o.observe(ref.current); return () => o.disconnect() }, [th])
  return [ref, v]
}

function useCanvas(draw) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const x = c.getContext('2d'); let w, h, raf
    const resize = () => { w = c.width = c.parentElement.offsetWidth; h = c.height = c.parentElement.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c.parentElement)
    const loop = t => { if (w > 0 && h > 0) draw(x, w, h, t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [draw])
  return ref
}

// ==================== COMPONENTS ====================
function Toast({ msg, show }) {
  return <div className={`toast ${show ? 'show' : ''}`}><span className="toast-icon">✓</span>{msg}</div>
}

function CartPanel({ open, onClose }) {
  const { cart: items, removeFromCart: remove } = useCart()
  const [copiedId, setCopiedId] = useState(null)

  const copyEffectCode = async (id, name) => {
    const code = snippets[id]
    if (!code) { alert(`No code snippet available for "${name}" yet.`); return }
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch { alert('Copy failed — check clipboard permissions.') }
  }

  const copyAllCode = async () => {
    const parts = items.map(it => {
      const code = snippets[it.id]
      return code ? `// ===== ${it.name} =====\n${code}` : `// ===== ${it.name} =====\n// No snippet yet`
    })
    try {
      await navigator.clipboard.writeText(parts.join('\n\n'))
      alert(`Copied ${items.length} effect snippets to clipboard!`)
      onClose()
    } catch { alert('Copy failed — check clipboard permissions.') }
  }

  return (
    <>
      <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-panel ${open ? 'open' : ''}`}>
        <div className="cart-header"><h3>Cart ({items.length})</h3><button className="cart-close" onClick={onClose}>×</button></div>
        <div className="cart-items">
          {items.length === 0 ? <div className="cart-empty">No effects added yet</div> :
            items.map(it => (
              <div key={it.id} className="cart-item">
                <div className="cart-item-preview" style={{ background: `linear-gradient(135deg,var(--accent),var(--accent2))`, color: 'white', fontWeight: 800, fontSize: 16 }}>{it.name[0]}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{it.name}</div>
                  <div className="cart-item-tags">{it.tags.join(' · ')}</div>
                  <div className="cart-item-actions">
                    <button className="cart-copy-btn" onClick={() => copyEffectCode(it.id, it.name)} title="Copy code">{copiedId === it.id ? '✓' : '⎘'}</button>
                    <div className="cart-item-remove" onClick={() => remove(it.id)}>Remove</div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total Effects</span><span>{items.length}</span></div>
            <button className="cart-copy-all" onClick={copyAllCode}>Copy All Code</button>
          </div>
        )}
      </div>
    </>
  )
}

// ==================== EFFECTS ====================
function ShaderGradient() {
  const draw = useCallback((x, w, h, t) => {
    const img = x.createImageData(w, h)
    for (let y = 0; y < h; y += 3) for (let c = 0; c < w; c += 3) {
      const nx = c / w, ny = y / h
      const v1 = Math.sin(nx * 3 + t * .001) * .5 + .5, v2 = Math.sin(ny * 4 + t * .0015) * .5 + .5, v3 = Math.sin((nx + ny) * 2.5 + t * .0008) * .5 + .5
      const r = 180 + v1 * 55 | 0, g = 200 + v2 * 35 | 0, b = 240 + v3 * 15 | 0
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) { const i = ((y + dy) * w + (c + dx)) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255 }
    }
    x.putImageData(img, 0, 0)
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function LiquidGlass() {
  return (
    <div className="card-stage glass-stage">
      <div className="glass-bg">
        <div className="glass-blob" style={{ width: 180, height: 180, background: '#93c5fd', top: '10%', left: '5%', opacity: .5 }} />
        <div className="glass-blob" style={{ width: 150, height: 150, background: '#c4b5fd', top: '30%', right: '10%', opacity: .4 }} />
        <div className="glass-blob" style={{ width: 130, height: 130, background: '#f9a8d4', bottom: '5%', left: '30%', opacity: .35 }} />
      </div>
      <div className="glass-item" style={{ top: 25, left: 30 }}><h4>Volunteer</h4><p>Find events</p></div>
      <div className="glass-item" style={{ top: 50, right: 30 }}><h4>Organize</h4><p>Post events</p></div>
      <div className="glass-item" style={{ bottom: 25, left: '50%', transform: 'translateX(-50%)' }}><h4>Track</h4><p>Reputation</p></div>
    </div>
  )
}

function R3FScroll() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2 + time * .3, r = 40 + i * 12 + Math.sin(time + i) * 10
      const px = cx + Math.cos(a) * r * .6, py = cy + Math.sin(a) * r * .4
      const s = 8 + Math.sin(time * 2 + i) * 4, rot = time * .5 + i * .4
      const hue = 220 + (i / 15) * 60
      x.save(); x.translate(px, py); x.rotate(rot)
      x.fillStyle = 'hsla(' + hue + ',65%,55%,.7)'; x.fillRect(-s / 2, -s / 2, s, s)
      x.strokeStyle = 'hsla(' + hue + ',70%,65%,.3)'; x.lineWidth = 1; x.strokeRect(-s / 2, -s / 2, s, s)
      x.restore()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function LiquidLogo() {
  const draw = useCallback((x, w, h, t) => {
    const time = t * .001; x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, img = x.createImageData(w, h)
    for (let y = 0; y < h; y += 2) for (let c = 0; c < w; c += 2) {
      const dx = c - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx)
      const inE = (c > w * .25 && c < w * .4 && y > h * .25 && y < h * .75) || (c > w * .25 && c < w * .5 && y > h * .25 && y < h * .32) || (c > w * .25 && c < w * .45 && y > h * .45 && y < h * .52) || (c > w * .25 && c < w * .5 && y > h * .68 && y < h * .75)
      if (inE) { const wave = Math.sin(a * 3 + time * 2 + d * .02) * .3; const m = .5 + Math.sin(d * .05 + time + wave) * .3; const i = (y * w + c) * 4; img.data[i] = 37 + m * 80 | 0; img.data[i + 1] = 99 + m * 80 | 0; img.data[i + 2] = 235 + m * 20 | 0; img.data[i + 3] = 230 }
    }
    x.putImageData(img, 0, 0)
    x.beginPath(); x.arc(cx, cy, Math.min(w, h) * .3 + Math.sin(time) * 3, 0, Math.PI * 2); x.strokeStyle = `rgba(37,99,235,${.18 + Math.sin(time * 2) * .08})`; x.lineWidth = 2; x.stroke()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function FloatingGeometry() {
  const ref = useRef(null); const mouseRef = useRef({ x: .5, y: .5 })
  const shapes = useMemo(() => Array.from({ length: 14 }, () => ({ x: Math.random() * 500 - 250, y: Math.random() * 300 - 150, z: Math.random() * 220, type: Math.floor(Math.random() * 3), size: 10 + Math.random() * 20, hue: 220 + Math.random() * 80, phase: Math.random() * Math.PI * 2, speed: .3 + Math.random() })), [])
  useEffect(() => { if (!ref.current) return; const h = e => { const r = ref.current.getBoundingClientRect(); mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } }; ref.current.addEventListener('mousemove', h); return () => ref.current?.removeEventListener('mousemove', h) }, [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f1f5f9'); g.addColorStop(1, '#f8fafc'); x.fillStyle = g; x.fillRect(0, 0, w, h)
    const m = mouseRef.current
    shapes.forEach(s => {
      const mx = (m.x - .5) * 70 * (1 + s.z * .003), my = (m.y - .5) * 55 * (1 + s.z * .003), fy = Math.sin(t * .001 * s.speed + s.phase) * 14, sc = 500 / (500 + s.z + 200)
      x.save(); x.translate(w / 2 + (s.x + mx) * sc, h / 2 + (s.y + my + fy) * sc); x.rotate(t * .0005 * s.speed + s.phase)
      const al = Math.max(.4, 1 - s.z * .002), lt = 55 + s.z * .04; x.beginPath()
      if (s.type === 0) x.arc(0, 0, s.size * sc, 0, Math.PI * 2)
      else if (s.type === 1) { const sz = s.size * sc; x.moveTo(0, -sz); x.lineTo(sz * .866, sz * .5); x.lineTo(-sz * .866, sz * .5); x.closePath() }
      else { const sz = s.size * sc; x.moveTo(0, -sz); x.lineTo(sz * .6, 0); x.lineTo(0, sz); x.lineTo(-sz * .6, 0); x.closePath() }
      x.fillStyle = `hsla(${s.hue},55%,${lt}%,${al * .4})`; x.fill(); x.strokeStyle = `hsla(${s.hue},65%,50%,${al})`; x.lineWidth = 1.5; x.stroke(); x.restore()
    })
  }, [shapes])
  const canvasRef = useCanvas(draw)
  return <div className="card-stage" ref={ref}><canvas ref={canvasRef} /></div>
}

function PostFX() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#f1f5f9'; x.fillRect(0, 0, w, h)
    const orbs = [{ x: w * .3, y: h * .4, r: 55, hue: 220, s: .8 }, { x: w * .7, y: h * .6, r: 42, hue: 280, s: 1.2 }, { x: w * .5, y: h * .3, r: 65, hue: 200, s: .5 }]
    orbs.forEach(o => { const ox = o.x + Math.sin(t * .001 * o.s) * 25, oy = o.y + Math.cos(t * .0013 * o.s) * 18; for (let i = 4; i >= 0; i--) { const r = o.r * (1 + i * .8), al = .05 / (i + 1), g = x.createRadialGradient(ox, oy, 0, ox, oy, r); g.addColorStop(0, `hsla(${o.hue},65%,55%,${al})`); g.addColorStop(1, `hsla(${o.hue},65%,55%,0)`); x.fillStyle = g; x.fillRect(0, 0, w, h) } })
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function CardFlip3D() {
  const [flipped, setFlipped] = useState(false); const [ref, visible] = useInView(.5)
  useEffect(() => { if (visible) { const id = setInterval(() => setFlipped(f => !f), 2200); return () => clearInterval(id) } }, [visible])
  return <div className="card-stage" ref={ref}><div className="flip-container"><div className={`flip-inner ${flipped ? 'flipped' : ''}`}><div className="flip-face flip-front"><h4>The Problem</h4><p>Volunteer chaos</p></div><div className="flip-face flip-back"><h4>The Solution</h4><p>AI-powered matching</p></div></div></div></div>
}

function ParallaxDepth() {
  const ref = useRef(null); const mouseRef = useRef({ x: .5, y: .5 })
  const stars = useMemo(() => Array.from({ length: 50 }, () => ({ x: Math.random() * 700, y: Math.random() * 340, r: .5 + Math.random() * 1.8, depth: .1 + Math.random() * .8 })), [])
  useEffect(() => { if (!ref.current) return; const h = e => { const r = ref.current.getBoundingClientRect(); mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } }; ref.current.addEventListener('mousemove', h); return () => ref.current?.removeEventListener('mousemove', h) }, [])
  const draw = useCallback((x, w, h) => {
    x.clearRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0f172a'); g.addColorStop(1, '#1e293b'); x.fillStyle = g; x.fillRect(0, 0, w, h)
    const m = mouseRef.current
    stars.forEach(s => { x.beginPath(); x.arc(s.x + (m.x - .5) * 50 * s.depth, s.y + (m.y - .5) * 35 * s.depth, s.r, 0, Math.PI * 2); x.fillStyle = `rgba(255,255,255,${.3 + s.depth * .5})`; x.fill() })
    const cx = w / 2 + (m.x - .5) * 22, cy = h / 2 + (m.y - .5) * 16
    x.font = 'bold 24px Syne'; x.fillStyle = 'rgba(255,255,255,.9)'; x.textAlign = 'center'; x.fillText('EVOLECT', cx, cy + 6)
  }, [stars])
  const canvasRef = useCanvas(draw)
  return <div className="card-stage" ref={ref} style={{ background: '#0f172a' }}><canvas ref={canvasRef} /></div>
}

function TextReveal3D() {
  const [ref, visible] = useInView(.5)
  return <div className="card-stage" ref={ref}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 800, display: 'flex', gap: 2 }}>{'EVOLECT'.split('').map((ch, i) => (<span key={i} style={{ display: 'inline-block', opacity: visible ? 1 : 0, transform: visible ? 'rotateX(0) translateY(0)' : 'rotateX(-90deg) translateY(20px)', transition: `all .5s cubic-bezier(.4,0,.2,1) ${i * 70}ms` }}>{ch}</span>))}</div></div>
}

function HScrollCards() {
  const wrapRef = useRef(null); const [scroll, setScroll] = useState(0)
  useEffect(() => { const h = () => { if (!wrapRef.current) return; const r = wrapRef.current.getBoundingClientRect(), vh = window.innerHeight; if (r.top < vh && r.bottom > 0) setScroll(Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)))) }; window.addEventListener('scroll', h, { passive: true }); h(); return () => window.removeEventListener('scroll', h) }, [])
  const cards = [{ title: 'Post', desc: 'Create events', bg: 'linear-gradient(135deg,#2563eb,#1e40af)' }, { title: 'Match', desc: 'AI matching', bg: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }, { title: 'Manage', desc: 'Coordination', bg: 'linear-gradient(135deg,#059669,#047857)' }, { title: 'Track', desc: 'Reputation', bg: 'linear-gradient(135deg,#ea580c,#c2410c)' }, { title: 'Grow', desc: 'Build credibility', bg: 'linear-gradient(135deg,#dc2626,#b91c1c)' }]
  return <div className="card-stage" ref={wrapRef}><div className="hscroll-wrap" style={{ width: '100%' }}><div className="hscroll-track" style={{ transform: `translateX(${-scroll * 350}px)` }}>{cards.map((c, i) => (<div key={i} className="hscroll-card" style={{ background: c.bg }}><h4>{c.title}</h4><p>{c.desc}</p></div>))}</div></div></div>
}

function MagneticCursor() {
  return <div className="card-stage" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>{['Join', 'Explore', 'Start'].map((t, i) => <MagneticBtn key={i}>{t}</MagneticBtn>)}</div>
}

function MagneticBtn({ children }) {
  const ref = useRef(null)
  return <button ref={ref} className="mag-btn" onMouseMove={e => { const r = ref.current.getBoundingClientRect(); ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .3}px)` }} onMouseLeave={() => { ref.current.style.transform = 'translate(0,0)' }}>{children}</button>
}

function FlipGrid() {
  const items = [{ icon: '⚡', title: 'Real-time' }, { icon: '⭐', title: 'Rated' }, { icon: '👥', title: 'Teams' }, { icon: '📅', title: 'Schedule' }, { icon: '💬', title: 'Chat' }, { icon: '📊', title: 'Analytics' }]
  return <div className="card-stage"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, padding: 14, width: '100%' }}>{items.map((it, i) => <FlipItem key={i} {...it} />)}</div></div>
}

function FlipItem({ icon, title }) {
  const [f, setF] = useState(false)
  return <div style={{ perspective: 500, height: 95 }} onMouseEnter={() => setF(true)} onMouseLeave={() => setF(false)}><div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform .5s', transform: f ? 'rotateY(180deg)' : 'rotateY(0)' }}><div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, transition: 'background .3s,border-color .3s' }}><div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div><div style={{ fontSize: 11, fontWeight: 700 }}>{title}</div></div><div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 600 }}>{title}</div></div></div>
}

function TiltGlow() {
  const cardRef = useRef(null); const glowRef = useRef(null)
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="tilt-container"><div ref={cardRef} className="tilt-inner" onMouseMove={e => { const r = cardRef.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; cardRef.current.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`; glowRef.current.style.left = (e.clientX - r.left) + 'px'; glowRef.current.style.top = (e.clientY - r.top) + 'px' }} onMouseLeave={() => { cardRef.current.style.transform = 'rotateY(0) rotateX(0)' }}><div ref={glowRef} className="tilt-glow" /><h4>Hover</h4><p>Tilt + glow</p></div></div></div>
}

function RevealStagger() {
  const [ref, visible] = useInView(.3)
  const items = [{ icon: '⚡', t: 'Real-time' }, { icon: '⭐', t: 'Rated' }, { icon: '👥', t: 'Teams' }, { icon: '📅', t: 'Schedule' }, { icon: '💬', t: 'Chat' }, { icon: '📊', t: 'Analytics' }]
  return <div className="card-stage" ref={ref}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 14, width: '100%' }}>{items.map((it, i) => (<div key={i} className={`reveal-item ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${i * 80}ms` }}><div className="icon">{it.icon}</div><h4>{it.t}</h4></div>))}</div></div>
}

function MorphingGrid() {
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="morph-grid">{['Post', 'Match', 'Connect', 'Manage', 'Track', 'Grow'].map((t, i) => <div key={i} className="morph-cell">{t}</div>)}</div></div>
}

function ParticleSystem() {
  const particles = useMemo(() => Array.from({ length: 600 }, () => ({ x: Math.random() * 1200 - 600, y: Math.random() * 700 - 350, z: Math.random() * 400, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, vz: (Math.random() - .5) * .4 })), [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h)
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.z += p.vz; if (Math.abs(p.x) > 600) p.vx *= -1; if (Math.abs(p.y) > 350) p.vy *= -1; if (p.z < 0 || p.z > 400) p.vz *= -1; const s = 600 / (600 + p.z + 300); x.beginPath(); x.arc(w / 2 + p.x * s, h / 2 + p.y * s, 1 * s, 0, Math.PI * 2); x.fillStyle = `hsla(220,70%,60%,${Math.max(.1, 1 - p.z * .0015) * .5})`; x.fill() })
  }, [particles])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function WavePlane() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#f1f5f9'; x.fillRect(0, 0, w, h)
    for (let r = 0; r < 22; r++) { x.beginPath(); for (let c = 0; c <= 35; c++) { const nx = c / 35, ny = r / 22, px = nx * w, wave = Math.sin(nx * 6 + t * .002) * 16 + Math.sin(ny * 4 + t * .0015) * 10, py = h / 2 + (ny - .5) * 160 + wave; c === 0 ? x.moveTo(px, py) : x.lineTo(px, py) }; x.strokeStyle = `hsla(220,60%,55%,${.1 + r / 22 * .3})`; x.lineWidth = 1.5; x.stroke() }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function NeonGlow() {
  return <div className="card-stage" style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="neon-text">EVOLECT</div></div>
}

function HolographicCard() {
  const cardRef = useRef(null); const shineRef = useRef(null)
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div ref={cardRef} className="holo-card" onMouseMove={e => { const r = cardRef.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; cardRef.current.style.setProperty('--angle', (Math.atan2(y - .5, x - .5) * 180 / Math.PI + 180) + 'deg'); shineRef.current.style.opacity = '.6' }} onMouseLeave={() => { shineRef.current.style.opacity = '0' }}><div ref={shineRef} className="holo-shine" />EVOLECT</div></div>
}

function FluidBlob() {
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="200" height="200" viewBox="0 0 200 200"><defs><filter id="fluid1"><feTurbulence type="fractalNoise" baseFrequency=".015" numOctaves="3" result="noise" seed="1"><animate attributeName="seed" from="1" to="100" dur="8s" repeatCount="indefinite" /></feTurbulence><feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" /></filter><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="var(--accent)" /><stop offset="100%" stopColor="var(--accent2)" /></linearGradient></defs><ellipse cx="100" cy="100" rx="70" ry="70" fill="url(#g1)" filter="url(#fluid1)"><animate attributeName="rx" values="70;80;65;75;70" dur="4s" repeatCount="indefinite" /><animate attributeName="ry" values="70;65;80;70;70" dur="4s" repeatCount="indefinite" /></ellipse></svg></div>
}

function Globe3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .0005, cx = w / 2, cy = h / 2, R = Math.min(w, h) * .3
    const cities = [[40,-74],[51,0],[35,139],[-34,151],[1.3,103.8],[48,2],[55,37],[19,72],[34,118],[-23,-46],[52,13],[41,29],[37,127],[22,114],[30,31]]
    for (let lat = -80; lat <= 80; lat += 20) {
      x.beginPath()
      for (let lon = 0; lon <= 360; lon += 5) {
        const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180
        const px = cx + R * Math.sin(phi) * Math.cos(theta + time)
        const py = cy + R * Math.cos(phi) * Math.cos(lat * .01)
        lon === 0 ? x.moveTo(px, py) : x.lineTo(px, py)
      }
      x.strokeStyle = 'rgba(37,99,235,.12)'; x.lineWidth = 1; x.stroke()
    }
    for (let lon = 0; lon < 360; lon += 30) {
      x.beginPath()
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180
        const px = cx + R * Math.sin(phi) * Math.cos(theta + time)
        const py = cy + R * Math.cos(phi)
        lat === -90 ? x.moveTo(px, py) : x.lineTo(px, py)
      }
      x.strokeStyle = 'rgba(37,99,235,.06)'; x.stroke()
    }
    cities.forEach(([lat, lon]) => {
      const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180
      const px = cx + R * Math.sin(phi) * Math.cos(theta + time)
      const py = cy + R * Math.cos(phi)
      const depth = Math.sin(theta + time)
      if (depth > -.2) {
        x.beginPath(); x.arc(px, py, 2.5 + depth, 0, Math.PI * 2)
        x.fillStyle = 'rgba(96,165,250,' + (.5 + depth * .4) + ')'; x.fill()
      }
    })
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function ScrollTunnel3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2
    for (let i = 30; i >= 0; i--) {
      const z = (i * 2 - (time * 30) % 60 + 60) % 60
      const scale = 200 / (200 + z * 4), r = (40 + i * 2) * scale
      const alpha = Math.max(0, 1 - z / 60) * .7, hue = 220 + (i / 30) * 40
      x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2)
      x.strokeStyle = 'hsla(' + hue + ',70%,60%,' + alpha + ')'; x.lineWidth = 1.5 * scale; x.stroke()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function ScrollParticles3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .0008, cx = w / 2, cy = h / 2, count = 300
    const progress = (Math.sin(time * .4) + 1) / 2
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const tx = cx + Math.cos(a) * 80, ty = cy + Math.sin(a) * 80
      const sx = (((i * 137.5) % w)), sy = (((i * 97.3) % h))
      const px = sx + (tx - sx) * progress, py = sy + (ty - sy) * progress
      x.beginPath(); x.arc(px, py, 1.5, 0, Math.PI * 2)
      x.fillStyle = 'hsla(220,70%,60%,' + (.3 + progress * .5) + ')'; x.fill()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function ScrollMorph3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, R = Math.min(w, h) * .22, verts = 24
    const phase = (time * .3) % 3, pts = []
    for (let i = 0; i < verts; i++) {
      const a = (i / verts) * Math.PI * 2
      let r = phase < 1 ? R * .7 + Math.sin(a * 4 + time * 2) * R * .05
        : phase < 2 ? R * (1 + Math.cos(a * 3 + time) * .15)
        : R * .8 + Math.sin(a * 6 + time * 3) * R * .2
      const depth = Math.cos(a + time * .5) * .3 + .7
      pts.push({ x: cx + Math.cos(a) * r * depth, y: cy + Math.sin(a) * r, d: depth })
    }
    x.beginPath(); pts.forEach((p, i) => i === 0 ? x.moveTo(p.x, p.y) : x.lineTo(p.x, p.y))
    x.closePath(); x.strokeStyle = 'rgba(96,165,250,.7)'; x.lineWidth = 1.5; x.stroke()
    x.fillStyle = 'rgba(96,165,250,.08)'; x.fill()
    pts.forEach(p => { x.beginPath(); x.arc(p.x, p.y, 2 * p.d, 0, Math.PI * 2); x.fillStyle = 'rgba(167,139,250,' + (p.d * .8) + ')'; x.fill() })
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function ScrollLayers3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .0008, cx = w / 2, cy = h / 2
    for (let i = 7; i >= 0; i--) {
      const depth = i / 8, scale = 1 - depth * .4
      const ox = Math.sin(time * (.3 + i * .1) + i) * 30 * (1 + i * .3)
      const oy = Math.cos(time * (.2 + i * .08) + i) * 20 * (1 + i * .2)
      const pw = (w * .3 + i * 20) * scale, ph = (h * .25 + i * 15) * scale
      const hue = 220 + i * 8
      x.fillStyle = 'hsla(' + hue + ',50%,50%,' + (.08 + depth * .06) + ')'
      x.fillRect(cx + ox - pw / 2, cy + oy - ph / 2, pw, ph)
      x.strokeStyle = 'hsla(' + hue + ',60%,60%,' + (.15 + depth * .1) + ')'; x.lineWidth = 1
      x.strokeRect(cx + ox - pw / 2, cy + oy - ph / 2, pw, ph)
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function ScrollGrid3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2
    for (let gx = -3; gx <= 3; gx++) for (let gz = -2; gz <= 2; gz++) {
      const wave = Math.sin(time * 1.5 + gx * .8 + gz * .6) * 15
      const depth = 1 - Math.abs(gz) * .08
      const px = cx + gx * 28 + Math.sin(time + gx) * 5, py = cy + gz * 28 * .6 + wave
      const s = 12 * depth, rot = time * .4 + gx * .3 + gz * .2
      const hue = 220 + (gx + 3) * 8 + (gz + 2) * 5
      x.save(); x.translate(px, py); x.rotate(rot)
      x.fillStyle = 'hsla(' + hue + ',55%,55%,' + (.3 + depth * .4) + ')'
      x.fillRect(-s / 2, -s / 2, s, s)
      x.strokeStyle = 'hsla(' + hue + ',65%,65%,' + (.2 + depth * .2) + ')'; x.lineWidth = 1
      x.strokeRect(-s / 2, -s / 2, s, s)
      x.restore()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function ScrollSpiral3D() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .0008, cx = w / 2, cy = h / 2, count = 250
    const progress = (Math.sin(time * .35) + 1) / 2, spread = 1 + Math.sin(time * .5) * .5
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 6, y = (i / count) * 6 - 3
      const tx = Math.cos(a) * 50 * spread, ty = y * 60
      const sx = (((i * 137.5) % w)), sy = (((i * 97.3) % h))
      const px = sx + (tx - sx) * progress + cx, py = sy + (ty - sy) * progress + cy
      x.beginPath(); x.arc(px, py, 1.5 * (Math.cos(a) * .3 + .7), 0, Math.PI * 2)
      x.fillStyle = 'hsla(265,70%,60%,' + (.3 + progress * .5) + ')'; x.fill()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

function NoiseAbstract() {
  const draw = useCallback((x, w, h, t) => {
    const img = x.createImageData(w, h)
    for (let y = 0; y < h; y += 3) for (let c = 0; c < w; c += 3) {
      const n = Math.sin(c * .02 + t * .0005) * Math.cos(y * .02 + t * .00035) * Math.sin((c + y) * .015 + t * .00025), v = (n + 1) / 2
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) { const i = ((y + dy) * w + (c + dx)) * 4; img.data[i] = 220 + v * 35 | 0; img.data[i + 1] = 230 + v * 20 | 0; img.data[i + 2] = 245 + v * 10 | 0; img.data[i + 3] = 255 }
    }
    x.putImageData(img, 0, 0)
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== 10 Word Effects =====

// 1: Glitch Text — digital distortion glitch
function GlitchText() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0a0a12'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'GLITCH'
    const fontSize = Math.min(w * .16, h * .3)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    const glitchActive = Math.sin(time * 3) > .85
    const sliceCount = 12
    for (let i = 0; i < sliceCount; i++) {
      const sliceY = (i / sliceCount) * h, sliceH = h / sliceCount
      const offset = glitchActive ? (Math.random() - .5) * 30 * Math.sin(time * 10 + i) : 0
      const chroma = glitchActive ? (Math.random() - .5) * 6 : 0
      x.save(); x.beginPath(); x.rect(0, sliceY, w, sliceH); x.clip()
      x.fillStyle = 'rgba(200,220,255,.85)'; x.fillText(text, cx + offset, cy)
      if (glitchActive) {
        x.fillStyle = 'rgba(255,50,50,.15)'; x.fillText(text, cx + offset + chroma, cy)
        x.fillStyle = 'rgba(50,150,255,.15)'; x.fillText(text, cx + offset - chroma, cy)
      }
      x.restore()
    }
    if (glitchActive) {
      for (let i = 0; i < 4; i++) {
        const gy = Math.random() * h, gh = 2 + Math.random() * 8
        x.fillStyle = 'rgba(50,255,120,.12)'; x.fillRect(0, gy, w, gh)
      }
      x.fillStyle = 'rgba(200,220,255,.03)'; x.fillText(text, cx + (Math.random() - .5) * 8, cy + (Math.random() - .5) * 4)
    }
    // Scanlines
    for (let y = 0; y < h; y += 3) {
      x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(0, y, w, 1)
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 2: Neon Pulse — glowing neon sign
function NeonPulse() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0a0a14'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'NEON'
    const fontSize = Math.min(w * .2, h * .35)
    const pulse = .6 + Math.sin(time * 2) * .2 + Math.sin(time * 5.3) * .08
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    // Outer glow
    for (let i = 5; i >= 1; i--) {
      x.shadowColor = 'rgba(255,50,150,' + (pulse * .15 / i) + ')'
      x.shadowBlur = i * 25; x.fillStyle = 'rgba(255,50,150,' + (pulse * .06) + ')'
      x.fillText(text, cx, cy)
    }
    // Core text
    x.shadowColor = 'rgba(255,80,180,' + pulse + ')'; x.shadowBlur = 20
    x.fillStyle = 'rgba(255,120,200,' + pulse + ')'; x.fillText(text, cx, cy)
    // Bright core
    x.shadowBlur = 5; x.shadowColor = 'rgba(255,200,240,' + pulse + ')'
    x.fillStyle = 'rgba(255,220,245,' + (pulse * .9) + ')'; x.fillText(text, cx, cy)
    x.shadowBlur = 0
    // Reflection
    x.save(); x.globalAlpha = pulse * .08; x.translate(0, cy * 2 + fontSize * .2); x.scale(1, -.3)
    x.fillStyle = 'rgba(255,100,180,.5)'; x.fillText(text, cx, 0)
    x.restore()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 3: Wave Text — letters undulating
function WaveText() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, text = 'WAVEFORM'
    const fontSize = Math.min(w * .09, h * .2)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    const totalW = x.measureText(text).width
    let startX = (w - totalW) / 2
    for (let i = 0; i < text.length; i++) {
      const charW = x.measureText(text[i]).width
      const charX = startX + charW / 2
      const wave = Math.sin(time * 2 + i * .5) * 25
      const rot = Math.sin(time * 1.5 + i * .4) * .15
      const hue = 200 + i * 15
      const alpha = .7 + Math.sin(time * 2 + i * .5) * .2
      x.save(); x.translate(charX, h / 2 + wave); x.rotate(rot)
      // Shadow
      x.fillStyle = 'rgba(30,60,120,.15)'; x.fillText(text[i], 2, 4)
      // Char
      x.fillStyle = 'hsla(' + hue + ',70%,65%,' + alpha + ')'; x.fillText(text[i], 0, 0)
      // Highlight
      x.fillStyle = 'hsla(' + hue + ',80%,80%,' + (alpha * .3) + ')'; x.fillText(text[i], 0, -1)
      x.restore()
    }
    // Connecting line
    x.beginPath()
    for (let i = 0; i < text.length; i++) {
      const charW = x.measureText(text[i]).width
      const charX = startX + charW / 2
      startX += charW
      const wave = Math.sin(time * 2 + i * .5) * 25
      i === 0 ? x.moveTo(charX, h / 2 + wave) : x.lineTo(charX, h / 2 + wave)
    }
    x.strokeStyle = 'rgba(96,165,250,.08)'; x.lineWidth = 1; x.stroke()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 4: Shatter Text — fragments break and reassemble
function ShatterText() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0a0e1a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'SHATTER'
    const fontSize = Math.min(w * .14, h * .28)
    const phase = (time * .4) % 4, breaking = phase > 1 && phase < 3
    const progress = breaking ? Math.sin((phase - 1) * Math.PI / 2) : 0
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    const chars = text.split('')
    const totalW = x.measureText(text).width
    let startX = cx - totalW / 2
    chars.forEach((ch, i) => {
      const charW = x.measureText(ch).width
      const baseX = startX + charW / 2, baseY = cy
      const seed = i * 137.5
      const dx = Math.sin(seed) * 120 * progress
      const dy = Math.cos(seed * .7) * 80 * progress
      const rot = Math.sin(seed * 1.3) * 1.5 * progress
      const alpha = 1 - progress * .4
      x.save(); x.translate(baseX + dx, baseY + dy); x.rotate(rot)
      x.fillStyle = 'rgba(200,220,255,' + alpha + ')'; x.fillText(ch, 0, 0)
      if (progress > .3) {
        x.strokeStyle = 'rgba(96,165,250,' + (progress * .3) + ')'; x.lineWidth = 1
        x.strokeText(ch, 0, 0)
      }
      x.restore()
      startX += charW
    })
    // Spark particles when shattering
    if (progress > .1) {
      for (let i = 0; i < 15; i++) {
        const a = (i / 15) * Math.PI * 2 + time, d = 30 + Math.random() * 60 * progress
        const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d * .6
        x.beginPath(); x.arc(px, py, 1.5 * progress, 0, Math.PI * 2)
        x.fillStyle = 'rgba(150,200,255,' + (progress * .4) + ')'; x.fill()
      }
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 5: Holographic — rainbow iridescent shimmer
function HoloText() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#08080f'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'HOLO'
    const fontSize = Math.min(w * .22, h * .4)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    // Holographic gradient sweep
    const grad = x.createLinearGradient(cx - w * .4 + Math.sin(time) * w * .2, cy, cx + w * .4 + Math.sin(time) * w * .2, cy)
    for (let i = 0; i <= 10; i++) {
      const hue = (i / 10 * 360 + time * 40) % 360
      grad.addColorStop(i / 10, 'hsla(' + hue + ',80%,60%,.9)')
    }
    x.fillStyle = grad; x.fillText(text, cx, cy)
    // Moving highlight band
    const bandX = cx + Math.sin(time * 1.2) * w * .3
    x.save(); x.globalCompositeOperation = 'screen'
    const band = x.createLinearGradient(bandX - 30, 0, bandX + 30, 0)
    band.addColorStop(0, 'rgba(255,255,255,0)'); band.addColorStop(.5, 'rgba(255,255,255,.25)'); band.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = band; x.fillText(text, cx, cy)
    x.restore()
    // Subtle noise overlay
    x.save(); x.globalAlpha = .03
    for (let i = 0; i < 80; i++) {
      const nx = Math.random() * w, ny = Math.random() * h
      x.fillStyle = Math.random() > .5 ? '#fff' : '#000'
      x.fillRect(nx, ny, 2, 2)
    }
    x.restore()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 6: Liquid Morph — text morphs between two words
function LiquidMorph() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0a0e1a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2
    const words = ['LIQUID', 'METAL', 'FLUID', 'MORPH']
    const idx = Math.floor(time * .5) % words.length
    const nextIdx = (idx + 1) % words.length
    const blend = (time * .5) % 1
    const text1 = words[idx], text2 = words[nextIdx]
    const fontSize = Math.min(w * .14, h * .3)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    // Dissolve current word
    const alpha1 = Math.max(0, 1 - blend * 1.5)
    x.save(); x.globalAlpha = alpha1
    for (let i = 0; i < text1.length; i++) {
      const cw = x.measureText(text1.substring(0, i + 1)).width - x.measureText(text1.substring(0, i)).width
      const totalW = x.measureText(text1).width
      const charX = cx - totalW / 2 + x.measureText(text1.substring(0, i)).width + cw / 2
      const dy = blend * 40 * Math.sin(i * .8)
      x.fillStyle = 'rgba(100,180,255,' + alpha1 + ')'
      x.fillText(text1[i], charX, cy + dy)
    }
    x.restore()
    // Fade in next word
    const alpha2 = Math.max(0, blend * 1.5 - .5)
    x.save(); x.globalAlpha = alpha2
    for (let i = 0; i < text2.length; i++) {
      const cw = x.measureText(text2.substring(0, i + 1)).width - x.measureText(text2.substring(0, i)).width
      const totalW = x.measureText(text2).width
      const charX = cx - totalW / 2 + x.measureText(text2.substring(0, i)).width + cw / 2
      const dy = (1 - blend) * -40 * Math.sin(i * .8)
      x.fillStyle = 'rgba(160,130,255,' + alpha2 + ')'
      x.fillText(text2[i], charX, cy + dy)
    }
    x.restore()
    // Liquid distortion blobs
    for (let i = 0; i < 5; i++) {
      const bx = cx + Math.sin(time + i * 1.3) * w * .2
      const by = cy + Math.cos(time * .8 + i) * h * .15
      const br = 15 + Math.sin(time * 2 + i) * 8
      const bg = x.createRadialGradient(bx, by, 0, bx, by, br)
      bg.addColorStop(0, 'rgba(100,160,255,.06)'); bg.addColorStop(1, 'rgba(100,160,255,0)')
      x.fillStyle = bg; x.beginPath(); x.arc(bx, by, br, 0, Math.PI * 2); x.fill()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 8: Chrome Reflection — metallic chrome with environment
function ChromeText() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#08080f'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'CHROME'
    const fontSize = Math.min(w * .16, h * .32)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    // Environment reflection bands
    const envGrad = x.createLinearGradient(0, cy - fontSize * .5, 0, cy + fontSize * .5)
    const offset = (time * .3) % 1
    for (let i = 0; i < 8; i++) {
      const pos = ((i / 8 + offset) % 1)
      const bright = Math.sin(pos * Math.PI) * .4 + .5
      envGrad.addColorStop(pos, 'rgba(' + (180 + bright * 75) + ',' + (190 + bright * 65) + ',' + (210 + bright * 45) + ',.95)')
    }
    // Chrome body
    x.fillStyle = envGrad; x.fillText(text, cx, cy)
    // Edge highlight
    x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1.5; x.strokeText(text, cx, cy)
    // Top specular
    x.save(); x.globalCompositeOperation = 'screen'
    const spec = x.createLinearGradient(cx, cy - fontSize * .4, cx, cy)
    spec.addColorStop(0, 'rgba(255,255,255,.5)'); spec.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = spec; x.fillText(text, cx, cy)
    x.restore()
    // Reflection
    x.save(); x.globalAlpha = .12; x.translate(0, cy * 2 + fontSize * .15); x.scale(1, -.3)
    x.fillStyle = envGrad; x.fillText(text, cx, 0)
    x.restore()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 9: Matrix Decode — characters decode into word
function MatrixDecode() {
  const draw = useCallback((x, w, h, t) => {
    x.fillStyle = 'rgba(10,14,26,.15)'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'MATRIX'
    const fontSize = Math.min(w * .15, h * .3)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    // Rain columns
    x.font = '12px monospace'
    for (let col = 0; col < w; col += 14) {
      const speed = .03 + (col % 7) * .005
      const chars = 'アイウエオカキクケコサシスセソ0123456789'
      for (let row = 0; row < 20; row++) {
        const y = (time * 60 * (1 + (col % 3) * .2) + row * 22) % (h + 40) - 20
        const ch = chars[Math.floor(Math.random() * chars.length)]
        const alpha = row === 0 ? .9 : Math.max(0, .4 - row * .02)
        x.fillStyle = 'rgba(34,197,94,' + alpha + ')'
        x.fillText(ch, col, y)
      }
    }
    // Decoded word
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    const reveal = (Math.sin(time * .8) + 1) / 2
    x.save(); x.globalAlpha = .7 + reveal * .3
    const grad = x.createLinearGradient(cx - w * .3, 0, cx + w * .3, 0)
    grad.addColorStop(0, 'rgba(34,197,94,.9)'); grad.addColorStop(.5, 'rgba(180,255,180,1)'); grad.addColorStop(1, 'rgba(34,197,94,.9)')
    x.fillStyle = grad; x.fillText(text, cx, cy)
    x.restore()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// 10: Gradient Flow — animated gradient streaming through text
function GradientFlow() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0a0e1a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2, text = 'FLOW'
    const fontSize = Math.min(w * .25, h * .45)
    x.font = '800 ' + fontSize + 'px Syne, sans-serif'
    x.textAlign = 'center'; x.textBaseline = 'middle'
    // Flowing gradient
    const offset = time * .5
    const grad = x.createLinearGradient(
      cx + Math.cos(offset) * w * .4, cy + Math.sin(offset) * h * .3,
      cx - Math.cos(offset) * w * .4, cy - Math.sin(offset) * h * .3
    )
    grad.addColorStop(0, '#2563eb')
    grad.addColorStop(.2, '#7c3aed')
    grad.addColorStop(.4, '#ec4899')
    grad.addColorStop(.6, '#f59e0b')
    grad.addColorStop(.8, '#22c55e')
    grad.addColorStop(1, '#2563eb')
    x.fillStyle = grad; x.fillText(text, cx, cy)
    // Secondary flowing layer
    x.save(); x.globalCompositeOperation = 'screen'; x.globalAlpha = .3
    const grad2 = x.createLinearGradient(
      cx + Math.cos(offset * 1.3 + 1) * w * .3, cy + Math.sin(offset * .7) * h * .2,
      cx - Math.cos(offset * 1.3 + 1) * w * .3, cy - Math.sin(offset * .7) * h * .2
    )
    grad2.addColorStop(0, '#f59e0b'); grad2.addColorStop(.5, '#06b6d4'); grad2.addColorStop(1, '#ec4899')
    x.fillStyle = grad2; x.fillText(text, cx, cy)
    x.restore()
    // Subtle glow
    x.shadowColor = 'rgba(120,80,250,.3)'; x.shadowBlur = 40
    x.fillStyle = 'rgba(120,80,250,.01)'; x.fillText(text, cx, cy)
    x.shadowBlur = 0
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}
function ShaderGradientPro() {
  const draw = useCallback((x, w, h, t) => {
    const img = x.createImageData(w, h)
    const time = t * .0003
    for (let y = 0; y < h; y += 3) for (let c = 0; c < w; c += 3) {
      const u = c / w, v = y / h
      const n1 = Math.sin(u * 4 + time) * Math.cos(v * 3 - time * .7)
      const n2 = Math.sin((u + v) * 3 + time * 1.3) * Math.cos((u - v) * 2 + time * .5)
      const n3 = Math.sin(Math.sqrt(u * u + v * v) * 5 + time * .8)
      const r = 60 + n1 * 80 + n3 * 40 | 0
      const g = 100 + n2 * 60 + Math.cos(u * 5 + time) * 50 | 0
      const b = 200 + n1 * 30 + n2 * 25 | 0
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
        const i = ((y + dy) * w + (c + dx)) * 4
        img.data[i] = Math.max(0, Math.min(255, r)); img.data[i + 1] = Math.max(0, Math.min(255, g)); img.data[i + 2] = Math.max(0, Math.min(255, b)); img.data[i + 3] = 255
      }
    }
    x.putImageData(img, 0, 0)
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== Inspired by liquid-glass-js — WebGL refraction glass =====
function LiquidGlassPro() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl'); if (!gl) return
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; gl.viewport(0, 0, w, h) }
    resize(); window.addEventListener('resize', resize)
    const vs = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0,1);}`
    const fs = `precision mediump float;uniform float u_t;uniform vec2 u_res;
    float sdSphere(vec2 p,float r){return length(p)-r;}
    float opSmoothUnion(float d1,float d2,float k){float h=clamp(.5+.5*(d2-d1)/k,0.,1.);return mix(d2,d1,h)-k*h*(1.-h);}
    void main(){
      vec2 uv=gl_FragCoord.xy/u_res;
      vec2 p=(gl_FragCoord.xy-.5*u_res)/min(u_res.x,u_res.y);
      float t=u_t*.5;
      float d1=sdSphere(p-vec2(sin(t*.7)*.2,cos(t*.9)*.15),.22+sin(t)*.03);
      float d2=sdSphere(p-vec2(cos(t*.8)*.18,sin(t*.6)*.2),.18+cos(t*1.1)*.02);
      float d3=sdSphere(p-vec2(sin(t*1.2)*.1,cos(t*.5)*.25),.15);
      float d=opSmoothUnion(d1,d2,.12);
      d=opSmoothUnion(d,d3,.1);
      vec3 col=vec3(.94,.96,.98);
      if(d<0.0){
        float edge=1.-smoothstep(-.02,0.,d);
        float fresnel=pow(1.-abs(d)*8.,2.);
        col=vec3(.6,.8,1.)*edge*.5+vec3(.95,.97,1.)*fresnel*.3;
        vec2 refract=vec2(sin(uv.y*15.+t*2.),cos(uv.x*15.+t*1.5))*.008;
        float bg=sin((uv.x+refract.x)*20.)*cos((uv.y+refract.y)*20.)*.5+.5;
        col+=vec3(bg*.15,bg*.2,bg*.35);
      }
      float bg2=sin(uv.x*12.+t)*cos(uv.y*10.-t*.7)*.5+.5;
      col+=vec3(bg2*.08,bg2*.12,bg2*.2)*(1.-smoothstep(0.,.5,abs(d)));
      float rim=smoothstep(.01,0.,abs(d)-.01)*.6;
      col+=vec3(.7,.85,1.)*rim;
      gl_FragColor=vec4(col,1);
    }`
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
    const prog = gl.createProgram(); gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u_t = gl.getUniformLocation(prog, 'u_t'), u_res = gl.getUniformLocation(prog, 'u_res')
    const loop = (t) => { gl.uniform1f(u_t, t * .001); gl.uniform2f(u_res, w, h); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <div className="card-stage" style={{ background: 'linear-gradient(135deg,#0c1426,#162040)' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
}

// ===== Inspired by collidingScopes/liquid-logo — liquid metal text =====
function LiquidMetalText() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current, x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = (t) => {
      const time = t * .001
      x.clearRect(0, 0, w, h)
      x.fillStyle = '#0a0a14'; x.fillRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2
      const imgData = x.createImageData(w, h)
      const d = imgData.data
      for (let y = 0; y < h; y += 2) for (let c2 = 0; c2 < w; c2 += 2) {
        const u = (c2 - cx) / (w * .35), v = (y - cy) / (h * .35)
        const dist = Math.sqrt(u * u + v * v)
        const angle = Math.atan2(v, u)
        const noise = Math.sin(u * 5 + time) * Math.cos(v * 4 - time * .8) * Math.sin(dist * 3 + time * 1.2)
        const edge = Math.exp(-dist * dist * 2) * (1 + noise * .4)
        const metalR = .75 + Math.cos(angle + time + noise) * .2
        const metalG = .78 + Math.sin(angle * 2 + time * 1.3) * .15
        const metalB = .85 + Math.cos(angle * 3 - time) * .12
        const specular = Math.pow(Math.max(0, 1 - Math.abs(dist - .5 - noise * .1) * 4), 3) * .8
        const r = (metalR * edge * 200 + specular * 255) | 0
        const g = (metalG * edge * 220 + specular * 240) | 0
        const b = (metalB * edge * 255 + specular * 255) | 0
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
          const i = ((y + dy) * w + (c2 + dx)) * 4
          d[i] = Math.min(255, r); d[i + 1] = Math.min(255, g); d[i + 2] = Math.min(255, b); d[i + 3] = edge > .01 ? 255 : 0
        }
      }
      x.putImageData(imgData, 0, 0)
      x.font = `bold ${Math.min(w, h) * .22}px Syne, sans-serif`
      x.textAlign = 'center'; x.textBaseline = 'middle'
      x.fillStyle = 'rgba(200,210,230,.9)'
      x.fillText('LOGO', cx, cy)
      x.font = `bold ${Math.min(w, h) * .06}px Inter, sans-serif`
      x.fillStyle = 'rgba(150,170,200,.5)'
      x.fillText('LIQUID METAL', cx, cy + Math.min(w, h) * .18)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <div className="card-stage"><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
}

// ===== Inspired by pmndrs/R3F examples — floating wireframe torus knots =====
function WireframeTorusKnots() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h)
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0e1a'); g.addColorStop(1, '#0f172a'); x.fillStyle = g; x.fillRect(0, 0, w, h)
    const time = t * .0008, cx = w / 2, cy = h / 2
    for (let k = 0; k < 3; k++) {
      const ox = Math.cos(time + k * 2.1) * w * .2, oy = Math.sin(time * .7 + k * 1.5) * h * .15
      const R = Math.min(w, h) * .12, r2 = R * .35, segs = 48, tubes = 12
      const pts = []
      for (let i = 0; i <= segs; i++) {
        const u = (i / segs) * Math.PI * 2
        const px = (R + r2 * Math.cos(tubes * u + time)) * Math.cos(u)
        const py = (R + r2 * Math.cos(tubes * u + time)) * Math.sin(u)
        const pz = r2 * Math.sin(tubes * u + time)
        const scale = 300 / (300 + pz)
        pts.push({ x: cx + ox + px * scale, y: cy + oy + py * scale * .6, z: pz, s: scale })
      }
      x.beginPath()
      pts.forEach((p, i) => { i === 0 ? x.moveTo(p.x, p.y) : x.lineTo(p.x, p.y) })
      x.strokeStyle = `hsla(${220 + k * 30},70%,60%,.7)`; x.lineWidth = 1.5; x.stroke()
      pts.forEach(p => {
        x.beginPath(); x.arc(p.x, p.y, 1.5 * p.s, 0, Math.PI * 2)
        x.fillStyle = `hsla(${220 + k * 30},80%,70%,${.3 + p.s * .3})`; x.fill()
      })
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== Inspired by pmndrs/R3F — kinetic scattered squares =====
function KineticSquares() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h)
    const time = t * .001, cx = w / 2, cy = h / 2
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 + time * .3
      const r = 50 + i * 2.5 + Math.sin(time + i * .5) * 30
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r * .5
      const size = 8 + Math.sin(time * 2 + i) * 4
      const rot = time + i * .3
      const hue = 220 + (i / 60) * 60
      const al = .15 + (i / 60) * .5
      x.save(); x.translate(px, py); x.rotate(rot)
      x.fillStyle = `hsla(${hue},65%,55%,${al})`
      x.fillRect(-size / 2, -size / 2, size, size)
      x.restore()
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== Inspired by shadergradient — domain warped flow field =====
function FlowFieldWarp() {
  const draw = useCallback((x, w, h, t) => {
    const img = x.createImageData(w, h)
    const time = t * .0002
    for (let y = 0; y < h; y += 3) for (let c = 0; c < w; c += 3) {
      const u = c / w * 4, v = y / h * 4
      const w1 = Math.sin(u + time) + Math.sin(u * .5 + v * .5 + time * 1.3)
      const w2 = Math.cos(v + time * .8) + Math.cos(u * .3 - v * .7 + time)
      const warp = Math.sin(u + w1 + time) * Math.cos(v + w2 - time * .6)
      const n = Math.sin(warp * 3 + time) * .5 + .5
      const r = 40 + n * 120 + Math.cos(w1) * 50 | 0
      const g = 80 + n * 80 + Math.sin(w2) * 60 | 0
      const b = 180 + n * 75 | 0
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
        const i = ((y + dy) * w + (c + dx)) * 4
        img.data[i] = Math.max(0, Math.min(255, r)); img.data[i + 1] = Math.max(0, Math.min(255, g)); img.data[i + 2] = Math.max(0, Math.min(255, b)); img.data[i + 3] = 255
      }
    }
    x.putImageData(img, 0, 0)
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== Inspired by liquid-glass — frosted glass cards =====
function FrostedGlassCards() {
  const ref = useRef(null)
  const mouseRef = useRef({ x: .5, y: .5 })
  useEffect(() => { if (!ref.current) return; const h = e => { const r = ref.current.getBoundingClientRect(); mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } }; ref.current.addEventListener('mousemove', h); return () => ref.current?.removeEventListener('mousemove', h) }, [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h)
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1a1a2e'); g.addColorStop(1, '#16213e'); x.fillStyle = g; x.fillRect(0, 0, w, h)
    const time = t * .001, m = mouseRef.current
    const orbs = [{ x: w * .3, y: h * .4, r: 80, hue: 220 }, { x: w * .7, y: h * .6, r: 60, hue: 280 }, { x: w * .5, y: h * .3, r: 70, hue: 200 }]
    orbs.forEach(o => {
      const ox = o.x + Math.sin(time + o.hue) * 30 + (m.x - .5) * 20
      const oy = o.y + Math.cos(time * .8 + o.hue) * 20 + (m.y - .5) * 15
      const g2 = x.createRadialGradient(ox, oy, 0, ox, oy, o.r)
      g2.addColorStop(0, 'hsla(' + o.hue + ',60%,50%,.25)'); g2.addColorStop(1, 'hsla(' + o.hue + ',60%,50%,0)')
      x.fillStyle = g2; x.fillRect(0, 0, w, h)
    })
    const cards = [{ x: w * .2, y: h * .3, cw: 100, ch: 70 }, { x: w * .55, y: h * .2, cw: 90, ch: 65 }, { x: w * .4, y: h * .55, cw: 110, ch: 75 }]
    cards.forEach(c => {
      x.save(); x.globalAlpha = .15
      x.fillStyle = 'rgba(255,255,255,.3)'
      x.beginPath(); x.moveTo(c.x + 12, c.y); x.lineTo(c.x + c.cw - 12, c.y); x.quadraticCurveTo(c.x + c.cw, c.y, c.x + c.cw, c.y + 12); x.lineTo(c.x + c.cw, c.y + c.ch - 12); x.quadraticCurveTo(c.x + c.cw, c.y + c.ch, c.x + c.cw - 12, c.y + c.ch); x.lineTo(c.x + 12, c.y + c.ch); x.quadraticCurveTo(c.x, c.y + c.ch, c.x, c.y + c.ch - 12); x.lineTo(c.x, c.y + 12); x.quadraticCurveTo(c.x, c.y, c.x + 12, c.y); x.closePath(); x.fill()
      x.globalAlpha = 1
      x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1; x.stroke()
      x.restore()
    })
  }, [])
  const canvasRef = useCanvas(draw)
  return <div className="card-stage" ref={ref}><canvas ref={canvasRef} /></div>
}

// ===== 36: Metaballs — organic merging blobs (WebGL) =====
function Metaballs() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl'); if (!gl) return
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; gl.viewport(0, 0, w, h) }
    resize(); const ro = new ResizeObserver(resize); ro.observe(c.parentElement)
    const vs = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0,1);}`
    const fs = `precision mediump float;uniform float u_t;uniform vec2 u_res;
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*u_res)/min(u_res.x,u_res.y);
      float t=u_t;
      vec2 b1=vec2(sin(t*.7)*.4,cos(t*.9)*.3);
      vec2 b2=vec2(cos(t*.5)*.35,sin(t*1.1)*.35);
      vec2 b3=vec2(sin(t*.8+.5)*.3,cos(t*.6+.8)*.25);
      vec2 b4=vec2(cos(t*1.2)*.2,sin(t*.4)*.4);
      float d1=length(uv-b1),d2=length(uv-b2),d3=length(uv-b3),d4=length(uv-b4);
      float m=1./(d1*d1*40.)+1./(d2*d2*40.)+1./(d3*d3*45.)+1./(d4*d4*50.);
      vec3 col=vec3(0);
      if(m>.8){
        float shade=smoothstep(.8,3.,m);
        col=mix(vec3(.15,.4,.9),vec3(.6,.3,.9),shade*.6);
        col+=vec3(.1)*smoothstep(2.5,4.,m);
      }else{
        col=vec3(.04,.06,.12);
      }
      gl_FragColor=vec4(col,1);
    }`
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
    const prog = gl.createProgram(); gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u_t = gl.getUniformLocation(prog, 'u_t'), u_res = gl.getUniformLocation(prog, 'u_res')
    const loop = (t) => { gl.uniform1f(u_t, t * .001); gl.uniform2f(u_res, w, h); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <div className="card-stage" style={{ background: '#0a0e1a' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} /></div>
}

// ===== 37: Kaleidoscope — mirror-image rotating patterns =====
function Kaleidoscope() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h)
    x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, time = t * .001, segments = 8, angle = Math.PI * 2 / segments
    x.save(); x.translate(cx, cy)
    for (let s = 0; s < segments; s++) {
      x.save(); x.rotate(angle * s + time * .3)
      if (s % 2 === 1) x.scale(-1, 1)
      for (let i = 0; i < 12; i++) {
        const r = 30 + i * 18, a = Math.sin(time * 2 + i * .5) * .3 + time * .5
        const px = Math.cos(a) * r, py = Math.sin(a) * r
        const size = 4 + Math.sin(time * 3 + i) * 3
        x.beginPath(); x.arc(px, py, size, 0, Math.PI * 2)
        x.fillStyle = `hsla(${220 + i * 15 + s * 20},70%,60%,${.6 - i * .04})`
        x.fill()
      }
      x.restore()
    }
    x.restore()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== 38: Caustics Water — underwater light refraction patterns =====
function CausticsWater() {
  const draw = useCallback((x, w, h, t) => {
    const img = x.createImageData(w, h), time = t * .0004
    for (let y = 0; y < h; y += 3) for (let c = 0; c < w; c += 3) {
      const u = c / w * 8, v = y / h * 8
      const c1 = Math.sin(u + time) * Math.cos(v - time * .7)
      const c2 = Math.sin(u * 1.3 + v * .7 + time * 1.2)
      const c3 = Math.cos(u * .8 - v * 1.5 + time * .9)
      const caustic = Math.pow(Math.abs(Math.sin((c1 + c2 + c3) * 3)), 8) * 3
      const r = 10 + caustic * 40 | 0, g = 40 + caustic * 100 | 0, b = 80 + caustic * 120 | 0
      for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
        const i = ((y + dy) * w + (c + dx)) * 4
        img.data[i] = Math.min(255, r); img.data[i + 1] = Math.min(255, g); img.data[i + 2] = Math.min(255, b); img.data[i + 3] = 255
      }
    }
    x.putImageData(img, 0, 0)
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage" style={{ background: '#041420' }}><canvas ref={ref} /></div>
}

// ===== 39: Fractal Zoom — infinite Mandelbrot zoom =====
function FractalZoom() {
  const draw = useCallback((x, w, h, t) => {
    const img = x.createImageData(w, h), time = t * .00005
    const zoom = Math.pow(2, -time % 12)
    const cx = -0.745 + Math.sin(time * .3) * .1, cy = .186 + Math.cos(time * .2) * .1
    const maxIter = 60
    for (let y = 0; y < h; y += 2) for (let c = 0; c < w; c += 2) {
      const zx = (c - w / 2) / (w * .35) / zoom + cx
      const zy = (y - h / 2) / (h * .35) / zoom + cy
      let x2 = 0, y2 = 0, iter = 0
      while (x2 * x2 + y2 * y2 < 4 && iter < maxIter) { const xt = x2 * x2 - y2 * y2 + zx; y2 = 2 * x2 * y2 + zy; x2 = xt; iter++ }
      const hue = (iter / maxIter * 360 + time * 50) % 360
      const bright = iter === maxIter ? 0 : .5 + .5 * Math.cos(iter * .15 + time * 3)
      const [r, g, b] = iter === maxIter ? [5, 5, 15] : hsl2rgb(hue, .8, bright)
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const i = ((y + dy) * w + (c + dx)) * 4
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255
      }
    }
    x.putImageData(img, 0, 0)
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== 40: Aurora Borealis — northern lights that follow cursor =====
function Aurora() {
  const mouseRef = useRef({ x: .5, y: .5 })
  const wrapRef = useRef(null)
  useEffect(() => { if (!wrapRef.current) return; const h = e => { const r = wrapRef.current.getBoundingClientRect(); mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } }; wrapRef.current.addEventListener('mousemove', h); return () => wrapRef.current?.removeEventListener('mousemove', h) }, [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h)
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#050a15'); g.addColorStop(.4, '#0a1628'); g.addColorStop(1, '#0f172a'); x.fillStyle = g; x.fillRect(0, 0, w, h)
    const time = t * .0006, m = mouseRef.current
    for (let i = 0; i < 5; i++) {
      const yBase = h * (.15 + i * .08) + Math.sin(time + i) * 30
      x.beginPath(); x.moveTo(0, yBase)
      for (let c = 0; c < w; c += 4) {
        const nx = c / w
        const wave = Math.sin(nx * 6 + time + i * .8) * 25 + Math.sin(nx * 12 + time * 1.5) * 12
        const mouseInfluence = Math.exp(-Math.pow((nx - m.x) * 4, 2)) * (m.y - .5) * -60
        x.lineTo(c, yBase + wave + mouseInfluence)
      }
      x.lineTo(w, yBase + 80); x.lineTo(0, yBase + 80); x.closePath()
      const hue = 140 + i * 25 + Math.sin(time + i) * 10
      x.fillStyle = `hsla(${hue},70%,50%,${.08 - i * .012})`
      x.fill()
    }
  }, [])
  const canvasRef = useCanvas(draw)
  return <div className="card-stage" ref={wrapRef}><canvas ref={canvasRef} /></div>
}

// ===== 41: Voronoi Cells — organic cell patterns =====
function VoronoiCells() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h)
    const time = t * .0005, cols = 12, rows = 8
    const pts = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      pts.push({
        x: (c + .5) / cols * w + Math.sin(time + r * .7 + c * .5) * 25,
        y: (r + .5) / rows * h + Math.cos(time * .8 + c * .9 + r * .3) * 20,
        hue: 220 + (r * cols + c) * 2
      })
    }
    const img = x.createImageData(w, h)
    for (let y = 0; y < h; y += 2) for (let c = 0; c < w; c += 2) {
      let minD = Infinity, minD2 = Infinity, hue = 0
      for (const p of pts) {
        const d = Math.hypot(c - p.x, y - p.y)
        if (d < minD) { minD2 = minD; minD = d; hue = p.hue }
        else if (d < minD2) minD2 = d
      }
      const edge = 1 - Math.min(1, (minD2 - minD) / 6)
      const r = 60 + edge * 180 | 0, g = 80 + edge * 140 | 0, b = 220 - edge * 30 | 0
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const i = ((y + dy) * w + (c + dx)) * 4
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255
      }
    }
    x.putImageData(img, 0, 0)
    pts.forEach(p => { x.beginPath(); x.arc(p.x, p.y, 3, 0, Math.PI * 2); x.fillStyle = '#2563eb'; x.fill() })
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== 42: Audio Visualizer — mic-driven or auto-oscillating frequency =====
function AudioVisualizer() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, bars = 48
    for (let i = 0; i < bars; i++) {
      const freq = Math.sin(time * 2 + i * .3) * .4 + Math.sin(time * 3.7 + i * .15) * .3 + Math.cos(time * 1.3 + i * .5) * .2 + Math.sin(time * 5.1 + i * .08) * .1
      const amp = Math.abs(freq)
      const bh = amp * h * .7
      const bx = (i / bars) * w + (w / bars) * .15
      const bw = (w / bars) * .7
      const hue = 220 + (i / bars) * 80
      const g = x.createLinearGradient(bx, h, bx, h - bh)
      g.addColorStop(0, `hsla(${hue},70%,55%,.9)`); g.addColorStop(1, `hsla(${hue + 30},80%,70%,.4)`)
      x.fillStyle = g
      x.beginPath(); x.moveTo(bx + 2, h); x.lineTo(bx + 2, h - bh + 2); x.quadraticCurveTo(bx + bw / 2, h - bh - 4, bx + bw - 2, h - bh + 2); x.lineTo(bx + bw - 2, h); x.closePath(); x.fill()
      x.beginPath(); x.arc(bx + bw / 2, h - bh - 2, 2.5, 0, Math.PI * 2)
      x.fillStyle = `hsla(${hue + 30},90%,75%,.8)`; x.fill()
    }
    x.beginPath(); x.moveTo(0, h)
    for (let i = 0; i <= bars; i++) {
      const freq = Math.sin(time * 2 + i * .3) * .4 + Math.sin(time * 3.7 + i * .15) * .3 + Math.cos(time * 1.3 + i * .5) * .2
      const x2 = (i / bars) * w, y2 = h - Math.abs(freq) * h * .7 - 6
      if (i === 0) x.moveTo(x2, y2); else x.lineTo(x2, y2)
    }
    x.strokeStyle = 'rgba(96,165,250,.25)'; x.lineWidth = 1.5; x.stroke()
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== 43: Lava Lamp — smooth organic blobs =====
function LavaLamp() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#1a0a0a'; x.fillRect(0, 0, w, h)
    const time = t * .0004
    const blobs = [
      { x: w * .5 + Math.sin(time) * w * .2, y: h * .3 + Math.cos(time * .7) * 40, r: 55 + Math.sin(time * 2) * 15 },
      { x: w * .4 + Math.cos(time * .8) * w * .15, y: h * .6 + Math.sin(time * 1.1) * 30, r: 45 + Math.cos(time * 1.5) * 10 },
      { x: w * .6 + Math.sin(time * 1.2) * w * .1, y: h * .5 + Math.cos(time * .6) * 35, r: 40 + Math.sin(time * 1.8) * 12 },
      { x: w * .5 + Math.cos(time * .5) * w * .18, y: h * .75 + Math.sin(time * .9) * 25, r: 35 + Math.cos(time * 2.2) * 8 }
    ]
    blobs.forEach(b => {
      const g = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
      g.addColorStop(0, 'rgba(220,50,30,.6)'); g.addColorStop(.5, 'rgba(200,30,20,.3)'); g.addColorStop(1, 'rgba(180,20,10,0)')
      x.fillStyle = g; x.beginPath(); x.arc(b.x, b.y, b.r, 0, Math.PI * 2); x.fill()
    })
    blobs.forEach(b => {
      const highlight = x.createRadialGradient(b.x - b.r * .25, b.y - b.r * .25, 0, b.x, b.y, b.r * .6)
      highlight.addColorStop(0, 'rgba(255,120,80,.25)'); highlight.addColorStop(1, 'rgba(255,60,30,0)')
      x.fillStyle = highlight; x.beginPath(); x.arc(b.x, b.y, b.r * .6, 0, Math.PI * 2); x.fill()
    })
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage" style={{ background: '#1a0a0a' }}><canvas ref={ref} /></div>
}

// ===== 44: Confetti Burst — celebration particles =====
function ConfettiBurst() {
  const ref = useRef(null)
  const particles = useRef([])
  const burstTime = useRef(0)
  useEffect(() => {
    const el = ref.current, c = el.querySelector('canvas'), x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = el.offsetWidth; h = c.height = el.offsetHeight }
    resize(); const ro = new ResizeObserver(resize); ro.observe(el)
    const colors = ['#2563eb', '#7c3aed', '#f59e0b', '#22c55e', '#ef4444', '#ec4899']
    const spawn = () => {
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2, speed = 3 + Math.random() * 6
        particles.current.push({
          x: w / 2, y: h * .3, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
          w: 4 + Math.random() * 6, h: 3 + Math.random() * 4, color: colors[Math.random() * colors.length | 0],
          rot: Math.random() * Math.PI * 2, rotV: (Math.random() - .5) * .3, life: 1, gravity: .12 + Math.random() * .08
        })
      }
    }
    spawn()
    const loop = () => {
      x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h)
      burstTime.current++
      if (burstTime.current % 120 === 0) { particles.current = []; spawn() }
      particles.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= .99; p.rot += p.rotV; p.life -= .005
        x.save(); x.translate(p.x, p.y); x.rotate(p.rot)
        x.globalAlpha = Math.max(0, p.life); x.fillStyle = p.color
        x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        x.restore()
      })
      particles.current = particles.current.filter(p => p.life > 0 && p.y < h + 20)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <div ref={ref} className="card-stage" style={{ cursor: 'pointer' }} onClick={() => { burstTime.current = 119 }}><canvas /></div>
}

// ===== 45: Sine Wave Mesh — 3D dot grid forming sine waves =====
function SineWaveMesh() {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cols = 22, rows = 16
    const dotArr = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const u = (c / (cols - 1) - .5) * w * .8, v = (r / (rows - 1) - .5) * h * .6
      const wave = Math.sin(c * .4 + time * 2) * Math.cos(r * .3 + time * 1.5) * 30
      const depth = Math.cos(c * .3 + time) * Math.sin(r * .25 + time * .8)
      const scale = 1 + depth * .15
      const px = w / 2 + u * scale, py = h / 2 + v * scale + wave
      const size = 1.5 + depth * 1.5
      const hue = 220 + depth * 40
      dotArr.push({ px, py, size, hue, depth })
    }
    for (let r = 0; r < rows; r++) {
      x.beginPath()
      for (let c = 0; c < cols; c++) {
        const p = dotArr[r * cols + c]
        c === 0 ? x.moveTo(p.px, p.py) : x.lineTo(p.px, p.py)
      }
      x.strokeStyle = 'rgba(96,165,250,.08)'; x.lineWidth = 1; x.stroke()
    }
    for (let c = 0; c < cols; c++) {
      x.beginPath()
      for (let r = 0; r < rows; r++) {
        const p = dotArr[r * cols + c]
        r === 0 ? x.moveTo(p.px, p.py) : x.lineTo(p.px, p.py)
      }
      x.strokeStyle = 'rgba(96,165,250,.06)'; x.lineWidth = 1; x.stroke()
    }
    dotArr.forEach(p => {
      x.beginPath(); x.arc(p.px, p.py, Math.max(1, p.size), 0, Math.PI * 2)
      x.fillStyle = `hsla(${p.hue},70%,${55 + p.depth * 15}%,${.5 + p.depth * .3})`
      x.fill()
    })
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
}

// ===== Helper for fractal =====
function hsl2rgb(h, s, l) {
  h /= 360; const a = s * Math.min(l, 1 - l)
  const f = n => { const k = (n + h * 12) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1) }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// Extra effects
const extraEffects = [
  { name: 'Connected Dots', tags: ['Canvas'], draw: (x, w, h, t) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h); const pts = Array.from({ length: 25 }, (_, i) => ({ x: w * .1 + (i % 5) * w * .18, y: h * .2 + Math.floor(i / 5) * h * .25 + Math.sin(t * .001 + i) * 12 })); pts.forEach((p, i) => { pts.forEach((q, j) => { if (i < j && Math.hypot(p.x - q.x, p.y - q.y) < 120) { x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.strokeStyle = `rgba(37,99,235,${.12 * (1 - Math.hypot(p.x - q.x, p.y - q.y) / 120)})`; x.lineWidth = 1; x.stroke() } }); x.beginPath(); x.arc(p.x, p.y, 3, 0, Math.PI * 2); x.fillStyle = '#2563eb'; x.fill() }) }},
  { name: 'Star Field', tags: ['Canvas'], draw: (x, w, h, t) => { x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h); for (let i = 0; i < 100; i++) { const sx = (i * 137.5 + t * .02) % w, sy = (i * 97.3 + t * .01) % h, sr = .5 + Math.sin(i + t * .003) * .5; x.beginPath(); x.arc(sx, sy, sr + .5, 0, Math.PI * 2); x.fillStyle = `rgba(255,255,255,${.3 + sr})`; x.fill() } }},
  { name: 'DNA Helix', tags: ['Canvas'], draw: (x, w, h, t) => { x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h); const cx = w / 2, cy = h / 2; for (let i = 0; i < 25; i++) { const y = i * 11 - 140, a1 = i * .4 + t * .002, x1 = cx + Math.sin(a1) * 40, x2 = cx + Math.sin(a1 + Math.PI) * 40; x.beginPath(); x.arc(x1, cy + y, 2.5, 0, Math.PI * 2); x.fillStyle = '#2563eb'; x.fill(); x.beginPath(); x.arc(x2, cy + y, 2.5, 0, Math.PI * 2); x.fillStyle = '#7c3aed'; x.fill(); if (i % 3 === 0) { x.beginPath(); x.moveTo(x1, cy + y); x.lineTo(x2, cy + y); x.strokeStyle = 'rgba(37,99,235,.12)'; x.lineWidth = 1; x.stroke() } } }},
  { name: 'Fireworks', tags: ['Canvas'], draw: (x, w, h, t) => { x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h); const b = t % 2800; for (let i = 0; i < 35; i++) { const a = (i / 35) * Math.PI * 2, d = b * .07, px = w / 2 + Math.cos(a) * d, py = h / 2 + Math.sin(a) * d - b * .018, al = Math.max(0, 1 - b / 2800); x.beginPath(); x.arc(px, py, 1.5 * al + 1, 0, Math.PI * 2); x.fillStyle = `hsla(${i * 10 + 200},80%,60%,${al})`; x.fill() } }},
  { name: 'Galaxy Spiral', tags: ['Canvas'], draw: (x, w, h, t) => { x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h); const cx = w / 2, cy = h / 2; for (let i = 0; i < 250; i++) { const a = i * .08 + t * .0003, d = i * .55 + Math.sin(i * .1 + t * .001) * 8, px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d * .35; x.beginPath(); x.arc(px, py, .7 + Math.random(), 0, Math.PI * 2); x.fillStyle = `hsla(${220 + i * .3},70%,60%,${Math.max(.1, 1 - i / 250)})`; x.fill() } }},
  { name: 'Matrix Rain', tags: ['Canvas'], draw: (x, w, h, t) => { x.fillStyle = 'rgba(15,23,42,.07)'; x.fillRect(0, 0, w, h); x.font = '11px monospace'; x.fillStyle = '#22c55e'; for (let i = 0; i < Math.floor(w / 13); i++) { x.fillText(String.fromCharCode(0x30a0 + Math.random() * 96), i * 13, (t * .04 + i * 35) % h) } }},
  { name: 'Gradient Mesh', tags: ['Canvas'], draw: (x, w, h, t) => { const img = x.createImageData(w, h); for (let y = 0; y < h; y += 4) for (let c = 0; c < w; c += 4) { const nx = c / w, ny = y / h, r = Math.sin(nx * 4 + t * .001) * 40 + 180 | 0, g = Math.sin(ny * 3 + t * .0012) * 30 + 200 | 0, b = Math.sin((nx + ny) * 2 + t * .0008) * 20 + 230 | 0; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) { const i = ((y + dy) * w + (c + dx)) * 4; img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255 } } x.putImageData(img, 0, 0) }},
  { name: 'Particle Trail', tags: ['Canvas', 'Interactive'], custom: () => { const ref = useRef(null); const pts = useRef([]); useEffect(() => { const el = ref.current, c = el.querySelector('canvas'), x = c.getContext('2d'); let w, h, raf; const resize = () => { w = c.width = el.offsetWidth; h = c.height = el.offsetHeight }; resize(); const ro = new ResizeObserver(resize); ro.observe(el); const move = e => { const r = el.getBoundingClientRect(); pts.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, life: 1 }) }; el.addEventListener('mousemove', move); const draw = () => { x.clearRect(0, 0, w, h); x.fillStyle = '#f8fafc'; x.fillRect(0, 0, w, h); pts.current = pts.current.filter(p => p.life > 0); pts.current.forEach(p => { p.life -= .02; p.y += .5; x.beginPath(); x.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2); x.fillStyle = 'rgba(37,99,235,' + p.life + ')'; x.fill() }); raf = requestAnimationFrame(draw) }; raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); ro.disconnect(); el.removeEventListener('mousemove', move) } }, []); return <div ref={ref} className="card-stage" style={{ cursor: 'crosshair' }}><canvas /></div> }},
  { name: 'Ripple Click', tags: ['CSS', 'Interactive'], custom: () => { const [r, setR] = useState([]); return <div className="card-stage" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={e => { const rc = e.currentTarget.getBoundingClientRect(); setR(rp => [...rp, { x: e.clientX - rc.left, y: e.clientY - rc.top, id: Date.now() }]); setTimeout(() => setR(rp => rp.slice(1)), 800) }}>{r.map(rp => <div key={rp.id} style={{ position: 'absolute', left: rp.x - 40, top: rp.y - 40, width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--accent)', animation: 'ripple .8s ease-out forwards' }} />)}<style>{`@keyframes ripple{from{transform:scale(0);opacity:.6}to{transform:scale(4);opacity:0}}`}</style><span style={{ color: 'var(--text4)', fontSize: 12 }}>Click</span></div> }},
  { name: 'Wave Divider', tags: ['SVG'], custom: () => <div className="card-stage" style={{ display: 'flex', alignItems: 'flex-end' }}><svg width="100%" height="100" viewBox="0 0 700 100" preserveAspectRatio="none"><path fill="var(--accent)" fillOpacity=".15"><animate attributeName="d" values="M0,50 C175,15 350,85 700,50 L700,100 L0,100Z;M0,50 C175,85 350,15 700,50 L700,100 L0,100Z;M0,50 C175,15 350,85 700,50 L700,100 L0,100Z" dur="4s" repeatCount="indefinite" /></path><path fill="var(--accent)" fillOpacity=".08"><animate attributeName="d" values="M0,65 C175,30 350,85 700,60 L700,100 L0,100Z;M0,60 C175,85 350,30 700,65 L700,100 L0,100Z;M0,65 C175,30 350,85 700,60 L700,100 L0,100Z" dur="5s" repeatCount="indefinite" /></path></svg></div> },
  { name: 'Circular Progress', tags: ['SVG'], custom: () => <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>{[75, 90, 60].map((v, i) => <svg key={i} width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" fill="none" stroke="var(--border)" strokeWidth="4" /><circle cx="35" cy="35" r="30" fill="none" stroke="var(--accent)" strokeWidth="4" strokeDasharray={`${v * 1.88} 188`} strokeLinecap="round" transform="rotate(-90 35 35)" /><text x="35" y="39" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">{v}%</text></svg>)}</div> },
  { name: 'Gradient Text', tags: ['CSS'], custom: () => <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, background: 'linear-gradient(90deg,var(--accent),var(--accent2),var(--accent3),#f59e0b,var(--accent))', backgroundSize: '300% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradText 3s linear infinite' }}>EVOLECT</div><style>{`@keyframes gradText{from{background-position:0% 50%}to{background-position:300% 50%}}`}</style></div> },
  { name: 'Bounce In', tags: ['CSS', 'Scroll'], custom: () => { const [ref, visible] = useInView(.3); return <div className="card-stage" ref={ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ padding: '12px 28px', borderRadius: 10, background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 14, transform: visible ? 'scale(1)' : 'scale(0)', transition: 'transform .6s cubic-bezier(.68,-.55,.27,1.55)' }}>Bounce!</div></div> }},
  { name: 'Typing Effect', tags: ['CSS'], custom: () => { const [text, setText] = useState(''); const full = 'that.jainam — Demo'; useEffect(() => { let i = 0; const id = setInterval(() => { setText(full.slice(0, i)); i++; if (i > full.length) i = 0 }, 80); return () => clearInterval(id) }, []); return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800 }}>{text}<span style={{ animation: 'blink .8s infinite' }}>|</span></div><style>{`@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}`}</style></div> }},
  { name: 'Blur Fade', tags: ['CSS', 'Scroll'], custom: () => { const [ref, visible] = useInView(.3); return <div className="card-stage" ref={ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, filter: visible ? 'blur(0)' : 'blur(10px)', opacity: visible ? 1 : 0, transition: 'all .8s' }}>Crystal Clear</div></div> }},
  { name: 'Spin Reveal', tags: ['CSS', 'Scroll'], custom: () => { const [ref, visible] = useInView(.3); return <div className="card-stage" ref={ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 70, height: 70, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', transform: visible ? 'rotate(0) scale(1)' : 'rotate(-180deg) scale(0)', transition: 'transform .7s cubic-bezier(.4,0,.2,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 22 }}>E</div></div> }},
  { name: 'Slide Stack', tags: ['CSS', 'Scroll'], custom: () => { const [ref, visible] = useInView(.3); return <div className="card-stage" ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{['Post Events', 'Find Volunteers', 'Build Reputation'].map((t, i) => <div key={i} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, transform: visible ? 'translateY(0)' : `translateY(${35 - i * 12}px)`, opacity: visible ? 1 : 0, transition: `all .5s ${i * 100}ms`, transitionProperty: 'transform, opacity, background, border-color' }}>{t}</div>)}</div> }},
  { name: 'Elastic Scale', tags: ['CSS'], custom: () => <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 90, height: 90, borderRadius: 18, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', cursor: 'pointer', transition: 'transform .5s cubic-bezier(.68,-.55,.27,1.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>E</div></div> },
  { name: 'Border Draw', tags: ['SVG', 'Scroll'], custom: () => { const [ref, visible] = useInView(.3); return <div className="card-stage" ref={ref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="180" height="100" viewBox="0 0 180 100"><rect x="5" y="5" width="170" height="90" rx="14" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="520" strokeDashoffset={visible ? 0 : 520} style={{ transition: 'stroke-dashoffset 1.5s' }} /><text x="90" y="55" textAnchor="middle" fontFamily="Syne" fontWeight="800" fontSize="18" fill="var(--text)">EVOLECT</text></svg></div> }},
  { name: 'Loading Dots', tags: ['CSS'], custom: () => <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', animation: `dot .6s ease-in-out ${i * .1}s infinite alternate` }} />)}<style>{`@keyframes dot{from{transform:scale(.6);opacity:.4}to{transform:scale(1);opacity:1}}`}</style></div> },
  { name: 'Pulse Ring', tags: ['CSS'], custom: () => <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ position: 'relative', width: 80, height: 80 }}>{[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--accent)', animation: `pulseRing 2s ease-out ${i * .6}s infinite` }} />)}<div style={{ position: 'absolute', inset: 25, borderRadius: '50%', background: 'var(--accent)' }} /></div><style>{`@keyframes pulseRing{from{transform:scale(.5);opacity:1}to{transform:scale(2.5);opacity:0}}`}</style></div> },
  { name: 'Floating Cubes', tags: ['CSS', '3D'], custom: () => <div className="card-stage" style={{ perspective: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 65, height: 65, transformStyle: 'preserve-3d', animation: 'cube3d 4s ease-in-out infinite' }}>{[0, 90, 180, 270].map((r, i) => <div key={i} style={{ position: 'absolute', width: 65, height: 65, background: `hsla(${220 + i * 20},70%,55%,${.3 + i * .12})`, border: '1px solid rgba(37,99,235,.2)', transform: `rotateY(${r}deg) translateZ(32px)` }} />)}</div><style>{`@keyframes cube3d{0%{transform:rotateX(0) rotateY(0)}100%{transform:rotateX(360deg) rotateY(360deg)}}`}</style></div> },
  { name: 'Color Bars', tags: ['CSS'], custom: () => <div className="card-stage" style={{ display: 'flex', padding: 14, gap: 5, alignItems: 'flex-end' }}>{Array.from({ length: 10 }, (_, i) => <div key={i} style={{ flex: 1, borderRadius: 5, background: `hsl(${220 + i * 12},70%,60%)`, animation: `bar ${1.4 + i * .1}s ease-in-out infinite alternate` }} />)}<style>{`@keyframes bar{from{height:20%}to{height:80%}}`}</style></div> },
]

// ==================== R3F-STYLE EFFECTS (Canvas 2D) ====================
// ponytail: rewrote R3F scenes as Canvas 2D — avoids WebGL context limit, same visual effect

const R3FScrollCubes = memo(() => {
  const cubes = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    x: (Math.random() - .5) * .6, y: (Math.random() - .5) * .4,
    s: .03 + Math.random() * .03, rot: Math.random() * 6.28,
    speed: .3 + Math.random() * .5, hue: 210 + Math.random() * 40
  })), [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, time = t * .001
    cubes.forEach((c, i) => {
      const rx = Math.cos(time * .3 + i) * c.x, ry = Math.sin(time * .2 + i) * c.y
      const sz = c.s * Math.min(w, h) * (1 + Math.sin(time + i) * .3)
      const rot = time * c.speed + c.rot
      x.save(); x.translate(cx + rx * w, cy + ry * h); x.rotate(rot)
      x.fillStyle = `hsla(${c.hue},60%,55%,.7)`; x.fillRect(-sz / 2, -sz / 2, sz, sz)
      x.strokeStyle = `hsla(${c.hue},70%,65%,.3)`; x.lineWidth = 1; x.strokeRect(-sz / 2, -sz / 2, sz, sz)
      x.restore()
    })
  }, [cubes])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
})

const R3FGlobe = memo(() => {
  const cities = useMemo(() => [
    [40, -74], [51, 0], [35, 139], [-34, 151], [1.3, 103.8],
    [48, 2], [55, 37], [19, 72], [34, 118], [-23, -46],
    [52, 13], [41, 29], [37, 127], [22, 114], [30, 31]
  ], [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * .32, time = t * .0002
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.strokeStyle = 'rgba(37,99,235,.15)'; x.lineWidth = 1; x.stroke()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2; x.beginPath(); x.ellipse(cx, cy, r * Math.abs(Math.cos(a)), r, 0, 0, Math.PI * 2)
      x.strokeStyle = 'rgba(37,99,235,.07)'; x.stroke()
    }
    cities.forEach(([lat, lon], i) => {
      const phi = (90 - lat) * Math.PI / 180, theta = (lon + 180) * Math.PI / 180 + time
      const px = cx + r * .9 * Math.sin(phi) * Math.cos(theta)
      const py = cy - r * .9 * Math.cos(phi)
      const depth = Math.sin(phi) * Math.sin(theta)
      if (depth > -.2) {
        x.beginPath(); x.arc(px, py, 2.5 + depth * 1.5, 0, Math.PI * 2)
        x.fillStyle = `rgba(37,99,235,${.4 + depth * .5})`; x.fill()
      }
    })
  }, [cities])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
})

const R3FParticles = memo(() => {
  const count = 200
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2, r = Math.random() * 2
    return { tx: Math.cos(a) * .8, ty: Math.sin(a) * .8, sx: (Math.random() - .5) * 2, sy: (Math.random() - .5) * 2, speed: .002 + Math.random() * .003 }
  }), [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, time = t * .001, blend = (Math.sin(time * .5) + 1) / 2
    particles.forEach((p, i) => {
      const px = cx + (p.sx + (p.tx - p.sx) * blend) * Math.min(w, h) * .4
      const py = cy + (p.sy + (p.ty - p.sy) * blend) * Math.min(w, h) * .4
      const alpha = .3 + blend * .5
      x.beginPath(); x.arc(px, py, 1.5 + blend, 0, Math.PI * 2)
      x.fillStyle = `rgba(37,99,235,${alpha})`; x.fill()
    })
  }, [particles])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
})

const R3FLayers = memo(() => {
  const layers = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    y: (i - 2) * 25, speed: .001 * (i + 1), hue: 210 + i * 15, width: .3 + i * .12
  })), [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001
    layers.forEach((l, i) => {
      const yOff = l.y + Math.sin(time * l.speed * 1000 + i) * 8
      const lw = w * l.width, lh = h * .08
      x.fillStyle = `hsla(${l.hue},50%,50%,${.15 + i * .08})`
      x.beginPath(); x.roundRect(w / 2 - lw / 2, h / 2 + yOff - lh / 2, lw, lh, 8); x.fill()
    })
  }, [layers])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
})

const R3FGrid = memo(() => {
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const time = t * .001, cols = 10, rows = 8, cw = w / (cols + 1), ch = h / (rows + 1)
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const px = cw * (c + 1), py = ch * (r + 1)
      const wave = Math.sin(time + c * .5 + r * .3) * 10
      const sz = cw * .4 + Math.sin(time + c + r) * 3
      x.fillStyle = `hsla(${210 + (c + r) * 5},55%,50%,${.3 + Math.sin(time + c * .3) * .15})`
      x.fillRect(px - sz / 2, py - sz / 2 + wave, sz, sz)
    }
  }, [])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
})

const R3FSpiral = memo(() => {
  const dots = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    angle: i * .2, y: (i - 30) * 4, radius: 40 + Math.sin(i * .15) * 20
  })), [])
  const draw = useCallback((x, w, h, t) => {
    x.clearRect(0, 0, w, h); x.fillStyle = '#0f172a'; x.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h / 2, time = t * .001, spread = (Math.sin(time * .5) + 1) / 2
    dots.forEach((d, i) => {
      const a = d.angle + time * .5, r = d.radius * (.5 + spread * .5) * Math.min(w, h) / 200
      const px = cx + Math.cos(a) * r, py = cy + d.y * (1 + spread * .5) * Math.min(w, h) / 400
      x.beginPath(); x.arc(px, py, 2, 0, Math.PI * 2)
      x.fillStyle = `hsla(${210 + i},60%,55%,${.3 + spread * .4})`; x.fill()
      if (i > 0) {
        const pd = dots[i - 1], pa = pd.angle + time * .5, pr = pd.radius * (.5 + spread * .5) * Math.min(w, h) / 200
        const ppx = cx + Math.cos(pa) * pr, ppy = cy + pd.y * (1 + spread * .5) * Math.min(w, h) / 400
        x.beginPath(); x.moveTo(ppx, ppy); x.lineTo(px, py)
        x.strokeStyle = `rgba(37,99,235,${.1 + spread * .1})`; x.lineWidth = 1; x.stroke()
      }
    })
  }, [dots])
  const ref = useCanvas(draw)
  return <div className="card-stage"><canvas ref={ref} /></div>
})

// ==================== FRAMER-MOTION EFFECTS ====================
const FramerFadeSlide = memo(() => {
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', padding: 20 }}>{[0, 1, 2, 3, 4].map(i => <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .15, duration: .5, ease: 'easeOut' }} style={{ width: 60, height: 60, borderRadius: 12, background: `linear-gradient(135deg,hsl(${220 + i * 25},70%,60%),hsl(${240 + i * 25},60%,50%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>{i + 1}</motion.div>)}</div>
})
const FramerScaleBounce = memo(() => {
  const [tap, setTap] = useState(false)
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><motion.div animate={{ scale: tap ? [1, 1.3, .9, 1.1, 1] : 1 }} transition={{ duration: .5 }} onClick={() => setTap(t => !t)} style={{ width: 100, height: 100, borderRadius: 20, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>Tap</motion.div></div>
})
const FramerStaggerList = memo(() => {
  return <div className="card-stage" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 }}>{['Design', 'Develop', 'Deploy', 'Iterate'].map((t, i) => <motion.div key={t} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .2, type: 'spring', stiffness: 120 }} style={{ padding: '10px 24px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text)', width: 180, textAlign: 'center', transition: 'background .3s,border-color .3s' }}>{t}</motion.div>)}</div>
})
const FramerRotateIn = memo(() => {
  return <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><motion.div initial={{ opacity: 0, rotate: -180, scale: 0 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ duration: .8, type: 'spring', stiffness: 80 }} style={{ width: 110, height: 110, borderRadius: 22, background: 'linear-gradient(135deg,var(--accent),var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24 }}>E</motion.div></div>
})

const CursorFollower = memo(() => {
  const stageRef = useRef(null)
  const trailRef = useRef([])
  const posRef = useRef({ x: 0, y: 0 })
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current, canvas = canvasRef.current
    if (!stage || !canvas) return
    const ctx = canvas.getContext('2d')
    let w, h
    const resize = () => { w = canvas.width = stage.offsetWidth; h = canvas.height = stage.offsetHeight }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(stage)

    const onMove = e => {
      const r = stage.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      posRef.current = { x, y }
      trailRef.current.push({ x, y, life: 1, hue: 210 + Math.random() * 50 })
      if (trailRef.current.length > 24) trailRef.current.shift()
    }
    stage.addEventListener('mousemove', onMove)

    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      const trail = trailRef.current, pos = posRef.current
      const now = performance.now()

      // Draw trail
      trail.forEach((p, i) => {
        p.life -= .025
        if (p.life <= 0) return
        const r = 14 * p.life + 2
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        grad.addColorStop(0, `hsla(${p.hue},70%,55%,${p.life * .45})`)
        grad.addColorStop(1, `hsla(${p.hue},70%,55%,0)`)
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = grad; ctx.fill()
      })
      trailRef.current = trail.filter(p => p.life > 0)

      // Outer ring
      const ringR = 20
      ctx.beginPath(); ctx.arc(pos.x, pos.y, ringR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(37,99,235,.5)'; ctx.lineWidth = 2; ctx.stroke()
      ctx.beginPath(); ctx.arc(pos.x, pos.y, ringR, 0, Math.PI * 2)
      const ringGlow = ctx.createRadialGradient(pos.x, pos.y, ringR - 4, pos.x, pos.y, ringR + 8)
      ringGlow.addColorStop(0, 'rgba(37,99,235,.15)'); ringGlow.addColorStop(1, 'rgba(37,99,235,0)')
      ctx.fillStyle = ringGlow; ctx.fill()

      // Center dot
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#2563eb'; ctx.fill()

      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); stage.removeEventListener('mousemove', onMove) }
  }, [])

  return <div ref={stageRef} className="card-stage" style={{ cursor: 'none' }}>
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
  </div>
})

// ==================== EFFECTS LIST ====================
const allEffects = [
  { id: 1, name: 'ShaderGradient', desc: 'Flowing 3D gradient mesh', tags: ['GPU', 'Animated'], Comp: ShaderGradient },
  { id: 2, name: 'Liquid Glass', desc: 'Apple-inspired glassmorphism', tags: ['WebGL'], Comp: LiquidGlass },
  { id: 3, name: 'R3F Scroll', desc: '3D scene transforms on scroll', tags: ['GPU', 'Scroll'], Comp: R3FScroll },
  { id: 4, name: 'Liquid Logo', desc: 'Flowing liquid metal logo', tags: ['WebGL', 'GLSL'], Comp: LiquidLogo },
  { id: 5, name: 'Floating Geometry', desc: '3D objects with mouse parallax', tags: ['GPU', 'Interactive'], Comp: FloatingGeometry },
  { id: 6, name: 'Post FX', desc: 'Bloom, chromatic aberration', tags: ['GPU', 'Cinematic'], Comp: PostFX },
  { id: 7, name: '3D Card Flip', desc: 'Cards flip on scroll', tags: ['CSS', 'Scroll'], Comp: CardFlip3D },
  { id: 8, name: 'Parallax Depth', desc: 'Multi-layer depth with mouse', tags: ['CSS', 'Interactive'], Comp: ParallaxDepth },
  { id: 9, name: '3D Text Reveal', desc: 'Letters rotate from 3D', tags: ['CSS', 'Scroll'], Comp: TextReveal3D },
  { id: 10, name: 'H-Scroll Cards', desc: 'Vertical scroll drives horizontal', tags: ['CSS', 'Scroll'], Comp: HScrollCards },
  { id: 11, name: 'Magnetic Cursor', desc: 'Elements attracted to cursor', tags: ['JS', 'Interactive'], Comp: MagneticCursor },
  { id: 12, name: 'Flip Grid', desc: 'Grid of cards that flip', tags: ['CSS'], Comp: FlipGrid },
  { id: 13, name: 'Tilt + Glow', desc: '3D tilt with cursor light', tags: ['JS', 'Interactive'], Comp: TiltGlow },
  { id: 14, name: 'Reveal Stagger', desc: 'Fade up in sequence', tags: ['CSS', 'Scroll'], Comp: RevealStagger },
  { id: 15, name: 'Morphing Grid', desc: 'Cells morph on hover', tags: ['CSS'], Comp: MorphingGrid },
  { id: 16, name: 'Particle System', desc: '600+ particles with physics', tags: ['GPU'], Comp: ParticleSystem },
  { id: 17, name: 'Wave Plane', desc: 'Animated wave mesh shader', tags: ['GPU', 'GLSL'], Comp: WavePlane },
  { id: 18, name: 'Neon Glow', desc: 'Animated neon text', tags: ['CSS'], Comp: NeonGlow },
  { id: 19, name: 'Holographic', desc: 'Rainbow iridescent card', tags: ['CSS', 'Interactive'], Comp: HolographicCard },
  { id: 20, name: 'Fluid Blob', desc: 'SVG turbulence morph', tags: ['SVG'], Comp: FluidBlob },
  { id: 21, name: '3D Globe', desc: 'Rotating wireframe globe', tags: ['GPU'], Comp: Globe3D },
  { id: 22, name: 'Noise Abstract', desc: 'Perlin noise procedural', tags: ['Canvas'], Comp: NoiseAbstract },
  { id: 23, name: 'Scroll Tunnel', desc: 'Camera flies through rings', tags: ['GPU', 'Scroll', '3D'], Comp: ScrollTunnel3D },
  { id: 24, name: 'Scroll Particles', desc: 'Particles converge into ring', tags: ['GPU', 'Scroll', '3D'], Comp: ScrollParticles3D },
  { id: 25, name: 'Scroll Morph', desc: 'Geometry morphs on time', tags: ['GPU', 'Scroll', '3D'], Comp: ScrollMorph3D },
  { id: 26, name: 'Scroll Layers', desc: 'Parallax planes at depth', tags: ['GPU', 'Scroll', '3D'], Comp: ScrollLayers3D },
  { id: 27, name: 'Scroll Grid', desc: 'Cubes wave distortion', tags: ['GPU', 'Scroll', '3D'], Comp: ScrollGrid3D },
  { id: 28, name: 'Scroll Spiral', desc: 'Helix dots spread/contract', tags: ['GPU', 'Scroll', '3D'], Comp: ScrollSpiral3D },
  { id: 29, name: 'ShaderGradient Pro', desc: 'Flowing 3D gradient mesh', tags: ['GPU', 'Canvas', 'Animated'], Comp: ShaderGradientPro },
  { id: 30, name: 'Liquid Glass Pro', desc: 'WebGL refraction glass blobs', tags: ['GPU', 'WebGL', 'Interactive'], Comp: LiquidGlassPro },
  { id: 31, name: 'Liquid Metal Text', desc: 'Metallic flowing text effect', tags: ['GPU', 'Canvas', 'Animated'], Comp: LiquidMetalText },
  { id: 32, name: 'Wireframe Torus Knots', desc: '3D torus knot wireframes', tags: ['GPU', 'Canvas', '3D'], Comp: WireframeTorusKnots },
  { id: 33, name: 'Kinetic Squares', desc: 'Scattered rotating squares', tags: ['GPU', 'Canvas', 'Animated'], Comp: KineticSquares },
  { id: 34, name: 'Flow Field Warp', desc: 'Domain warped noise field', tags: ['GPU', 'Canvas', 'Animated'], Comp: FlowFieldWarp },
  { id: 35, name: 'Frosted Glass Cards', desc: 'Glass cards with light orbs', tags: ['GPU', 'Canvas', 'Interactive'], Comp: FrostedGlassCards },
  { id: 36, name: 'Metaballs', desc: 'Organic merging blobs', tags: ['GPU', 'WebGL'], Comp: Metaballs },
  { id: 37, name: 'Kaleidoscope', desc: 'Mirror-image rotating patterns', tags: ['GPU', 'Canvas'], Comp: Kaleidoscope },
  { id: 38, name: 'Caustics Water', desc: 'Underwater light refraction', tags: ['GPU', 'Canvas'], Comp: CausticsWater },
  { id: 39, name: 'Fractal Zoom', desc: 'Infinite Mandelbrot zoom', tags: ['GPU', 'Canvas'], Comp: FractalZoom },
  { id: 40, name: 'Aurora Borealis', desc: 'Northern lights follow cursor', tags: ['GPU', 'Canvas', 'Interactive'], Comp: Aurora },
  { id: 41, name: 'Voronoi Cells', desc: 'Organic cell patterns', tags: ['GPU', 'Canvas'], Comp: VoronoiCells },
  { id: 42, name: 'Audio Visualizer', desc: 'Frequency bars with wave', tags: ['GPU', 'Canvas'], Comp: AudioVisualizer },
  { id: 43, name: 'Lava Lamp', desc: 'Smooth organic blobs', tags: ['GPU', 'Canvas'], Comp: LavaLamp },
  { id: 44, name: 'Confetti Burst', desc: 'Celebration particles', tags: ['GPU', 'Canvas', 'Interactive'], Comp: ConfettiBurst },
  { id: 45, name: 'Sine Wave Mesh', desc: '3D dot grid sine waves', tags: ['GPU', 'Canvas'], Comp: SineWaveMesh },
  { id: 46, name: 'Glitch Text', desc: 'Digital distortion glitch', tags: ['GPU', 'Canvas', 'Animated'], Comp: GlitchText },
  { id: 48, name: 'Neon Pulse', desc: 'Glowing neon sign', tags: ['GPU', 'Canvas', 'Animated'], Comp: NeonPulse },
  { id: 49, name: 'Wave Text', desc: 'Letters undulating in waves', tags: ['GPU', 'Canvas', 'Animated'], Comp: WaveText },
  { id: 50, name: 'Shatter Text', desc: 'Fragments break and reassemble', tags: ['GPU', 'Canvas', 'Animated'], Comp: ShatterText },
  { id: 51, name: 'Holographic', desc: 'Rainbow iridescent shimmer', tags: ['GPU', 'Canvas', 'Animated'], Comp: HoloText },
  { id: 52, name: 'Liquid Morph', desc: 'Morphs between words', tags: ['GPU', 'Canvas', 'Animated'], Comp: LiquidMorph },
  { id: 53, name: 'Chrome Reflection', desc: 'Metallic chrome with environment', tags: ['GPU', 'Canvas', 'Animated'], Comp: ChromeText },
  { id: 55, name: 'Matrix Decode', desc: 'Characters decode into word', tags: ['GPU', 'Canvas', 'Animated'], Comp: MatrixDecode },
  { id: 56, name: 'Gradient Flow', desc: 'Animated gradient streaming through text', tags: ['GPU', 'Canvas', 'Animated'], Comp: GradientFlow },
]

extraEffects.forEach((ef, i) => {
  allEffects.push({
    id: 57 + i, name: ef.name, desc: '', tags: ef.tags,
    Comp: ef.custom || (() => { const draw = useCallback((x, w, h, t) => ef.draw(x, w, h, t), []); const ref = useCanvas(draw); return <div className="card-stage"><canvas ref={ref} /></div> })
  })
})

// ==================== MEMOIZED CARD ====================
const EffectCard = memo(function EffectCard({ ef, inCart, addToCart }) {
  return (
    <div className="card">
      <ef.Comp />
      <div className="card-info">
        <div className="card-top">
          <div className="card-num">#{String(ef.id).padStart(2, '0')}</div>
          <button className={`card-add ${inCart ? 'added' : ''}`} onClick={() => addToCart(ef)} title={inCart ? 'Remove from cart' : 'Add to cart'}>{inCart ? '✓' : '+'}</button>
        </div>
        <div className="card-title">{ef.name}</div>
        {ef.desc && <div className="card-desc">{ef.desc}</div>}
        <div className="card-tags">{ef.tags.map(t => <span key={t} className={`card-tag ${['GPU', 'WebGL', 'GLSL'].includes(t) ? 'gpu' : ''}`}>{t}</span>)}</div>
      </div>
    </div>
  )
})

// ==================== R3F + FRAMER EFFECTS ====================

// ponytail: ErrorBoundary — React has no hook for this, class is required
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  render() { return this.state.err ? <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 12, padding: 16, textAlign: 'center' }}>WebGL Error<br/><span style={{ fontSize: 10, color: '#94a3b8' }}>{this.state.err.message}</span></div> : this.props.children }
}

// ponytail: only mount children when card scrolls into viewport — saves GPU contexts
function LazyMount({ children, rootMargin = '200px' }) {
  const [ref, visible] = useInView(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (visible && !mounted) setMounted(true) }, [visible, mounted])
  return <div ref={ref} style={{ width: '100%', height: '100%' }}>{mounted ? children : <div className="card-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 12 }}>Loading...</div>}</div>
}
const r3fEffects = [
  { name: 'R3F Cube Cluster', desc: 'Rotating 3D cubes via React Three Fiber', tags: ['GPU', '3D', 'Animated'], Comp: R3FScrollCubes },
  { name: 'R3F Wire Globe', desc: '3D wireframe globe with city dots', tags: ['GPU', '3D', 'Animated'], Comp: R3FGlobe },
  { name: 'R3F Particle Ring', desc: 'Particles converge into ring shape', tags: ['GPU', '3D', 'Animated'], Comp: R3FParticles },
  { name: 'R3F Parallax Planes', desc: 'Depth layers with parallax motion', tags: ['GPU', '3D', 'Scroll'], Comp: R3FLayers },
  { name: 'R3F Wave Grid', desc: 'Cube grid with wave distortion', tags: ['GPU', '3D', 'Animated'], Comp: R3FGrid },
  { name: 'R3F Helix Spiral', desc: 'DNA-like helix of dots', tags: ['GPU', '3D', 'Animated'], Comp: R3FSpiral },
]
const framerEffects = [
  { name: 'Framer Fade Slide', desc: 'Staggered fade-in with slide', tags: ['CSS', 'Animated'], Comp: FramerFadeSlide },
  { name: 'Framer Scale Bounce', desc: 'Spring bounce on tap', tags: ['CSS', 'Interactive'], Comp: FramerScaleBounce },
  { name: 'Framer Stagger List', desc: 'Items animate in sequence', tags: ['CSS', 'Scroll'], Comp: FramerStaggerList },
  { name: 'Framer Rotate In', desc: 'Spring rotation reveal', tags: ['CSS', 'Animated'], Comp: FramerRotateIn },
  { name: 'Cursor Follower', desc: 'Glowing trail follows cursor', tags: ['CSS', 'Interactive'], Comp: CursorFollower },
]
let _efId = allEffects.length + 1
r3fEffects.forEach(ef => { allEffects.push({ id: _efId++, ...ef }) })
framerEffects.forEach(ef => { allEffects.push({ id: _efId++, ...ef }) })

// ==================== APP ====================
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tj-theme') || 'light')
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('tj-cart')) || [] } catch { return [] } })
  const [cartOpen, setCartOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [page, setPage] = useState(() => window.location.hash === '#templates' ? 'templates' : 'animations')

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('tj-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('tj-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { const h = () => setPage(window.location.hash === '#templates' ? 'templates' : 'animations'); window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h) }, [])

  if (page === 'templates') return <TemplatesPage />

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  const addToCart = (ef) => {
    if (cart.find(c => c.id === ef.id)) { removeFromCart(ef.id); return }
    setCart(c => [...c, { id: ef.id, name: ef.name, tags: ef.tags }])
    setToast({ show: true, msg: `${ef.name} added to cart` })
    setTimeout(() => setToast({ show: false, msg: '' }), 2000)
  }
  const removeFromCart = (id) => setCart(c => c.filter(x => x.id !== id))
  const inCart = (id) => cart.some(c => c.id === id)

  const filtered = filter === 'all' ? allEffects : allEffects.filter(e => e.tags.some(t => t.toLowerCase().includes(filter)))

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      <CartCtx.Provider value={{ cart, addToCart, removeFromCart }}>
        <nav className="nav">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>that.jainam</div>
          <div className="nav-links">
            <a href="#" onClick={e => { e.preventDefault(); setFilter('all') }} className={filter === 'all' ? 'active' : ''}>All ({allEffects.length})</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('gpu') }} className={filter === 'gpu' ? 'active' : ''}>GPU</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('css') }} className={filter === 'css' ? 'active' : ''}>CSS</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('scroll') }} className={filter === 'scroll' ? 'active' : ''}>Scroll</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('interactive') }} className={filter === 'interactive' ? 'active' : ''}>Interactive</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('canvas') }} className={filter === 'canvas' ? 'active' : ''}>Canvas</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('svg') }} className={filter === 'svg' ? 'active' : ''}>SVG</a>
            <a href="#templates" onClick={e => { e.preventDefault(); window.location.hash = 'templates' }}>Templates</a>
          </div>
          <div className="nav-right">
            <a className="ig-link" href="https://instagram.com/thats.jainam" target="_blank" rel="noopener" title="Instagram @thats.jainam">📷</a>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">{theme === 'light' ? '🌙' : '☀️'}</button>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒
              <span className={`cart-badge ${cart.length > 0 ? 'show' : ''}`}>{cart.length}</span>
            </button>
          </div>
        </nav>

        <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
        <Toast show={toast.show} msg={toast.msg} />

        <section className="hero">
          <span className="badge">{allEffects.length} Effects</span>
          <h1>Animation <span>Showcase</span></h1>
          <p>Reusable animation components for your next project. Filter, browse, and add to cart.</p>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-num">{allEffects.length}</div><div className="hero-stat-label">Effects</div></div>
            <div className="hero-stat"><div className="hero-stat-num">7</div><div className="hero-stat-label">Categories</div></div>
            <div className="hero-stat"><div className="hero-stat-num">{cart.length}</div><div className="hero-stat-label">In Cart</div></div>
          </div>
        </section>

        <div className="view-controls">
          <div className="filter-label">View:</div>
          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>▦ Grid</button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>☰ List</button>
          </div>
          <div className="grid-count">{filtered.length} effects</div>
        </div>

        <div className={`grid ${viewMode === 'list' ? 'list-view' : ''}`}>
          {filtered.map(ef => (
            <EffectCard key={ef.id} ef={ef} inCart={inCart(ef.id)} addToCart={addToCart} />
          ))}
        </div>

        <div className="compare-wrap">
          <h2>Quick Reference</h2>
          <table className="compare">
            <thead><tr><th>#</th><th>Effect</th><th>Tags</th><th>GPU</th><th>Scroll</th><th>Interactive</th></tr></thead>
            <tbody>{allEffects.map(ef => (<tr key={ef.id}><td>{String(ef.id).padStart(2, '0')}</td><td>{ef.name}</td><td>{ef.tags.join(', ')}</td><td className={ef.tags.some(t => ['GPU', 'WebGL', 'GLSL'].includes(t)) ? 'yes' : 'no'}>{ef.tags.some(t => ['GPU', 'WebGL', 'GLSL'].includes(t)) ? 'Yes' : 'No'}</td><td className={ef.tags.includes('Scroll') ? 'yes' : 'no'}>{ef.tags.includes('Scroll') ? 'Yes' : 'No'}</td><td className={ef.tags.includes('Interactive') ? 'yes' : 'no'}>{ef.tags.includes('Interactive') ? 'Yes' : 'No'}</td></tr>))}</tbody>
          </table>
        </div>

        <footer className="footer">
          <div className="footer-brand">that.jainam</div>
          <div className="footer-links">
            <a href="https://instagram.com/thats.jainam" target="_blank" rel="noopener">Instagram</a>
            <a href="#" onClick={e => { e.preventDefault(); setFilter('all'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Browse All</a>
          </div>
          <div className="footer-copy">© 2026 that.jainam — {allEffects.length} animation effects</div>
        </footer>
      </CartCtx.Provider>
    </ThemeCtx.Provider>
  )
}
