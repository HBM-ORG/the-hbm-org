import { Link } from 'react-router-dom'
import { Instagram, MessageCircle, Facebook, Linkedin, Mail, Youtube } from 'lucide-react'
import { siteContent } from '../data/content'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'

const { global } = siteContent

const platformIcons = {
  Instagram, WhatsApp: MessageCircle, Facebook, LinkedIn: Linkedin, YouTube: Youtube, Email: Mail,
}

export default function Footer() {
  const { lang } = useI18n()

  return (
    <footer className="bg-hbm-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-center mb-12">
          {t(ui.footer.title, lang)}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {global.footer.socialCards.map((card) => {
            const Icon = platformIcons[card.platform]
            return (
              <a key={card.platform} href={card.url} target="_blank" rel="noopener noreferrer"
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  {Icon && <Icon size={20} className="text-hbm-coral" />}
                  <span className="font-semibold text-sm">{card.platform}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {card.text}
                </p>
              </a>
            )
          })}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={global.logo} alt="HBM" className="h-8 w-auto brightness-0 invert" />
            <span className="text-sm text-gray-400">{t(ui.footer.copyright, lang)}</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t(ui.footer.privacy, lang)}
            </Link>
            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t(ui.footer.terms, lang)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
