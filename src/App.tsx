import { useCallback, useEffect, useState } from 'react'
import {
  PDF_HREF,
  SLIDES,
  TOTAL_SLIDES,
  type SlideId,
  slideById,
} from './slides'
import './App.css'

function isSlideId(value: number): value is SlideId {
  return Number.isInteger(value) && value >= 1 && value <= TOTAL_SLIDES
}

export default function App() {
  const [currentId, setCurrentId] = useState<SlideId>(1)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const slide = slideById(currentId)

  const goTo = useCallback((id: number) => {
    if (isSlideId(id)) {
      setStatus('loading')
      setCurrentId(id)
    }
  }, [])

  const goBy = useCallback(
    (delta: number) => {
      goTo(currentId + delta)
    },
    [currentId, goTo],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          event.preventDefault()
          goBy(1)
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          goBy(-1)
          break
        case 'Home':
          event.preventDefault()
          goTo(1)
          break
        case 'End':
          event.preventDefault()
          goTo(TOTAL_SLIDES)
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goBy, goTo])

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <span className="pin" aria-hidden="true" />
          <div>
            <p className="kicker">Folder institucional</p>
            <h1>Finamob Curitiba</h1>
          </div>
        </div>
        <a className="download" href={PDF_HREF} download>
          Baixar PDF
        </a>
      </header>

      <main className="stage">
        <button
          className="nav nav-prev"
          type="button"
          onClick={() => goBy(-1)}
          disabled={currentId === 1}
          aria-label="Slide anterior"
        >
          ‹
        </button>

        <figure className="frame">
          {status === 'loading' ? (
            <div className="state" role="status">
              Carregando slide {currentId}…
            </div>
          ) : null}
          {status === 'error' ? (
            <div className="state error" role="alert">
              Não foi possível carregar este slide.{' '}
              <button type="button" onClick={() => setStatus('loading')}>
                Tentar de novo
              </button>
            </div>
          ) : null}
          <img
            key={slide.src}
            src={slide.src}
            alt={`${slide.title}. ${slide.note}.`}
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('error')}
            onAbort={() => setStatus('error')}
          />
          <figcaption>
            <span>
              {currentId} / {TOTAL_SLIDES} — {slide.title}
            </span>
            <span>{slide.note}</span>
          </figcaption>
        </figure>

        <button
          className="nav nav-next"
          type="button"
          onClick={() => goBy(1)}
          disabled={currentId === TOTAL_SLIDES}
          aria-label="Próximo slide"
        >
          ›
        </button>
      </main>

      <nav className="thumbs" aria-label="Slides do folder">
        {SLIDES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === currentId ? 'thumb active' : 'thumb'}
            onClick={() => goTo(item.id)}
            aria-current={item.id === currentId ? 'page' : undefined}
            aria-label={`Ir para ${item.title}`}
          >
            <img src={item.src} alt="" />
            <span>{item.id}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
