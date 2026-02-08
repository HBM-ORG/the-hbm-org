import { Link } from 'react-router-dom'
import { Instagram, MessageCircle, Facebook, Linkedin, Mail } from 'lucide-react'
import { socialLinks, footerContent, siteConfig } from '../data/content'

const iconMap = {
  Instagram,
  MessageCircle,
  Facebook,
  Linkedin,
  Mail,
}

export default function Footer() {
  return (
    <footer className="bg-hbm-dark text-white">
      {/* Social Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl md:text-3xl font-[var(--font-display)] text-center mb-12">
          One Movement. Many Ways to Reach Us.
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {socialLinks.map((link) => {
            const Icon = iconMap[link.icon]
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  {Icon && <Icon size={20} className="text-hbm-coral" />}
                  <span className="font-semibold text-sm">{link.name}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {link.description}
                </p>
              </a>
            )
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-hbm-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm font-[var(--font-display)]">H</span>
            </div>
            <span className="text-sm text-gray-400">{footerContent.copyright}</span>
          </div>

          <div className="flex gap-6">
            {footerContent.links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
