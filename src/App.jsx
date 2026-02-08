import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { I18nProvider } from './i18n/context'
import Layout from './components/Layout'
import SEO from './components/SEO'
import Home from './pages/Home'
import Meeter from './pages/Meeter'
import About from './pages/About'
import B2B from './pages/B2B'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Events from './pages/Events'

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
              <Route path="/faq" element={<Meeter />} />
              <Route path="/about" element={<About />} />
              <Route path="/b2b" element={<B2B />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Routes>
        </SEOWrapper>
      </BrowserRouter>
    </I18nProvider>
  )
}
