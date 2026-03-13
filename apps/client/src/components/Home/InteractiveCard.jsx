import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function InteractiveCard({ card, index, lang, t }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!cardRef.current) return

    // Detect if mobile/tablet
    const isMobile = window.innerWidth < 768
    
    // Calculate initial offset based on card index
    // Desktop: Card 0: 240px, Card 1: 480px, Card 2: 720px
    // Mobile: Card 0: 80px, Card 1: 160px, Card 2: 240px (reduced for smaller screens)
    const baseOffset = isMobile ? 80 : 240
    const initialOffset = (index + 1) * baseOffset
    
    // Calculate initial rotation (slight rotation for visual interest)
    // Reduce rotation on mobile for cleaner look
    const baseRotation = isMobile ? -1.5 : -2.88
    const initialRotation = (index + 1) * baseRotation

    // Set initial state
    gsap.set(cardRef.current, {
      x: initialOffset,
      rotation: initialRotation,
      opacity: 0
    })

    // Create ScrollTrigger animation
    const animation = gsap.to(cardRef.current, {
      x: 0,
      rotation: 0,
      opacity: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 80%', // Start when top of card is at 80% of viewport
        end: 'top 30%',   // End when top of card is at 30% of viewport
        scrub: 1,         // Smooth scrubbing, takes 1 second to "catch up"
        // markers: true, // Uncomment for debugging
      }
    })

    // Cleanup
    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [index])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateXValue = ((y - centerY) / centerY) * -10
    const rotateYValue = ((x - centerX) / centerX) * 10
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="relative rounded-2xl px-8 py-6 shadow-lg cursor-pointer overflow-hidden"
      style={{
        backgroundColor: card.bgColor,
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.05 : 1})`,
        transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)' 
          : '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      {/* Shine effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${rotateY * 5 + 50}% ${rotateX * 5 + 50}%, rgba(255,255,255,0.3) 0%, transparent 60%)`
            : 'none',
          transition: 'background 0.1s ease-out',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <h3 className="text-lg font-bold text-hbm-dark leading-snug">
              {t(card.title, lang)}
            </h3>
            {t(card.text, lang) && (
              <p className="text-sm text-hbm-gray leading-relaxed mt-2">
                {t(card.text, lang)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        style={{
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </div>
  )
}
