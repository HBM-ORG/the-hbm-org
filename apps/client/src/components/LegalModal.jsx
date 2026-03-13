import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function LegalModal({ isOpen, onClose, title, content }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => document.body.style.overflow = 'unset'
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl relative animate-scaleIn" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-hbm-dark" />
        </button>
        
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6 text-hbm-purple font-sofia">{title}</h2>
          <div className="prose prose-lg text-hbm-gray font-sofia">
            {content || (
              <div className="space-y-4">
                <p>Content coming soon.</p>
                <p className="opacity-50 text-sm">(Placeholder for {title})</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
