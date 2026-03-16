import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Prevent iOS Safari viewport jumping when keyboard opens
if (typeof window !== 'undefined' && window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    // Keep the document anchored to the top when keyboard appears
    document.documentElement.style.height = `${window.visualViewport!.height}px`
    window.scrollTo(0, 0)
  })
  window.visualViewport.addEventListener('scroll', () => {
    window.scrollTo(0, 0)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LazyMotion features={domAnimation}>
        <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          <App />
        </MotionConfig>
      </LazyMotion>
    </ErrorBoundary>
  </StrictMode>,
)
