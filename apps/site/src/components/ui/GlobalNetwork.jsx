import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CITIES = [
  { id: 'tel-aviv', name: 'Tel Aviv', x: 58.5, y: 38 },
  { id: 'new-york', name: 'New York', x: 23, y: 34 },
  { id: 'london', name: 'London', x: 48, y: 26 },
  { id: 'tokyo', name: 'Tokyo', x: 86, y: 38 },
  { id: 'dubai', name: 'Dubai', x: 62, y: 46 },
  { id: 'berlin', name: 'Berlin', x: 51, y: 28 },
];

const BEAM_PAIRS = [
  ['tel-aviv', 'new-york'],
  ['tel-aviv', 'london'],
  ['tel-aviv', 'dubai'],
  ['london', 'new-york'],
  ['tokyo', 'dubai'],
  ['berlin', 'tel-aviv'],
  ['london', 'berlin'],
  ['new-york', 'tokyo'],
  ['dubai', 'london'],
];

const ConnectionBeam = ({ start, end, onComplete }) => {
  const path = useMemo(() => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Dynamic curvature based on distance
    const dr = distance * 1.2;
    // Control pull direction (upwards for "flight" feel)
    const sweep = start.x < end.x ? 1 : 0;
    return `M ${start.x} ${start.y} A ${dr} ${dr} 0 0 ${sweep} ${end.x} ${end.y}`;
  }, [start, end]);

  return (
    <motion.path
      d={path}
      fill="none"
      stroke="url(#beamGradient)"
      strokeWidth="0.8"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: [0, 1, 1],
        opacity: [0, 1, 0],
        pathOffset: [0, 0, 1]
      }}
      transition={{ 
        duration: 4, 
        ease: "easeInOut",
        times: [0, 0.4, 1]
      }}
      onAnimationComplete={onComplete}
      style={{
        filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))',
      }}
    />
  );
};

export const GlobalNetwork = () => {
  const [activeBeams, setActiveBeams] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fireBeam = () => {
      if (activeBeams.length > (isMobile ? 2 : 4)) return;

      const randomPair = BEAM_PAIRS[Math.floor(Math.random() * BEAM_PAIRS.length)];
      const startCity = CITIES.find(c => c.id === randomPair[0]);
      const endCity = CITIES.find(c => c.id === randomPair[1]);
      
      const newBeam = {
        id: Math.random(),
        start: startCity,
        end: endCity
      };

      setActiveBeams(prev => [...prev, newBeam]);
    };

    const interval = setInterval(fireBeam, isMobile ? 4000 : 2500);
    return () => clearInterval(interval);
  }, [activeBeams, isMobile]);

  const removeBeam = (id) => {
    setActiveBeams(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none translate-y-[-10%] md:translate-y-0">
      
      {/* World Map Background Layer */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full opacity-[0.04] grayscale brightness-[0.8]" 
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="dotMap" width="1.5" height="1.5" patternUnits="userSpaceOnUse">
             <circle cx="0.5" cy="0.5" r="0.4" fill="#6160AB" />
          </pattern>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F07B3C" />
          </linearGradient>
        </defs>
        
        {/* Semi-transparent rect with dot pattern to simulate world texture */}
        <rect width="100" height="100" fill="url(#dotMap)" />
        
        {/* Very faint dashed lines for equator/meridians */}
        <line x1="0" y1="40" x2="100" y2="40" stroke="#6160AB" strokeWidth="0.05" strokeDasharray="1,2" opacity="0.3" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="#6160AB" strokeWidth="0.05" strokeDasharray="1,2" opacity="0.3" />
      </svg>

      {/* Interactive Layer: Hotspots and Beams */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <AnimatePresence>
          {activeBeams.map(beam => (
            <ConnectionBeam 
              key={beam.id}
              start={beam.start}
              end={beam.end}
              onComplete={() => removeBeam(beam.id)}
            />
          ))}
        </AnimatePresence>

        {CITIES.map(city => (
          <g key={city.id}>
            {/* Pulsing Beacon */}
            <motion.circle
              cx={city.x}
              cy={city.y}
              r="2"
              fill="url(#beamGradient)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0.8, 2.5], 
                opacity: [0.4, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeOut" 
              }}
            />
            {/* Core Hotspot */}
            <circle
              cx={city.x}
              cy={city.y}
              r="0.4"
              fill="#F07B3C"
              className="drop-shadow-[0_0_4px_rgba(240,123,60,0.8)]"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default GlobalNetwork;
