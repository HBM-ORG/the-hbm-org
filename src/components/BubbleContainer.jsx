import { motion } from 'framer-motion'

/**
 * BubbleContainer - A reusable container component with bubble styling
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display inside the bubble
 * @param {string} props.bgColor - Background color (default: 'white')
 * @param {boolean} props.rotated - Apply slight rotation (default: false)
 * @param {boolean} props.small - Use smaller max-width (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export default function BubbleContainer({ 
  children, 
  bgColor = 'white', 
  rotated = false, 
  small = false,
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`
        bubble-container 
        ${small ? 'bubble-container-sm' : ''} 
        ${rotated ? 'bubble-rotated' : ''}
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </motion.div>
  )
}

/**
 * EyebrowBadge - A small badge component for section labels
 * @param {Object} props
 * @param {string} props.text - Badge text
 * @param {string} props.className - Additional CSS classes
 */
export function EyebrowBadge({ text, className = '' }) {
  return (
    <span className={`eyebrow-badge ${className}`}>
      {text}
    </span>
  )
}
