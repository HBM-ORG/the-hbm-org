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
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        className="whatsapp-float" aria-label="Contact us on WhatsApp">
        <MessageCircle size={28} className="text-white" />
      </a>
    </div>
  )
}
