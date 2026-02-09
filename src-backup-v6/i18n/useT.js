// Translation helper - picks the right language from content objects
import { useI18n } from './context'

export function useT() {
  const { lang } = useI18n()
  return (obj) => {
    if (!obj) return ''
    if (typeof obj === 'string') return obj
    return obj[lang] || obj.en || obj.he || ''
  }
}
