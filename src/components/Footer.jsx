import { useI18n, t } from '../i18n/context'
import { ui } from '../i18n/translations'
import { siteContent } from '../data/content'

const { global } = siteContent

export default function Footer() {
  const { lang } = useI18n()
  return (
    <footer>
      {/* Newsletter */}
      <div className="bg-white py-12 text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-hbm-purple mb-2">{t({en:"Don't miss the next connection.",he:'אל תפספסו את החיבור הבא.'},lang)}</h3>
        <p className="text-hbm-gray mb-6 max-w-md mx-auto px-6">{t({en:'Join the HBM circle to get updates on upcoming events, community insights, and early access.',he:'הצטרפו למעגל HBM לקבלת עדכונים על אירועים קרובים ותובנות קהילתיות.'},lang)}</p>
        <div className="max-w-md mx-auto px-6 flex gap-2">
          <input type="email" placeholder={t(ui.newsletter.placeholder,lang)} className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-hbm-purple"/>
          <button className="btn-orange py-3 px-8 rounded-full">{t({en:'Join the Circle',he:'הצטרפו למעגל'},lang)}</button>
        </div>
      </div>

      {/* Main footer — gradient */}
      <div style={{background:'linear-gradient(180deg,#bbc0ff 0%,#8584C7 50%,#6160AB 100%)'}} className="text-white">
        {/* Fixed Motto */}
        <div className="text-center pt-12 pb-4">
          <p className="text-2xl md:text-3xl font-bold mb-2">Do good and do it good!</p>
          <p className="text-xl font-semibold italic opacity-90">One Movement. Many Ways to Reach Us.</p>
        </div>

        {/* Social cards */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {global.footer.socialCards.filter(c => c.platform !== 'YouTube').map((card,i) => (
              <a key={i} href={card.url} target="_blank" rel="noopener noreferrer" className="group">
                <h4 className="font-bold text-lg mb-2 group-hover:underline">{card.platform}</h4>
                <p className="text-sm opacity-80 leading-relaxed">{card.text}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Big logo */}
        <div className="text-center pb-8">
          <h2 className="text-5xl md:text-7xl font-bold opacity-40">The HBM</h2>
          <p className="text-lg opacity-60 mt-2">{t(global.tagline,lang)}</p>
        </div>

        <div className="border-t border-white/20 py-5">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm opacity-60">
            <p>{t(ui.footer.copyright,lang)}</p>
            <div className="flex gap-6"><span>{t(ui.footer.terms,lang)}</span><span>{t(ui.footer.privacy,lang)}</span></div>
          </div>
        </div>
      </div>
    </footer>
  )
}
