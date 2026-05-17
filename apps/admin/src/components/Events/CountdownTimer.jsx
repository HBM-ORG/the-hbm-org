import React, { useState, useEffect } from 'react';

function parseTargetMs(targetDate) {
  if (targetDate == null || targetDate === '') return NaN;
  if (typeof targetDate === 'number' && Number.isFinite(targetDate)) return targetDate;
  if (targetDate instanceof Date) return targetDate.getTime();
  const s = String(targetDate).trim();
  if (!s) return NaN;
  const ts = Date.parse(s);
  if (!Number.isNaN(ts)) return ts;
  if (s.includes('T')) return new Date(s).getTime();
  return new Date(`${s}T00:00:00`).getTime();
}

const CountdownTimer = ({ targetDate }) => {
  function calculateTimeLeft() {
    let difference;
    const targetMs = parseTargetMs(targetDate);
    if (!Number.isFinite(targetMs))
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    difference = targetMs - Date.now();

    if (isNaN(difference) || difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
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
