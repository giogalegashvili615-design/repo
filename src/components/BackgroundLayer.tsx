import { useMemo } from 'react'
import { BACKGROUNDS } from '../lib/backgrounds'
import { useApp } from '../context/AppContext'

export function BackgroundLayer() {
  const { backgroundId, theme } = useApp()
  const bg = BACKGROUNDS.find((b) => b.id === backgroundId) || BACKGROUNDS[0]

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 6,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * 10,
      })),
    [],
  )

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background image or gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: bg.isGradient ? bg.gradient : `url(${bg.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: bg.isGradient ? undefined : '#0a1628',
        }}
      >
        {/* Gradient fallback overlay (also acts as dark overlay for readability) */}
        {!bg.isGradient && (
          <div
            className="absolute inset-0"
            style={{ background: bg.gradient, opacity: 0.3 }}
          />
        )}
        {/* Readability overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              theme === 'dark'
                ? 'linear-gradient(180deg, rgba(5,10,25,0.35) 0%, rgba(5,10,25,0.55) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.25) 100%)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: 'rgba(255, 255, 255, 0.4)',
              filter: 'blur(1px)',
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.2) 100%)',
        }}
      />
    </div>
  )
}
