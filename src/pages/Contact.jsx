import { useState } from 'react'
import { MessageCircle, Mail, Send } from 'lucide-react'
import { siteContent } from '../data/content'
import { useT } from '../i18n/useT'
import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import SEO from '../components/SEO'
import { getApiBase } from '../utils/api'

const { contact, global: g } = siteContent

export default function Contact() {
  const tContent = useT()
  const { lang } = useI18n()
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('loading')
    try {
      const base = getApiBase() || ''
      const url = base ? `${base.replace(/\/$/, '')}/api/contact` : '/api/contact'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          type: selectedType != null ? selectedType : undefined,
          language: lang,
        }),
      })
      if (res.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setSubmitStatus('idle'), 3000)
      } else {
        await res.json().catch(() => ({}))
        setSubmitStatus('error')
        setTimeout(() => setSubmitStatus('idle'), 3000)
      }
    } catch {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    }
  }

  return (
    <section className="section-padding bg-white min-h-screen">
      <SEO path="/contact" title={t(ui.contact.seoTitle, lang)} description={t(ui.contact.seoDesc, lang)} />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{tContent(contact.title)}</h1>
        <p className="text-center text-hbm-gray max-w-2xl mx-auto mb-12">{tContent(contact.subtitle)}</p>

        {/* Quick contact buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href={g.whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] text-white font-semibold hover:bg-[#1da851] transition-all hover:scale-[1.02]">
            <MessageCircle size={24} />
            {tContent(contact.whatsappText)}
          </a>
          <a href={g.socialLinks.email}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-hbm-blue text-white font-semibold hover:bg-hbm-blue/90 transition-all hover:scale-[1.02]">
            <Mail size={24} />
            {tContent(contact.emailText)}
          </a>
        </div>

        {/* AI-style type selector */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-hbm-dark text-center mb-6">{tContent(contact.formLabels.type)}</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {(contact?.formLabels?.typeOptions || []).map((opt, i) => (
              <button key={i} onClick={() => setSelectedType(i)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  selectedType === i
                    ? 'bg-hbm-blue text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-hbm-dark hover:bg-gray-200'
                }`}>
                {tContent(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <form className="max-w-lg mx-auto bg-hbm-cream/30 rounded-2xl p-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-hbm-dark mb-1">{tContent(contact.formLabels.name)}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={submitStatus === 'loading'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-hbm-blue focus:ring-2 focus:ring-hbm-blue/20 transition-all disabled:opacity-70" />
            </div>
            <div>
              <label className="block text-sm font-medium text-hbm-dark mb-1">{tContent(contact.formLabels.email)}</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={submitStatus === 'loading'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-hbm-blue focus:ring-2 focus:ring-hbm-blue/20 transition-all disabled:opacity-70" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-hbm-dark mb-1">{tContent(contact.formLabels.message)}</label>
              <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                disabled={submitStatus === 'loading'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-hbm-blue focus:ring-2 focus:ring-hbm-blue/20 transition-all resize-none disabled:opacity-70" required />
            </div>
            <button type="submit" disabled={submitStatus === 'loading'} className="btn-primary w-full disabled:opacity-70 disabled:pointer-events-none">
              <Send size={18} />
              {submitStatus === 'loading'
                ? (lang === 'he' ? 'שולח...' : 'Sending...')
                : submitStatus === 'success'
                  ? (lang === 'he' ? 'נשלח!' : 'Sent!')
                  : submitStatus === 'error'
                    ? (lang === 'he' ? 'שגיאה' : 'Error')
                    : tContent(contact.formLabels.send)}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
