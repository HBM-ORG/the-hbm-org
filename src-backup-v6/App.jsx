import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n/context'
import Layout from './components/Layout'
import SEO from './components/SEO'
import Home from './pages/Home'
import Meeter from './pages/Meeter'
import About from './pages/About'
import Events from './pages/Events'
import Knowledge from './pages/Knowledge'

function SEOWrapper({ children }) {
  const location = useLocation()
  return <><SEO path={location.pathname} />{children}</>
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <SEOWrapper>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/meeter" element={<Meeter />} />
              <Route path="/events" element={<Events />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/about" element={<About />} />
              {/* Redirects for old pages */}
              <Route path="/b2b" element={<Meeter />} />
              <Route path="/faq" element={<Meeter />} />
              <Route path="/gallery" element={<Events />} />
              <Route path="/contact" element={<About />} />
            </Route>
          </Routes>
        </SEOWrapper>
      </BrowserRouter>
    </I18nProvider>
  )
}
