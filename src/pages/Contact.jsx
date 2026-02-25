import { useState } from 'react'
import { MessageCircle, Mail, Send } from 'lucide-react'
import { siteContent } from '../data/content'
import { useT } from '../i18n/useT'

const { contact, global: g } = siteContent

export default function Contact() {
  const t = useT()
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  return (
    <section className="section-padding bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{t(contact.title)}</h1>
        <p className="text-center text-hbm-gray max-w-2xl mx-auto mb-12">{t(contact.subtitle)}</p>

        {/* Quick contact buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href={g.whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] text-white font-semibold hover:bg-[#1da851] transition-all hover:scale-[1.02]">
            <MessageCircle size={24} />
            {t(contact.whatsappText)}
          </a>
          <a href={g.socialLinks.email}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-hbm-blue text-white font-semibold hover:bg-hbm-blue/90 transition-all hover:scale-[1.02]">
            <Mail size={24} />
            {t(contact.emailText)}
          </a>
        </div>

        {/* AI-style type selector */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-hbm-dark text-center mb-6">{t(contact.formLabels.type)}</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {(contact?.formLabels?.typeOptions || []).map((opt, i) => (
              <button key={i} onClick={() => setSelectedType(i)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  selectedType === i
                    ? 'bg-hbm-blue text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-hbm-dark hover:bg-gray-200'
                }`}>
                {t(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="max-w-lg mx-auto bg-hbm-cream/30 rounded-2xl p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-hbm-dark mb-1">{t(contact.formLabels.name)}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-hbm-blue focus:ring-2 focus:ring-hbm-blue/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-hbm-dark mb-1">{t(contact.formLabels.email)}</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-hbm-blue focus:ring-2 focus:ring-hbm-blue/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-hbm-dark mb-1">{t(contact.formLabels.message)}</label>
              <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-hbm-blue focus:ring-2 focus:ring-hbm-blue/20 transition-all resize-none" />
            </div>
            <button className="btn-primary w-full">
              <Send size={18} />
              {t(contact.formLabels.send)}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
