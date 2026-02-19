import { Outlet } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import NewsletterSection from './NewsletterSection'
import { useI18n } from '../i18n/context'

const whatsappMessages = {
  en: "Hi! I'd like to learn more about The HBM and connect.",
  he: 'היי! אשמח לשמוע עוד על The HBM ולהתחבר.',
  es: '¡Hola! Me gustaría saber más sobre The HBM y conectar.',
  fr: 'Bonjour ! Je voudrais en savoir plus sur The HBM et me connecter.',
  de: 'Hallo! Ich möchte mehr über The HBM erfahren und mich verbinden.',
  ar: 'مرحبًا! أود معرفة المزيد عن The HBM والتواصل.',
}

export function getWhatsappUrl(lang) {
  const msg = encodeURIComponent(whatsappMessages[lang] || whatsappMessages.en)
  return `https://wa.me/972587073136?text=${msg}`
}

export default function Layout() {
  const { lang } = useI18n()
  const whatsappUrl = getWhatsappUrl(lang)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <NewsletterSection />
      <Footer />
      <div className="whatsapp-float-container">
        <span className="whatsapp-label">Contact Us</span>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          className="whatsapp-float" aria-label="Contact us on WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
            <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
          </svg>
        </a>
      </div>
    </div>
  )
}
