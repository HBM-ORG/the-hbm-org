import { useState } from 'react'
import { Calendar, MapPin, ArrowLeft, ExternalLink } from 'lucide-react'
import { siteContent } from '../data/content'
import { useI18n } from '../i18n/context'
import { useT } from '../i18n/useT'
import { getWhatsappUrl } from '../components/Layout'

const { events } = siteContent

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return { month: months[d.getMonth()], day: d.getDate(), year: d.getFullYear() }
}

function EventCard({ event, onClick, isUpcoming }) {
  const t = useT()
  const date = formatDate(event.date)
  return (
    <div onClick={onClick} className="bg-white rounded-2xl overflow-hidden card-hover cursor-pointer border border-gray-100 group">
      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-hbm-blue/20 to-hbm-lavender/30 overflow-hidden">
        {event.coverImage ? (
          <img src={event.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">🤝</span>
          </div>
        )}
        {/* Date badge */}
        <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 shadow-lg text-center">
          <span className="text-xs font-bold text-hbm-blue block">{date.month}</span>
          <span className="text-2xl font-bold text-hbm-dark block leading-none">{date.day}</span>
        </div>
        {event.type && (
          <span className="absolute top-4 right-4 bg-hbm-dark/70 text-white text-xs font-semibold px-3 py-1 rounded-full">{event.type}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-lg text-hbm-dark mb-2 group-hover:text-hbm-blue transition-colors">{t(event.title)}</h3>
        <p className="text-hbm-gray text-sm mb-3 line-clamp-2">{t(event.description)}</p>
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-hbm-gray">
            <MapPin size={14} />
            <span>{t(event.location)}</span>
          </div>
        )}
        {isUpcoming && event.registerUrl && (
          <a href={event.registerUrl} onClick={e => e.stopPropagation()}
            className="btn-primary text-sm py-2.5 px-6 mt-4 w-full">
            {t({ en: 'Register', he: 'הרשמה' })}
          </a>
        )}
      </div>
    </div>
  )
}

function EventDetail({ event, onBack }) {
  const t = useT()
  const { lang } = useI18n()
  const date = formatDate(event.date)
  const hasGallery = event.gallery && event.gallery.length > 0

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-hbm-blue hover:text-hbm-dark transition-colors mb-8 font-medium">
        <ArrowLeft size={18} />
        {t({ en: 'Back to Events', he: 'חזרה לאירועים' })}
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
        {event.coverImage ? (
          <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-hbm-blue/20 to-hbm-coral/20 flex items-center justify-center">
            <span className="text-8xl opacity-20">🤝</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white rounded-xl px-3 py-2 text-center">
              <span className="text-xs font-bold text-hbm-blue block">{date.month}</span>
              <span className="text-2xl font-bold text-hbm-dark block leading-none">{date.day}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t(event.title)}</h1>
              {event.location && (
                <p className="flex items-center gap-1 text-white/80 text-sm mt-1">
                  <MapPin size={14} /> {t(event.location)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-12">
        <p className="text-lg text-hbm-gray leading-relaxed">{t(event.description)}</p>
        {event.registerUrl && event.registerUrl !== '#' && (
          <a href={event.registerUrl} className="btn-primary mt-6 inline-flex">
            {t({ en: 'Register Now', he: 'הירשמו עכשיו' })} <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* Gallery */}
      <div>
        <h2 className="text-2xl font-[var(--font-display)] text-hbm-blue mb-6">
          {t({ en: 'Event Gallery', he: 'גלריית האירוע' })}
        </h2>
        {hasGallery ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {event.gallery.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-3xl text-gray-300">📸</span>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-hbm-gray/50 text-sm mt-4">
          {t({ en: 'Photos will be uploaded after the event', he: 'תמונות יועלו לאחר האירוע' })}
        </p>
      </div>
    </div>
  )
}

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const t = useT()
  const { lang } = useI18n()

  const currentEvents = tab === 'upcoming' ? events.upcoming : events.past

  if (selectedEvent) {
    return (
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[var(--font-display)] text-hbm-blue text-center mb-4">{t(events.title)}</h1>
        <p className="text-center text-hbm-gray max-w-2xl mx-auto mb-10">{t(events.subtitle)}</p>

        {/* Tab toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <button onClick={() => setTab('upcoming')}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${tab === 'upcoming' ? 'bg-hbm-blue text-white' : 'bg-gray-100 text-hbm-dark hover:bg-gray-200'}`}>
            {t({ en: 'Upcoming', he: 'קרובים' })}
          </button>
          <button onClick={() => setTab('past')}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${tab === 'past' ? 'bg-hbm-blue text-white' : 'bg-gray-100 text-hbm-dark hover:bg-gray-200'}`}>
            {t({ en: 'Past Events', he: 'אירועים קודמים' })}
          </button>
        </div>

        {/* Events grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event, i) => (
            <EventCard key={event.id} event={event} isUpcoming={tab === 'upcoming'}
              onClick={() => setSelectedEvent(event)} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-hbm-gray mb-4">{t({ en: 'Want to host an event with HBM?', he: 'רוצים לארגן אירוע עם HBM?' })}</p>
          <a href={getWhatsappUrl(lang)} target="_blank" rel="noopener noreferrer" className="btn-primary">
            {t({ en: "Let's Talk", he: 'בואו נדבר' })}
          </a>
        </div>
      </div>
    </section>
  )
}
