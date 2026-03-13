import { useState } from 'react'
import { useI18n, t } from '../i18n/context'
import { hbmAnalytics } from '../utils/analytics'
import { getApiBase } from '../utils/api'

export default function NewsletterSection() {
  const { lang } = useI18n()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    try {
      const res = await fetch(`${getApiBase()}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language: lang, source: 'footer_newsletter' })
      })

      if (res.ok) {
        hbmAnalytics.recordRegComplete('newsletter', 'Newsletter Subscription', 'footer')
        setStatus('success')
        setEmail('')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-hbm-cream py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 font-sofia text-hbm-dark tracking-tight">
          {t({en:'Be a Part', he:'היו חלק', es:'Sé parte', fr:'Faites partie', de:'Sei dabei', ar:'كن جزءًا منا'}, lang)}
        </h2>
        <p className="text-hbm-gray text-lg mb-10 font-sofia max-w-2xl mx-auto">
          {t({en:'Get updates on events, connection tips, and HBM news.', he:'קבלו עדכונים על אירועים, טיפים לחיבור וחדשות HBM.', es:'Actualización sobre eventos, consejos de conexión y noticias de HBM.', fr:'Mises à jour sur les événements, astuces de connexion et actualités HBM.', de:'Updates zu Events, Verbindungstipps und HBM-Neuigkeiten.', ar:'تحديثات حول الفعاليات ونصائح التواصل وأخبار HBM.'}, lang)}
        </p>

        <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
          <div className="flex-1">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t({en:'Your Email', he:'האימייל שלך', es:'Tu email', fr:'Votre e-mail', de:'Deine E-Mail', ar:'بريدك الإلكتروني'}, lang)} 
              className="w-full px-6 py-4 rounded-full bg-gray-50 border border-gray-200 text-hbm-dark placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-hbm-orange/20 focus:border-hbm-orange font-sofia text-base transition-all"
              required
              disabled={status === 'loading'}
              dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
          <button 
             type="submit" 
             disabled={status === 'loading'}
             className={`px-10 py-4 rounded-full font-bold shadow-lg text-base transition-transform whitespace-nowrap ${status === 'success' ? 'bg-green-500 text-white' : 'btn-orange text-white hover:scale-105'}`}
          >
            {status === 'loading'
              ? t({en:'Sending...', he:'שולח...', es:'Enviando...', fr:'Envoi...', de:'Wird gesendet...', ar:'جارٍ الإرسال...'}, lang)
              : status === 'success'
              ? t({en:'Welcome!', he:'ברוכים הבאים!', es:'¡Bienvenido!', fr:'Bienvenue !', de:'Willkommen!', ar:'أهلاً وسهلاً!'}, lang)
              : t({en:"I'm in", he:'אני פנימה', es:'Me apunto', fr:"Je m'inscris", de:'Ich bin dabei', ar:'أنا داخل'}, lang)}
          </button>
        </form>
      </div>
    </section>
  )
}
