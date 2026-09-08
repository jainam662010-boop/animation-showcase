import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const templates = [
  { id: 1, name: 'SaaS Landing', desc: 'Modern startup landing with hero, features, pricing', tags: ['Landing', 'SaaS', 'Modern'], color: '#2563eb', preview: 'hero-pricing' },
  { id: 2, name: 'Portfolio Grid', desc: 'Masonry grid portfolio with project modals', tags: ['Portfolio', 'Grid', 'Creative'], color: '#7c3aed', preview: 'masonry' },
  { id: 3, name: 'Dashboard Pro', desc: 'Admin dashboard with charts, sidebar, stats cards', tags: ['Dashboard', 'Admin', 'Charts'], color: '#0891b2', preview: 'dashboard' },
  { id: 4, name: 'E-Commerce Store', desc: 'Product grid, cart, filter sidebar', tags: ['E-Commerce', 'Store', 'Products'], color: '#059669', preview: 'store' },
  { id: 5, name: 'Blog Magazine', desc: 'Magazine-style blog with featured articles', tags: ['Blog', 'Magazine', 'Content'], color: '#d97706', preview: 'blog' },
  { id: 6, name: 'Agency Site', desc: 'Creative agency with team, services, testimonials', tags: ['Agency', 'Business', 'Corporate'], color: '#dc2626', preview: 'agency' },
  { id: 7, name: 'SaaS App', desc: 'Product app landing with feature showcase', tags: ['SaaS', 'App', 'Product'], color: '#4f46e5', preview: 'app' },
  { id: 8, name: 'Restaurant', desc: 'Menu, reservations, food gallery', tags: ['Restaurant', 'Food', 'Menu'], color: '#b45309', preview: 'restaurant' },
  { id: 9, name: 'Event Conference', desc: 'Conference schedule, speakers, registration', tags: ['Event', 'Conference', 'Schedule'], color: '#be185d', preview: 'event' },
]

function TemplateCard({ t, onClick }) {
  return (
    <motion.div
      className="template-card"
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,.12)' }}
      onClick={() => onClick(t)}
      style={{ cursor: 'pointer' }}
    >
      <div className="template-preview" style={{ background: `linear-gradient(135deg, ${t.color}22, ${t.color}08)` }}>
        <TemplateMini type={t.preview} color={t.color} />
      </div>
      <div className="template-info">
        <div className="template-name">{t.name}</div>
        <div className="template-desc">{t.desc}</div>
        <div className="template-tags">{t.tags.map(tag => <span key={tag} className="template-tag">{tag}</span>)}</div>
      </div>
    </motion.div>
  )
}

function TemplateMini({ type, color }) {
  const s = { width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12 }
  if (type === 'hero-pricing') return (
    <div style={s}>
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 6 }}>
        <div style={{ width: 40, height: 6, background: color, borderRadius: 3, opacity: .6 }} />
        <div style={{ flex: 1 }} />
        {[1,2,3].map(i => <div key={i} style={{ width: 20, height: 4, background: color, borderRadius: 2, opacity: .3 }} />)}
      </div>
      <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ width: 100, height: 10, background: color, borderRadius: 5, opacity: .5, margin: '0 auto 6px' }} />
        <div style={{ width: 70, height: 4, background: color, borderRadius: 2, opacity: .2, margin: '0 auto 3px' }} />
        <div style={{ width: 60, height: 4, background: color, borderRadius: 2, opacity: .15, margin: '0 auto 8px' }} />
        <div style={{ width: 50, height: 14, background: color, borderRadius: 7, opacity: .4, margin: '0 auto' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', gap: 6 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 28, background: color, borderRadius: 6, opacity: .08 + i * .04 }} />)}
      </div>
    </div>
  )
  if (type === 'masonry') return (
    <div style={{ ...s, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 8 }}>
      {[40,60,55,35,45,50].map((h, i) => <div key={i} style={{ height: h, background: color, borderRadius: 4, opacity: .08 + (i % 3) * .06 }} />)}
    </div>
  )
  if (type === 'dashboard') return (
    <div style={s}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 28, background: color, opacity: .1 }} />
      <div style={{ position: 'absolute', left: 32, top: 8, right: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 18, background: color, borderRadius: 4, opacity: .06 + i * .03 }} />)}
      </div>
      <div style={{ position: 'absolute', left: 32, top: 88, right: 8, height: 30, background: color, borderRadius: 4, opacity: .05 }} />
    </div>
  )
  if (type === 'store') return (
    <div style={{ ...s, padding: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3].map(i => <div key={i} style={{ width: 24, height: 6, background: color, borderRadius: 3, opacity: .2 + i * .05 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 28, background: color, borderRadius: 4, opacity: .06 + (i % 3) * .04 }} />)}
      </div>
    </div>
  )
  if (type === 'blog') return (
    <div style={{ ...s, padding: 8 }}>
      <div style={{ height: 35, background: color, borderRadius: 6, opacity: .08, marginBottom: 6 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 20, background: color, borderRadius: 4, opacity: .05 + i * .02 }} />)}
      </div>
    </div>
  )
  if (type === 'agency') return (
    <div style={s}>
      <div style={{ position: 'absolute', top: 10, left: 10, width: 80, height: 8, background: color, borderRadius: 4, opacity: .4 }} />
      <div style={{ position: 'absolute', top: '40%', left: 10, width: 60, height: 6, background: color, borderRadius: 3, opacity: .2 }} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 4 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 20, background: color, borderRadius: 4, opacity: .06 + i * .03 }} />)}
      </div>
    </div>
  )
  if (type === 'app') return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 45, height: 75, border: `2px solid ${color}40`, borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 6, left: 4, right: 4, height: 4, background: color, borderRadius: 2, opacity: .15 }} />
        <div style={{ position: 'absolute', top: 14, left: 4, right: 4, height: 3, background: color, borderRadius: 1, opacity: .08 }} />
        <div style={{ position: 'absolute', top: 20, left: 4, right: 4, height: 3, background: color, borderRadius: 1, opacity: .06 }} />
        <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, height: 10, background: color, borderRadius: 3, opacity: .1 }} />
      </div>
    </div>
  )
  if (type === 'restaurant') return (
    <div style={{ ...s, padding: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3].map(i => <div key={i} style={{ width: 16, height: 4, background: color, borderRadius: 2, opacity: .2 + i * .05 }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 24, background: color, borderRadius: 4, opacity: .06 + i * .03 }} />)}
      </div>
    </div>
  )
  // event
  return (
    <div style={{ ...s, padding: 8 }}>
      <div style={{ height: 30, background: color, borderRadius: 6, opacity: .1, marginBottom: 6 }} />
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 30, background: color, borderRadius: 4, opacity: .05 + i * .03 }} />)}
      </div>
    </div>
  )
}

function TemplateModal({ t, onClose }) {
  if (!t) return null
  return (
    <AnimatePresence>
      <motion.div
        className="template-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="template-modal"
          initial={{ scale: .9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: .9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="template-modal-close" onClick={onClose}>✕</button>
          <div className="template-modal-preview" style={{ background: `linear-gradient(135deg, ${t.color}22, ${t.color}08)` }}>
            <TemplateMini type={t.preview} color={t.color} />
          </div>
          <div className="template-modal-info">
            <h2>{t.name}</h2>
            <p>{t.desc}</p>
            <div className="template-tags">{t.tags.map(tag => <span key={tag} className="template-tag">{tag}</span>)}</div>
            <div className="template-modal-actions">
              <button className="btn-primary" style={{ background: t.color }}>Get Template</button>
              <button className="btn-secondary">Preview</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const allTags = [...new Set(templates.flatMap(t => t.tags))]
  const filtered = filter === 'all' ? templates : templates.filter(t => t.tags.includes(filter))

  return (
    <div className="templates-page">
      <nav className="nav">
        <a href="#" className="nav-logo" onClick={e => { e.preventDefault(); window.location.hash = '' }}>that.jainam</a>
        <div className="nav-links">
          <a href="#" onClick={e => { e.preventDefault(); window.location.hash = '' }}>Animations</a>
          <a href="#" className="active" onClick={e => e.preventDefault()}>Templates</a>
        </div>
      </nav>

      <section className="hero">
        <span className="badge">{templates.length} Templates</span>
        <h1>Web <span>Templates</span></h1>
        <p>Production-ready website templates. Filter by category, preview, and get the code.</p>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-num">{templates.length}</div><div className="hero-stat-label">Templates</div></div>
          <div className="hero-stat"><div className="hero-stat-num">{allTags.length}</div><div className="hero-stat-label">Categories</div></div>
          <div className="hero-stat"><div className="hero-stat-num">HTML</div><div className="hero-stat-label">Stack</div></div>
        </div>
      </section>

      <div className="view-controls">
        <div className="filter-label">Filter:</div>
        <div className="filter-pills">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          {allTags.slice(0, 8).map(tag => (
            <button key={tag} className={filter === tag ? 'active' : ''} onClick={() => setFilter(tag)}>{tag}</button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {filtered.map(t => <TemplateCard key={t.id} t={t} onClick={setSelected} />)}
      </div>

      <TemplateModal t={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
