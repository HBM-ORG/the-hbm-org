import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { I18nProvider } from './i18n/context'
import Layout from './components/Layout'
import SEO from './components/SEO'
import Home from './pages/Home'
import MeeterWhat from './pages/MeeterWhat'
import MeeterWho from './pages/MeeterWho'
import MeeterFeatures from './pages/MeeterFeatures'
import MeeterPricing from './pages/MeeterPricing'
import About from './pages/About'
import Events from './pages/Events'
import Knowledge from './pages/Knowledge'
import EventRegister from './pages/EventRegister'

function SEOWrapper({ children }) {
  const location = useLocation()
  return <><SEO path={location.pathname} />{children}</>
}

function ScrollToHash() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''))
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash, pathname])
  return null
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollToHash />
        <SEOWrapper>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/meeter" element={<MeeterWhat />} />
              <Route path="/meeter/who" element={<MeeterWho />} />
              <Route path="/meeter/features" element={<MeeterFeatures />} />
              <Route path="/meeter/pricing" element={<MeeterPricing />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/register" element={<EventRegister />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/about" element={<About />} />
              {/* Redirects */}
              <Route path="/b2b" element={<MeeterWho />} />
              <Route path="/faq" element={<MeeterWhat />} />
              <Route path="/gallery" element={<Events />} />
              <Route path="/contact" element={<About />} />
            </Route>
          </Routes>
        </SEOWrapper>
      </BrowserRouter>
    </I18nProvider>
  )
}
