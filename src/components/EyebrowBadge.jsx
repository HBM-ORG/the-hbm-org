import React from 'react'

export default function EyebrowBadge({ text, className = '' }) {
  return (
    <span className={`eyebrow-badge ${className}`}>
      {text}
    </span>
  )
}
