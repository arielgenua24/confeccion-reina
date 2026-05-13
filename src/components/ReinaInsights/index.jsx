import { useState, useEffect, useCallback, useMemo } from 'react'
import useReinaInsights from '../../hooks/useReinaInsights'
import './styles.css'

// ─── TOKENS ────────────────────────────────────────────────────────────────
const C = {
  cream:      '#F7F0E6',
  paper:      '#EDE5D8',
  border:     '#DDD3C4',
  red:        '#C83526',
  redBg:      '#FFF2EE',
  muted:      '#9A8470',
  mutedLight: '#BFB09A',
  deep:       '#1A1209',
  deepMid:    '#3D2E1C',
  sage:       '#2E6B40',
  sageBg:     '#DBF0D8',
  orange:     '#C85628',
}

// Visual palettes cycled per insight card.
// Each palette is fully self-contained (colors + copy) so a card reads as a
// cohesive concept: ALERTA / IA SUGIERE / PACK — mirroring the design reference.
const PALETTES = [
  {
    id: 'alert',
    bg: C.redBg,
    badgeBg: C.red, badgeColor: '#fff',
    headlineColor: C.deep,
    subColor: C.muted,
    bodyColor: C.deepMid,
    heroLabelColor: C.muted,
    dividerColor: `${C.red}25`,
    grainOpacity: 0.025,
    shadow: C.red,
    badge: 'ATENCIÓN',
    headline: 'Mirá esto',
    subline: 'detectado esta semana',
    heroLabel: 'señal de la semana',
  },
  {
    id: 'ai',
    bg: C.orange,
    badgeBg: 'rgba(255,255,255,0.22)', badgeColor: '#fff',
    headlineColor: '#fff',
    subColor: 'rgba(255,255,255,0.7)',
    bodyColor: 'rgba(255,255,255,0.92)',
    heroLabelColor: 'rgba(255,255,255,0.65)',
    dividerColor: 'rgba(255,255,255,0.18)',
    grainOpacity: 0.04,
    shadow: C.orange,
    badge: 'IA SUGIERE',
    headline: 'Idea para tu negocio',
    subline: 'a partir de tus datos',
    heroLabel: 'según la IA',
  },
  {
    id: 'bundle',
    bg: C.sageBg,
    badgeBg: C.sage, badgeColor: '#fff',
    headlineColor: C.deep,
    subColor: '#4E7A5A',
    bodyColor: C.deepMid,
    heroLabelColor: '#4E7A5A',
    dividerColor: `${C.sage}25`,
    grainOpacity: 0.025,
    shadow: C.sage,
    badge: 'OPORTUNIDAD',
    headline: 'Movimiento clave',
    subline: 'para aprovechar pronto',
    heroLabel: 'momento clave',
  },
]

const ILLUSTRATIONS = [
  'https://ik.imagekit.io/nicoeliashector/the-key.png',
  'https://ik.imagekit.io/nicoeliashector/happy-girl.png',
  'https://ik.imagekit.io/nicoeliashector/curious-person.png',
]

// Strip any leading tag/emoji the LLM may still emit, then return clean text.
function cleanLine(line) {
  return line
    .replace(/^\[(?:key|happy|curious)\]\s*/i, '')
    .replace(/^(\p{Extended_Pictographic}(?:‍\p{Extended_Pictographic})*)\s*/u, '')
    .trim()
}

function parseInsightsText(raw) {
  if (!raw) return []
  return raw
    .split(/\r?\n+/)
    .map(l => l.replace(/^\s*[-•*]\s+/, '').trim())
    .filter(Boolean)
    .map(l => ({ text: cleanLine(l) }))
    .filter(b => b.text)
}

// Fisher–Yates shuffle, returns a new array.
function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Assign one image per bullet without repeats. If bullets > images, cycle a new
// reshuffled batch so the same image never appears twice in a row.
function assignImages(bullets) {
  let pool = shuffle(ILLUSTRATIONS)
  const out = []
  for (let i = 0; i < bullets.length; i++) {
    if (pool.length === 0) {
      let next = shuffle(ILLUSTRATIONS)
      // Avoid having the previously used image at index 0 of the new batch.
      if (out.length && next[0] === out[out.length - 1]) {
        next = [...next.slice(1), next[0]]
      }
      pool = next
    }
    out.push(pool.shift())
  }
  return out
}

function Grain({ opacity = 0.025 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 'inherit',
      pointerEvents: 'none', zIndex: 1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '220px 220px',
      opacity,
      mixBlendMode: 'multiply',
    }} />
  )
}

function InsightCard({ bullet, palette, illustration, animDir }) {
  return (
    <div className={animDir >= 0 ? 'ri-card-from-right' : 'ri-card-from-left'} style={{
      position: 'relative', borderRadius: 22,
      background: palette.bg, padding: '22px 22px 24px',
      overflow: 'hidden',
      boxShadow: `0 4px 28px ${palette.shadow}22`,
    }}>
      <Grain opacity={palette.grainOpacity} />
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* Badge pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 11px', borderRadius: 99, marginBottom: 12,
          background: palette.badgeBg, color: palette.badgeColor,
          fontFamily: 'DM Sans', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.11em', textTransform: 'uppercase',
        }}>
          {palette.badge}
        </div>

        {/* Headline (title) */}
        <h2 style={{
          fontFamily: 'DM Serif Display',
          fontStyle: 'italic',
          fontSize: 30, lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: palette.headlineColor,
          margin: 0,
        }}>
          {palette.headline}
        </h2>
        <p style={{
          fontFamily: 'DM Sans',
          fontSize: 13,
          marginTop: 4, marginBottom: 18,
          color: palette.subColor,
          lineHeight: 1.4,
        }}>
          {palette.subline}
        </p>

        {/* Body paragraph — bigger and bolder so it's easy to read */}
        <p style={{
          fontFamily: 'DM Sans',
          fontSize: 17,
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: '-0.005em',
          color: palette.bodyColor,
          margin: '0 0 18px',
        }}>
          {bullet.text}
        </p>

        {/* Divider */}
        <div style={{
          height: 1, background: palette.dividerColor,
          margin: '0 0 14px',
        }} />

        {/* Illustration at the bottom — 16:9 source cropped to its center band */}
        <div style={{
          width: '100%',
          height: 120,
          borderRadius: 14,
          overflow: 'hidden',
          background: `${palette.bg}`,
        }}>
          <img
            src={illustration}
            alt=""
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
              transform: 'scale(1.05)', // tiny zoom so the center subject reads cleaner
              transformOrigin: 'center',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function ShuffleSection({ bullets }) {
  const [cur,  setCur]  = useState(0)
  const [dir,  setDir]  = useState(1)
  const [tick, setTick] = useState(0)
  const [done, setDone] = useState(false)

  // Assign images once per content payload, reshuffling whenever the bullets change.
  const images = useMemo(
    () => assignImages(bullets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bullets.length, bullets.map(b => b.text).join('|')]
  )

  const go = useCallback((d) => {
    setDir(d)
    setCur(c => (c + d + bullets.length) % bullets.length)
    setTick(t => t + 1)
  }, [bullets.length])

  useEffect(() => {
    if (done) return
    if (bullets.length <= 1) { setDone(true); return }
    const id = setInterval(() => {
      setCur(c => {
        if (c >= bullets.length - 1) {
          clearInterval(id)
          setDone(true)
          return c
        }
        setDir(1)
        setTick(t => t + 1)
        return c + 1
      })
    }, 3200)
    return () => clearInterval(id)
  }, [done, bullets.length])

  const palette = PALETTES[cur % PALETTES.length]

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div className={done ? '' : 'ri-pulse-dot'} style={{ width: 7, height: 7, borderRadius: '50%', background: done ? C.border : C.red, transition: 'background 0.4s' }} />
          <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: C.mutedLight, textTransform: 'uppercase', letterSpacing: '0.11em' }}>Insights de la semana</span>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {bullets.map((_, i) => (
            <div key={i} style={{ width: i === cur ? 20 : 6, height: 6, borderRadius: 99, background: i === cur ? C.deep : C.border, transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)' }} />
          ))}
        </div>
      </div>

      <div key={tick}>
        <InsightCard bullet={bullets[cur]} palette={palette} illustration={images[cur]} animDir={dir} />
      </div>

      {bullets.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, paddingTop: 11, marginBottom: 28, opacity: done ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: done ? 'auto' : 'none' }}>
          {[
            { label: 'Anterior', d: -1, left: true },
            { label: 'Siguiente', d: 1,  left: false },
          ].map(({ label, d, left }) => (
            <button key={label} onClick={() => go(d)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.paper, border: `1.5px solid ${C.border}`, borderRadius: 99, cursor: 'pointer', padding: '8px 18px', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: C.deepMid, flex: 1, justifyContent: 'center' }}>
              {left && <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 2L4 6.5l4.5 4.5" stroke={C.deepMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              {label}
              {!left && <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4.5 2L9 6.5 4.5 11" stroke={C.deepMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ShimmerCard() {
  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13 }}>
        <div className="ri-pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.red }} />
        <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: C.mutedLight, textTransform: 'uppercase', letterSpacing: '0.11em' }}>Insights de la semana</span>
      </div>
      <div style={{ borderRadius: 22, background: C.redBg, padding: '20px 20px 22px', overflow: 'hidden', position: 'relative' }}>
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="ri-shimmer" style={{ height: 20, width: 80, borderRadius: 99 }} />
          <div className="ri-shimmer" style={{ height: 26, width: 160, borderRadius: 8 }} />
          <div className="ri-shimmer" style={{ height: 80, width: 80, borderRadius: 12 }} />
          <div className="ri-shimmer" style={{ height: 13, width: '70%', borderRadius: 6 }} />
        </div>
      </div>
    </div>
  )
}

function ErrorCard({ message }) {
  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.muted }} />
        <span style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: C.mutedLight, textTransform: 'uppercase', letterSpacing: '0.11em' }}>Insights de la semana</span>
      </div>
      <div style={{ borderRadius: 22, background: C.paper, padding: '20px', border: `1px solid ${C.border}`, fontFamily: 'DM Sans', fontSize: 13, color: C.deepMid, lineHeight: 1.5 }}>
        {message}
      </div>
    </div>
  )
}

export default function ReinaInsights() {
  const { insights, status } = useReinaInsights()

  if (status === 'no-insights') return null

  if (status === 'error') {
    return <ErrorCard message="No pudimos cargar los insights. Revisá la consola para más detalle." />
  }

  if (status === 'checking' || status === 'generating' || status === 'polling') {
    return <ShimmerCard />
  }

  if (status !== 'completed' || !insights) return null

  const bullets = parseInsightsText(insights)
  if (bullets.length === 0) return null

  return <ShuffleSection bullets={bullets} />
}
