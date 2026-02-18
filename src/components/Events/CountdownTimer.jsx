import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    // Ensure consistent parsing: targetDate is YYYY-MM-DD
    // Treat it as midnight local time for the event day
    const difference = new Date(targetDate + 'T00:00:00') - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 text-center justify-center">
      {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
        <div key={unit} className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 min-w-[80px]">
          <div className="text-3xl font-bold text-white font-mono">{String(timeLeft[unit]).padStart(2, '0')}</div>
          <div className="text-xs text-gray-300 uppercase tracking-wider">{unit}</div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
