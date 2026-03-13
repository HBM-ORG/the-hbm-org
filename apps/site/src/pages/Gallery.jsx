import { siteContent } from '../data/content'
import { useT } from '../i18n/useT'

const { gallery } = siteContent

export default function Gallery() {
  const t = useT()
  const hasImages = gallery.images && gallery.images.length > 0

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{t(gallery.title)}</h1>
        <p className="text-center text-hbm-gray max-w-2xl mx-auto mb-12">{t(gallery.subtitle)}</p>

        {hasImages ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                <img src={img.src} alt={img.alt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl text-gray-300">📸</span>
                </div>
              ))}
            </div>
            <p className="text-hbm-gray text-lg">
              {t({ en: 'Photos from our events are coming soon!', he: 'תמונות מהאירועים שלנו בקרוב!' })}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
