// Self-contained code snippets for each effect — copy-paste ready
// Backticks escaped as \x60 to avoid parser conflicts

const snippets = {
  1: `// ShaderGradient
function ShaderGradient() {
  const canvasRef = React.useRef(null)
  React.useEffect(() => {
    const c = canvasRef.current, x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = (t) => {
      const img = x.createImageData(w, h)
      for (let y = 0; y < h; y += 3) for (let c2 = 0; c2 < w; c2 += 3) {
        const nx = c2 / w, ny = y / h
        const v1 = Math.sin(nx * 3 + t * .001) * .5 + .5
        const v2 = Math.sin(ny * 4 + t * .0015) * .5 + .5
        const v3 = Math.sin((nx + ny) * 2.5 + t * .0008) * .5 + .5
        const r = 180 + v1 * 55 | 0, g = 200 + v2 * 35 | 0, b = 240 + v3 * 15 | 0
        for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
          const i = ((y + dy) * w + (c2 + dx)) * 4
          img.data[i] = r; img.data[i+1] = g; img.data[i+2] = b; img.data[i+3] = 255
        }
      }
      x.putImageData(img, 0, 0)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}`,

  2: `// Liquid Glass
function LiquidGlass() {
  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:'linear-gradient(135deg,#e0e7ff,#f0f9ff)', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'#93c5fd', filter:'blur(50px)', top:'10%', left:'5%', opacity:.5 }} />
      <div style={{ position:'absolute', width:150, height:150, borderRadius:'50%', background:'#c4b5fd', filter:'blur(50px)', top:'30%', right:'10%', opacity:.4 }} />
      <div style={{ position:'absolute', padding:14, borderRadius:14, background:'rgba(255,255,255,.5)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,.6)', top:25, left:30 }}>
        <h4 style={{ margin:0, fontSize:13, fontWeight:800 }}>Volunteer</h4>
        <p style={{ margin:0, fontSize:10, color:'#64748b' }}>Find events</p>
      </div>
    </div>
  )
}`,

  3: `// R3F Scroll — requires: npm i @react-three/fiber @react-three/drei three
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
function ScrollScene() {
  const group = useRef()
  const cubes = useMemo(() => Array.from({ length: 10 }, () => ({
    pos: [(Math.random()-.5)*4,(Math.random()-.5)*3,(Math.random()-.5)*2],
    color: new THREE.Color().setHSL(.6+Math.random()*.15,.6,.5+Math.random()*.2),
    speed: .3+Math.random()*.5
  })), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.rotation.y = t * .1
    group.current.children.forEach((child, i) => {
      child.rotation.x = t * cubes[i].speed
      child.position.y = cubes[i].pos[1] + Math.sin(t + i) * .3
    })
  })
  return (<group ref={group}>{cubes.map((c, i) => (
    <mesh key={i} position={c.pos}><boxGeometry args={[.6,.6,.6]} /><meshStandardMaterial color={c.color} transparent opacity={.8} /></mesh>
  ))}<ambientLight intensity={.5} /><pointLight position={[5,5,5]} intensity={1} /></group>)
}
export default function App() {
  return <Canvas camera={{ position: [0,0,5], fov: 50 }}><ScrollScene /><OrbitControls enableZoom={false} enablePan={false} /></Canvas>
}`,

  4: `// Liquid Logo
function LiquidLogo() {
  const canvasRef = React.useRef(null)
  React.useEffect(() => {
    const c = canvasRef.current, x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = (t) => {
      const time = t * .001; x.clearRect(0,0,w,h); x.fillStyle='#f8fafc'; x.fillRect(0,0,w,h)
      const cx=w/2, cy=h/2, img=x.createImageData(w,h)
      for (let y=0;y<h;y+=2) for (let c2=0;c2<w;c2+=2) {
        const dx=c2-cx,dy=y-cy,d=Math.sqrt(dx*dx+dy*dy),a=Math.atan2(dy,dx)
        const inE=(c2>w*.25&&c2<w*.4&&y>h*.25&&y<h*.75)||(c2>w*.25&&c2<w*.5&&y>h*.25&&y<h*.32)
        if(inE){const wave=Math.sin(a*3+time*2+d*.02)*.3;const m=.5+Math.sin(d*.05+time+wave)*.3;const i=(y*w+c2)*4;img.data[i]=37+m*80|0;img.data[i+1]=99+m*80|0;img.data[i+2]=235+m*20|0;img.data[i+3]=230}
      }
      x.putImageData(img,0,0); raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />
}`,

  5: `// Floating Geometry — mouse parallax
function FloatingGeometry() {
  const ref = React.useRef(null)
  const [mouse, setMouse] = React.useState({x:.5,y:.5})
  React.useEffect(()=>{
    const h=e=>{const r=ref.current.getBoundingClientRect();setMouse({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height})}
    ref.current?.addEventListener('mousemove',h)
    return()=>ref.current?.removeEventListener('mousemove',h)
  },[])
  // Draw circles, triangles, diamonds on canvas with mouse offset and depth
  return <div ref={ref} style={{width:'100%',height:'100%'}}><canvas /></div>
}`,

  6: `// Post FX — Bloom orbs
function PostFX() {
  const canvasRef = React.useRef(null)
  React.useEffect(() => {
    const c = canvasRef.current, x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = (t) => {
      x.clearRect(0,0,w,h); x.fillStyle='#f1f5f9'; x.fillRect(0,0,w,h)
      const orbs=[{x:w*.3,y:h*.4,r:55,hue:220,s:.8},{x:w*.7,y:h*.6,r:42,hue:280,s:1.2},{x:w*.5,y:h*.3,r:65,hue:200,s:.5}]
      orbs.forEach(o=>{
        const ox=o.x+Math.sin(t*.001*o.s)*25,oy=o.y+Math.cos(t*.0013*o.s)*18
        for(let i=4;i>=0;i--){
          const r=o.r*(1+i*.8),al=.05/(i+1)
          const g=x.createRadialGradient(ox,oy,0,ox,oy,r)
          g.addColorStop(0,'hsla('+o.hue+',65%,55%,'+al+')')
          g.addColorStop(1,'hsla('+o.hue+',65%,55%,0)')
          x.fillStyle=g;x.fillRect(0,0,w,h)
        }
      })
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />
}`,

  7: `// 3D Card Flip
function CardFlip3D() {
  const [flipped, setFlipped] = React.useState(false)
  React.useEffect(() => { const id = setInterval(() => setFlipped(f => !f), 2200); return () => clearInterval(id) }, [])
  return (
    <div style={{ perspective:700 }}>
      <div style={{ width:180, height:230, position:'relative', transformStyle:'preserve-3d', transition:'transform .7s', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', borderRadius:14, background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:20, fontWeight:800 }}>Front</div>
        <div style={{ position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', borderRadius:14, background:'white', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700 }}>Back</div>
      </div>
    </div>
  )
}`,

  8: `// Parallax Depth — multi-layer stars with mouse
function ParallaxDepth() {
  const canvasRef = React.useRef(null)
  const [mouse, setMouse] = React.useState({x:.5,y:.5})
  const stars = React.useMemo(()=>Array.from({length:50},()=>({x:Math.random()*700,y:Math.random()*340,r:.5+Math.random()*1.8,depth:.1+Math.random()*.8})),[])
  React.useEffect(()=>{
    const c=canvasRef.current,x=c.getContext('2d')
    let w,h,raf; const resize=()=>{w=c.width=c.offsetWidth;h=c.height=c.offsetHeight}
    resize(); window.addEventListener('resize',resize)
    const h2=e=>{const r=c.getBoundingClientRect();setMouse({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height})}
    c.parentElement?.addEventListener('mousemove',h2)
    const draw=()=>{x.clearRect(0,0,w,h);x.fillStyle='#0f172a';x.fillRect(0,0,w,h)
      stars.forEach(s=>{x.beginPath();x.arc(s.x+(mouse.x-.5)*50*s.depth,s.y+(mouse.y-.5)*35*s.depth,s.r,0,Math.PI*2);x.fillStyle='rgba(255,255,255,'+(.3+s.depth*.5)+')';x.fill()})
      raf=requestAnimationFrame(draw)}
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[mouse,stars])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%',background:'#0f172a'}} />
}`,

  9: `// 3D Text Reveal — letters rotate in
function TextReveal3D() {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => { setTimeout(() => setVisible(true), 300) }, [])
  return (
    <div style={{ fontFamily:'sans-serif', fontSize:48, fontWeight:800, display:'flex', gap:2 }}>
      {'HELLO'.split('').map((ch, i) => (
        <span key={i} style={{ display:'inline-block', color:'#2563eb',
          opacity: visible ? 1 : 0,
          transform: visible ? 'rotateX(0) translateY(0)' : 'rotateX(-90deg) translateY(20px)',
          transition: 'all .5s cubic-bezier(.4,0,.2,1) '+i*70+'ms'
        }}>{ch}</span>
      ))}
    </div>
  )
}`,

  10: `// H-Scroll Cards — vertical scroll drives horizontal
function HScrollCards() {
  const wrapRef = React.useRef(null)
  const [scroll, setScroll] = React.useState(0)
  React.useEffect(() => {
    const h = () => { if(!wrapRef.current)return; const r=wrapRef.current.getBoundingClientRect(),vh=window.innerHeight; if(r.top<vh&&r.bottom>0) setScroll(Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)))) }
    window.addEventListener('scroll',h,{passive:true}); h()
    return()=>window.removeEventListener('scroll',h)
  },[])
  const cards=[{t:'Post',bg:'#2563eb'},{t:'Match',bg:'#7c3aed'},{t:'Manage',bg:'#059669'},{t:'Track',bg:'#ea580c'}]
  return (
    <div ref={wrapRef} style={{overflow:'hidden',width:'100%'}}>
      <div style={{display:'flex',gap:12,padding:12,transform:'translateX('+-scroll*350+'px)'}}>
        {cards.map((c,i)=>(
          <div key={i} style={{minWidth:180,height:200,borderRadius:10,background:c.bg,padding:14,display:'flex',flexDirection:'column',justifyContent:'flex-end',color:'white'}}>
            <h4 style={{fontSize:14,fontWeight:800,margin:0}}>{c.t}</h4>
          </div>
        ))}
      </div>
    </div>
  )
}`,

  11: `// Magnetic Cursor
function MagneticBtn({ children }) {
  const ref = React.useRef(null)
  return (
    <button ref={ref} style={{width:72,height:72,borderRadius:'50%',border:'2px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,cursor:'pointer',transition:'transform .18s'}}
      onMouseMove={e=>{const r=ref.current.getBoundingClientRect();ref.current.style.transform='translate('+(e.clientX-r.left-r.width/2)*.3+'px,'+(e.clientY-r.top-r.height/2)*.3+'px)'}}
      onMouseLeave={()=>{ref.current.style.transform='translate(0,0)'}}
    >{children}</button>
  )
}`,

  12: `// Flip Grid
function FlipGrid() {
  const [f, setF] = React.useState({})
  const items=[{i:'\\u26A1',t:'Real-time'},{i:'\\u2B50',t:'Rated'},{i:'\\uD83D\\uDC65',t:'Teams'}]
  return (<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
    {items.map((it,idx)=>(<div key={idx} style={{perspective:500,height:95}} onMouseEnter={()=>setF(p=>({...p,[idx]:true}))} onMouseLeave={()=>setF(p=>({...p,[idx]:false}))}>
      <div style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',transition:'transform .5s',transform:f[idx]?'rotateY(180deg)':'rotateY(0)'}}>
        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',borderRadius:8,background:'white',border:'1px solid #e2e8f0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><div style={{fontSize:16}}>{it.i}</div><div style={{fontSize:11,fontWeight:700}}>{it.t}</div></div>
        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',transform:'rotateY(180deg)',borderRadius:8,background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:600}}>{it.t}</div>
      </div>
    </div>))}
  </div>)
}`,

  13: `// Tilt + Glow
function TiltGlow() {
  const cardRef = React.useRef(null)
  const glowRef = React.useRef(null)
  return (<div style={{perspective:700,width:180,height:230}}>
    <div ref={cardRef} style={{width:'100%',height:'100%',borderRadius:14,background:'white',border:'1px solid #e2e8f0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:18,transformStyle:'preserve-3d',transition:'transform .12s',position:'relative',overflow:'hidden'}}
      onMouseMove={e=>{const r=cardRef.current.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cardRef.current.style.transform='rotateY('+x*22+'deg) rotateX('+-y*22+'deg)';glowRef.current.style.left=(e.clientX-r.left)+'px';glowRef.current.style.top=(e.clientY-r.top)+'px'}}
      onMouseLeave={()=>{cardRef.current.style.transform='rotateY(0) rotateX(0)'}}>
      <div ref={glowRef} style={{position:'absolute',width:120,height:120,borderRadius:'50%',background:'radial-gradient(circle,rgba(37,99,235,.12),transparent 70%)',pointerEvents:'none',transform:'translate(-50%,-50%)',opacity:0,transition:'opacity .3s'}} />
      <h4 style={{fontSize:20,fontWeight:800,transform:'translateZ(18px)',margin:0}}>Hover</h4>
      <p style={{fontSize:11,color:'#64748b',transform:'translateZ(12px)',margin:0}}>Tilt + glow</p>
    </div>
  </div>)
}`,

  14: `// Reveal Stagger
function RevealStagger() {
  const [visible, setVisible] = React.useState(false)
  const ref = React.useRef(null)
  React.useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: .3 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect() }, [])
  const items=[{i:'\\u26A1',t:'Real-time'},{i:'\\u2B50',t:'Rated'},{i:'\\uD83D\\uDC65',t:'Teams'}]
  return (<div ref={ref} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,padding:14}}>
    {items.map((it,i)=>(<div key={i} style={{padding:14,borderRadius:10,background:'white',border:'1px solid #e2e8f0',opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all .5s '+i*80+'ms'}}>
      <div style={{marginBottom:6}}>{it.i}</div><h4 style={{fontSize:12,fontWeight:700,margin:0}}>{it.t}</h4>
    </div>))}
  </div>)
}`,

  15: `// Morphing Grid
function MorphingGrid() {
  return (<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,maxWidth:240}}>
    {['Post','Match','Connect','Manage','Track','Grow'].map((t,i) => (
      <div key={i} style={{aspectRatio:1,borderRadius:8,background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:10,cursor:'pointer',transition:'all .5s'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1) rotate(5deg)';e.currentTarget.style.borderRadius='20px'}}
        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.borderRadius='8px'}}
      >{t}</div>
    ))}
  </div>)
}`,

  16: `// Particle System
function ParticleSystem() {
  const canvasRef = React.useRef(null)
  const particles = React.useMemo(()=>Array.from({length:200},()=>({x:Math.random()*600-300,y:Math.random()*350-175,z:Math.random()*400,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,vz:(Math.random()-.5)*.4})),[])
  React.useEffect(()=>{
    const c=canvasRef.current,x=c.getContext('2d')
    let w,h,raf; const resize=()=>{w=c.width=c.offsetWidth;h=c.height=c.offsetHeight}
    resize(); window.addEventListener('resize',resize)
    const draw=()=>{x.clearRect(0,0,w,h);x.fillStyle='#f8fafc';x.fillRect(0,0,w,h)
      particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.z+=p.vz;if(Math.abs(p.x)>300)p.vx*=-1;if(Math.abs(p.y)>175)p.vy*=-1;if(p.z<0||p.z>400)p.vz*=-1;const s=600/(600+p.z+300);x.beginPath();x.arc(w/2+p.x*s,h/2+p.y*s,1*s,0,Math.PI*2);x.fillStyle='hsla(220,70%,60%,'+Math.max(.1,1-p.z*.0015)*.5+')';x.fill()})
      raf=requestAnimationFrame(draw)}
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[particles])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />
}`,

  17: `// Wave Plane
function WavePlane() {
  const canvasRef = React.useRef(null)
  React.useEffect(() => {
    const c = canvasRef.current, x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = (t) => {
      x.clearRect(0,0,w,h); x.fillStyle='#f1f5f9'; x.fillRect(0,0,w,h)
      for(let r=0;r<22;r++){x.beginPath();for(let c2=0;c2<=35;c2++){const nx=c2/35,ny=r/22,px=nx*w,wave=Math.sin(nx*6+t*.002)*16+Math.sin(ny*4+t*.0015)*10,py=h/2+(ny-.5)*160+wave;c2===0?x.moveTo(px,py):x.lineTo(px,py)};x.strokeStyle='hsla(220,60%,55%,'+(.1+r/22*.3)+')';x.lineWidth=1.5;x.stroke()}
      raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />
}`,

  18: `// Neon Glow
function NeonGlow() {
  const style = { background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }
  const textStyle = { fontFamily:'sans-serif', fontSize:44, fontWeight:800, color:'#fff',
    textShadow:'0 0 10px #2563eb, 0 0 20px #2563eb, 0 0 40px #2563eb, 0 0 80px #7c3aed',
    animation:'neonP 2s ease-in-out infinite alternate' }
  return (<div style={style}><div style={textStyle}>EVOLECT</div>
    <style>{'@keyframes neonP{from{text-shadow:0 0 10px #2563eb,0 0 20px #2563eb,0 0 40px #2563eb,0 0 80px #7c3aed}to{text-shadow:0 0 5px #2563eb,0 0 10px #2563eb,0 0 20px #2563eb,0 0 40px #7c3aed}}'}</style>
  </div>)
}`,

  19: `// Holographic Card
function HolographicCard() {
  const cardRef = React.useRef(null)
  return (<div ref={cardRef} style={{width:180,height:230,borderRadius:14,background:'linear-gradient(135deg,#667eea,#764ba2)',position:'relative',overflow:'hidden',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:18,fontWeight:800}}
    onMouseMove={e=>{const r=cardRef.current.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;cardRef.current.style.setProperty('--angle',(Math.atan2(y-.5,x-.5)*180/Math.PI+180)+'deg')}}
  ><div style={{position:'absolute',inset:0,background:'conic-gradient(from var(--angle,0deg),transparent 0%,rgba(255,255,255,.1) 10%,transparent 20%,rgba(255,255,255,.15) 30%,transparent 40%)',pointerEvents:'none'}} />EVOLECT</div>)
}`,

  20: `// Fluid Blob — SVG
function FluidBlob() {
  return (<svg width="200" height="200" viewBox="0 0 200 200"><defs>
    <filter id="f"><feTurbulence type="fractalNoise" baseFrequency=".015" numOctaves="3" result="n" seed="1"><animate attributeName="seed" from="1" to="100" dur="8s" repeatCount="indefinite" /></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G" /></filter>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
  </defs><ellipse cx="100" cy="100" rx="70" ry="70" fill="url(#g1)" filter="url(#f)"><animate attributeName="rx" values="70;80;65;75;70" dur="4s" repeatCount="indefinite" /><animate attributeName="ry" values="70;65;80;70;70" dur="4s" repeatCount="indefinite" /></ellipse></svg>)
}`,

  21: `// 3D Globe — requires: npm i @react-three/fiber @react-three/drei three`,

  22: `// Noise Abstract
function NoiseAbstract() {
  const canvasRef = React.useRef(null)
  React.useEffect(() => {
    const c = canvasRef.current, x = c.getContext('2d')
    let w, h, raf
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const draw = (t) => {
      const img = x.createImageData(w, h)
      for (let y = 0; y < h; y += 3) for (let c2 = 0; c2 < w; c2 += 3) {
        const n = Math.sin(c2*.02+t*.0005)*Math.cos(y*.02+t*.00035)*Math.sin((c2+y)*.015+t*.00025); const v=(n+1)/2
        for (let dy=0;dy<3;dy++) for (let dx=0;dx<3;dx++) {
          const i=((y+dy)*w+(c2+dx))*4; img.data[i]=220+v*35|0; img.data[i+1]=230+v*20|0; img.data[i+2]=245+v*10|0; img.data[i+3]=255
        }
      }
      x.putImageData(img,0,0); raf=requestAnimationFrame(draw)
    }
    raf=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%'}} />
}`,

  23: `// Scroll Tunnel — requires: npm i @react-three/fiber @react-three/drei three
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
function ScrollTunnelScene() {
  const group = useRef()
  const rings = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    z: -i * 2, radius: 1.2 + Math.sin(i * .3) * .4,
    color: new THREE.Color().setHSL(.6 + (i/30) * .15, .7, .55)
  })), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime, scroll = (Math.sin(t * .15) + 1) / 2
    group.current.position.z = scroll * 30
    group.current.children.forEach((child, i) => { child.rotation.z = t * .3 + i * .2 })
  })
  return (<group ref={group}>{rings.map((r, i) => (
    <mesh key={i} position={[0, 0, r.z]}><torusGeometry args={[r.radius, .04, 8, 32]} /><meshStandardMaterial color={r.color} emissive={r.color} emissiveIntensity={.3} /></mesh>
  ))}<ambientLight intensity={.3} /><pointLight position={[0,0,5]} intensity={1.5} color="#60a5fa" /></group>)
}`,

  24: `// Scroll Particles — requires: npm i @react-three/fiber three
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
function ScrollParticlesScene() {
  const points = useRef(); const count = 400
  const pos = useMemo(() => {
    const s = new Float32Array(count*3), t = new Float32Array(count*3)
    for (let i = 0; i < count; i++) {
      const a = (i/count)*Math.PI*2; t[i*3]=Math.cos(a)*1.5; t[i*3+1]=Math.sin(a)*1.5; t[i*3+2]=Math.sin(a*2)*.3
      s[i*3]=(Math.random()-.5)*6; s[i*3+1]=(Math.random()-.5)*6; s[i*3+2]=(Math.random()-.5)*6
    }
    return { scattered: s, target: t }
  }, [])
  useFrame((state) => {
    const t = state.clock.elapsedTime, p = (Math.sin(t*.4)+1)/2
    const arr = points.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i*3]=pos.scattered[i*3]+(pos.target[i*3]-pos.scattered[i*3])*p
      arr[i*3+1]=pos.scattered[i*3+1]+(pos.target[i*3+1]-pos.scattered[i*3+1])*p
      arr[i*3+2]=pos.scattered[i*3+2]+(pos.target[i*3+2]-pos.scattered[i*3+2])*p
    }
    points.current.geometry.attributes.position.needsUpdate = true
    points.current.rotation.z = t * .1
  })
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={pos.scattered} itemSize={3} /></bufferGeometry><pointsMaterial size={.04} color="#60a5fa" transparent opacity={.8} /></points>
}`,

  25: `// Scroll Morph — requires: npm i @react-three/fiber @react-three/drei three
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
function ScrollMorphScene() {
  const mesh = useRef()
  useFrame((state) => { const t=state.clock.elapsedTime; mesh.current.rotation.x=t*.5; mesh.current.rotation.y=t*.3; mesh.current.scale.setScalar(1+Math.sin(t*2)*.15) })
  return (<group><mesh ref={mesh}><icosahedronGeometry args={[1,1]} /><meshStandardMaterial color="#60a5fa" wireframe transparent opacity={.6} /></mesh>
    <ambientLight intensity={.4} /><pointLight position={[3,3,3]} intensity={1.2} color="#a78bfa" /></group>)
}`,

  26: `// Scroll Layers — requires: npm i @react-three/fiber three
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
function ScrollLayersScene() {
  const group = useRef()
  const layers = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    z:-i*1.5, width:2+i*.5, height:1.5+i*.3,
    color: new THREE.Color().setHSL(.6+i*.02,.5,.45+i*.03), speed:.2+i*.1
  })), [])
  useFrame((state) => { const t=state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.position.x = Math.sin(t*layers[i].speed+i)*(1+i*.3)
      child.position.y = Math.cos(t*layers[i].speed*.7+i)*(.5+i*.15)
    })
  })
  return (<group ref={group}>{layers.map((l,i)=>(
    <mesh key={i} position={[0,0,l.z]}><planeGeometry args={[l.width,l.height]} /><meshStandardMaterial color={l.color} transparent opacity={.15+i*.05} side={THREE.DoubleSide} /></mesh>
  ))}<ambientLight intensity={.5} /></group>)
}`,

  27: `// Scroll Grid — requires: npm i @react-three/fiber @react-three/drei three
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
function ScrollGridScene() {
  const group = useRef()
  const cubes = useMemo(() => { const arr=[]
    for(let x=-3;x<=3;x++) for(let z=-2;z<=2;z++) arr.push({pos:[x*.8,0,z*.8],color:new THREE.Color().setHSL(.55+(x+3)*.03,.6,.5+(z+2)*.05)})
    return arr
  }, [])
  useFrame((state) => { const t=state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.position.y = Math.sin(t*1.5+cubes[i].pos[0]*2+cubes[i].pos[2]*1.5)*.5
      child.rotation.x = t*.5+i*.1; child.scale.setScalar(.8+Math.sin(t*2+i*.5)*.2)
    })
  })
  return (<group ref={group}>{cubes.map((c,i)=>(
    <mesh key={i} position={c.pos}><boxGeometry args={[.35,.35,.35]} /><meshStandardMaterial color={c.color} transparent opacity={.7} /></mesh>
  ))}<ambientLight intensity={.4} /><pointLight position={[4,5,4]} intensity={1.2} color="#60a5fa" /></group>)
}`,

  28: `// Scroll Spiral — requires: npm i @react-three/fiber three
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
function ScrollSpiralScene() {
  const points = useRef(); const count = 300
  const { scattered, target } = useMemo(() => {
    const s=new Float32Array(count*3), t=new Float32Array(count*3)
    for(let i=0;i<count;i++){const a=(i/count)*Math.PI*6,y=(i/count)*6-3;t[i*3]=Math.cos(a)*.8;t[i*3+1]=y;t[i*3+2]=Math.sin(a)*.8;s[i*3]=(Math.random()-.5)*5;s[i*3+1]=(Math.random()-.5)*5;s[i*3+2]=(Math.random()-.5)*5}
    return{scattered:s,target:t}
  },[])
  useFrame((state)=>{const t=state.clock.elapsedTime,p=(Math.sin(t*.35)+1)/2,spread=1+Math.sin(t*.5)*.5
    const arr=points.current.geometry.attributes.position.array
    for(let i=0;i<count;i++){arr[i*3]=scattered[i*3]+(target[i*3]*spread-scattered[i*3])*p;arr[i*3+1]=scattered[i*3+1]+(target[i*3+1]-scattered[i*3+1])*p;arr[i*3+2]=scattered[i*3+2]+(target[i*3+2]*spread-scattered[i*3+2])*p}
    points.current.geometry.attributes.position.needsUpdate=true; points.current.rotation.y=t*.15
  })
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={scattered} itemSize={3} /></bufferGeometry><pointsMaterial size={.045} color="#a78bfa" transparent opacity={.85} /></points>
}`,

  57: `// R3F Cube Cluster — requires: npm i @react-three/fiber @react-three/drei three
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
function ScrollScene() {
  const group = useRef()
  const cubes = useMemo(() => Array.from({length:10},(_,i)=>({pos:[(Math.random()-.5)*4,(Math.random()-.5)*3,(Math.random()-.5)*2],color:new THREE.Color().setHSL(.6+Math.random()*.15,.6,.5+Math.random()*.2),speed:.3+Math.random()*.5})),[])
  useFrame((state)=>{const t=state.clock.elapsedTime;if(!group.current)return;group.current.rotation.y=t*.1
    group.current.children.forEach((child,i)=>{child.rotation.x=t*cubes[i].speed;child.rotation.z=t*cubes[i].speed*.5;child.position.y=cubes[i].pos[1]+Math.sin(t+i)*.3})})
  return(<group ref={group}>{cubes.map((c,i)=><mesh key={i} position={c.pos}><boxGeometry args={[.5+Math.random()*.5,.5+Math.random()*.5,.5+Math.random()*.5]}/><meshStandardMaterial color={c.color} transparent opacity={.8}/></mesh>)}
    <ambientLight intensity={.5}/><pointLight position={[5,5,5]} intensity={1}/></group>)
}
function App(){return<Canvas camera={{position:[0,0,5],fov:50}} style={{width:'100%',height:'100vh'}}><color attach="background" args={['#0f172a']}/><ScrollScene/></Canvas>}`,

  58: `// R3F Wire Globe — requires: npm i @react-three/fiber three
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
function GlobeScene() {
  const globe = useRef()
  useFrame((state)=>{if(globe.current)globe.current.rotation.y=state.clock.elapsedTime*.2})
  return(<group><mesh ref={globe}><sphereGeometry args={[1.5,24,24]}/><meshBasicMaterial color="#2563eb" wireframe transparent opacity={.15}/></mesh>
    <ambientLight intensity={.3}/><pointLight position={[5,5,5]} intensity={.8}/></group>)
}`,

  62: `// Framer Fade Slide — requires: npm i framer-motion
import { motion } from 'framer-motion'
function FramerFadeSlide() {
  return <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',padding:20}}>
    {[0,1,2,3,4].map(i=><motion.div key={i} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}}
      transition={{delay:i*.15,duration:.5}} style={{width:60,height:60,borderRadius:12,
      background:\`linear-gradient(135deg,hsl(\${220+i*25},70%,60%),hsl(\${240+i*25},60%,50%))\`,
      display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>{i+1}</motion.div>)}
  </div>
}`,

  63: `// Framer Scale Bounce — requires: npm i framer-motion
import { motion, useState } from 'framer-motion'
function FramerScaleBounce() {
  const [tap,setTap]=useState(false)
  return <motion.div animate={{scale:tap?[1,1.3,.9,1.1,1]:1}} transition={{duration:.5}}
    onClick={()=>setTap(t=>!t)} style={{width:100,height:100,borderRadius:20,
    background:'linear-gradient(135deg,#2563eb,#7c3aed)',cursor:'pointer',
    display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800}}>Tap</motion.div>
}`,

  64: `// Framer Stagger List — requires: npm i framer-motion
import { motion } from 'framer-motion'
function FramerStaggerList() {
  return <div style={{display:'flex',flexDirection:'column',gap:8}}>
    {['Design','Develop','Deploy','Iterate'].map((t,i)=><motion.div key={t}
      initial={{opacity:0,x:-40}} animate={{opacity:1,x:0}}
      transition={{delay:i*.2,type:'spring',stiffness:120}}
      style={{padding:'10px 24px',borderRadius:10,background:'white',border:'1px solid #e2e8f0',
      fontSize:13,fontWeight:600,width:180,textAlign:'center'}}>{t}</motion.div>)}
  </div>
}`,

  65: `// Framer Rotate In — requires: npm i framer-motion
import { motion } from 'framer-motion'
function FramerRotateIn() {
  return <motion.div initial={{opacity:0,rotate:-180,scale:0}} animate={{opacity:1,rotate:0,scale:1}}
    transition={{duration:.8,type:'spring',stiffness:80}}
    style={{width:110,height:110,borderRadius:22,background:'linear-gradient(135deg,#2563eb,#ec4899)',
    display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:24}}>E</motion.div>
}`,

  66: `// Framer Cursor Follow — requires: npm i framer-motion
import { motion, useState } from 'framer-motion'
function FramerXYMove() {
  const [pos,setPos]=useState({x:0,y:0})
  return <div onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setPos({x:(e.clientX-r.left-r.width/2)*.3,y:(e.clientY-r.top-r.height/2)*.3})}} onMouseLeave={()=>setPos({x:0,y:0})}>
    <motion.div animate={{x:pos.x,y:pos.y}} transition={{type:'spring',stiffness:150,damping:15}}
      style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#7c3aed)',
      display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>Follow</motion.div>
  </div>
}`
}

export default snippets
