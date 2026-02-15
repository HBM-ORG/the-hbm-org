import React from 'react'

export default function BubbleContainer({ 
  children, 
  bgColor = 'white',
  rotated = false,
  size = 'default',
  className = ''
}) {
  const sizeClass = size === 'sm' ? 'bubble-container-sm' : ''
  const rotatedClass = rotated ? 'bubble-rotated' : ''
  
  return (
    <div 
      className={`bubble-container ${sizeClass} ${rotatedClass} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {children}
    </div>
  )
}
