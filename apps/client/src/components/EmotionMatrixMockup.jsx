import { useState, useRef } from 'react'
import { useI18n, t } from '../i18n/context'

const colorShades = {
  blue:   ["#E3F2FD","#90CAF9","#42A5F5","#1E88E5","#0D47A1"],
  red:    ["#FFEBEE","#FFCDD2","#EF9A9A","#E57373","#D32F2F"],
  yellow: ["#FFFDE7","#FFF59D","#FFF176","#FFEB3B","#FBC02D"],
  green:  ["#E8F5E9","#A5D6A7","#66BB6A","#43A047","#1B5E20"]
}

const feelings = {
  red: [
    { en: "Furious", he: "זועם" }, { en: "Upset", he: "מוטרד" }, { en: "Angry", he: "כועס" },
    { en: "Hateful", he: "שונא" }, { en: "Jealous", he: "מקנא" }, { en: "Anxious", he: "חרד" },
    { en: "Humiliated", he: "מושפל" }, { en: "Stressed", he: "לחוץ" }, { en: "Worried", he: "מודאג" }
  ],
  yellow: [
    { en: "Passionate", he: "נלהב" }, { en: "Energetic", he: "אנרגטי" }, { en: "Happy", he: "שמח" },
    { en: "Curious", he: "סקרן" }, { en: "Courageous", he: "אמיץ" }, { en: "Joyful", he: "מאושר" },
    { en: "Excited", he: "נרגש" }, { en: "Hopeful", he: "מלא תקווה" }, { en: "Fulfilled", he: "מסופק" }
  ],
  blue: [
    { en: "Insulted", he: "נעלב" }, { en: "Frustrated", he: "מתוסכל" }, { en: "Sad", he: "עצוב" },
    { en: "Hopeless", he: "חסר תקווה" }, { en: "Exhausted", he: "תשוש" }, { en: "Disappointed", he: "מאוכזב" },
    { en: "Depressed", he: "מדוכא" }, { en: "Guilty", he: "אשם" }, { en: "Regret", he: "מתחרט" }
  ],
  green: [
    { en: "Safe", he: "בטוח" }, { en: "Inspired", he: "מקבל השראה" }, { en: "In Love", he: "מאוהב" },
    { en: "Satisfied", he: "מרוצה" }, { en: "Relaxed", he: "רגוע" }, { en: "Calm", he: "שלו" },
    { en: "Comfortable", he: "נינוח" }, { en: "Grateful", he: "אסיר תודה" }, { en: "At Peace", he: "בשלמות" }
  ]
}

export default function EmotionMatrixMockup() {
  const { lang } = useI18n()
  const matrixRef = useRef(null)
  
  const [currentFeeling, setCurrentFeeling] = useState({ en: 'How do you feel?', he: 'איך אתה מרגיש?' })
  const [bgColor, setBgColor] = useState('#FAF9F5')
  const [markerPos, setMarkerPos] = useState(null)

  const getShadeIndex = (rx, ry) => {
    const dx = Math.abs(rx - 0.5)
    const dy = Math.abs(ry - 0.5)
    return Math.min(4, Math.floor((dx + dy) * 5))
  }

  const handlePointerMove = (e) => {
    if (!matrixRef.current) return
    const rect = matrixRef.current.getBoundingClientRect()
    
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    let x = clientX - rect.left
    let y = clientY - rect.top

    // Clamp values
    if (x < 0) x = 0
    if (x > rect.width) x = rect.width
    if (y < 0) y = 0
    if (y > rect.height) y = rect.height

    const rx = x / rect.width
    const ry = y / rect.height

    setMarkerPos({ x, y })

    let q = ''
    if (rx < 0.5 && ry < 0.5) q = 'red'
    else if (rx >= 0.5 && ry < 0.5) q = 'yellow'
    else if (rx < 0.5 && ry >= 0.5) q = 'blue'
    else q = 'green'

    const lx = rx < 0.5 ? rx * 2 : (rx - 0.5) * 2
    const ly = ry < 0.5 ? ry * 2 : (ry - 0.5) * 2
    const col = Math.min(2, Math.floor(lx * 3))
    const row = Math.min(2, Math.floor(ly * 3))
    const idx = row * 3 + col

    const feeling = feelings[q][idx]
    if (feeling) setCurrentFeeling(feeling)

    const shade = getShadeIndex(rx, ry)
    setBgColor(colorShades[q][shade])
  }

  return (
    <div className="w-full flex justify-center items-center">
      {/* Phone Mockup ONLY */}
      <div className="relative w-[260px]">
        {/* Phone Frame */}
        <div className="bg-white rounded-[40px] p-2 shadow-xl border-2 border-gray-200 relative">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-20" />
          
          {/* Screen */}
          <div 
            className="bg-white rounded-[32px] overflow-hidden aspect-[9/19] relative border border-gray-100 flex flex-col items-center transition-colors duration-300 pointer-events-auto"
            style={{ backgroundColor: bgColor }}
          >
            {/* Top Area (Header) */}
            <div className="w-full pt-6 pb-2 px-4 text-center z-10 shrink-0">
               <div className="w-14 h-14 bg-white rounded-full mx-auto p-1 shadow-sm mb-4">
                 <img src="/assets/emotion-logo.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <h3 className="font-bold text-2xl drop-shadow-sm mt-2 transition-all" style={{color: '#C6A1B2'}}>
                  {t({ en: 'How do you feel?', he: 'איך אתה מרגיש?' }, lang)}
               </h3>
            </div>

            {/* Matrix Interactive Area */}
            <div className="flex-grow flex items-center justify-center w-full px-2 mt-2 mb-10 overflow-hidden shrink-0">
               <div 
                  ref={matrixRef}
                  className="relative w-full aspect-square rounded-[20%] bg-white/20 backdrop-blur-md shadow-inner border border-white/30 cursor-crosshair touch-none"
                  onPointerDown={handlePointerMove}
                  onPointerMove={(e) => {
                    // Only track if pressure/buttons are active (mouse drag) or touch
                    if (e.buttons > 0 || e.pointerType === 'touch') {
                      handlePointerMove(e)
                    }
                  }}
               >
                  {/* Axis Cross */}
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-900/10 -translate-y-1/2" />
                  <div className="absolute top-0 left-1/2 w-[2px] h-full bg-gray-900/10 -translate-x-1/2" />
                  
                  {/* Labels Inside */}
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 uppercase tracking-widest">{t({ en: 'High', he: 'גבוה' }, lang)}</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 uppercase tracking-widest">{t({ en: 'Low', he: 'נמוך' }, lang)}</span>
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-700 uppercase tracking-widest">{t({ en: 'Neg', he: 'שלילי' }, lang)}</span>
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-gray-700 uppercase tracking-widest">{t({ en: 'Pos', he: 'חיובי' }, lang)}</span>
                  
                  {/* Marker */}
                  {markerPos && (
                    <div 
                      className="absolute w-4 h-4 bg-gray-900 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
                      style={{ left: markerPos.x, top: markerPos.y }}
                    />
                  )}

                  {/* Feeling Label (Center) */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors duration-200 pointer-events-none whitespace-nowrap"
                    style={{ backgroundColor: bgColor, color: '#000' }}
                  >
                    {t(currentFeeling, lang)}
                  </div>
               </div>
            </div>

            <div className="absolute bottom-5 left-0 w-full text-center">
              <p className="text-xs text-black/50 font-bold px-4 leading-tight">
                {t({ en: 'Drag to select your emotion', he: 'גררו כדי לבחור רגש' }, lang)}
              </p>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-400 rounded-full z-20" />
        </div>
      </div>
    </div>
  )
}
