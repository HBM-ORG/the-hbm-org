import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FAQ from './pages/FAQ'
import About from './pages/About'
import B2B from './pages/B2B'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="about" element={<About />} />
        <Route path="b2b" element={<B2B />} />
      </Route>
    </Routes>
  )
}
