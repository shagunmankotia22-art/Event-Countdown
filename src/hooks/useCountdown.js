import { useState, useEffect } from 'react'
import { toDate } from '../lib/datetime.js'

function calculate(targetDate) {
  const target = toDate(targetDate)
  const diff = target ? Math.max(0, target.getTime() - Date.now()) : 0
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: diff <= 0
  }
}

// Live countdown. Recalculates immediately when the target changes (e.g. after an edit).
export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calculate(targetDate))
  useEffect(() => {
    setTimeLeft(calculate(targetDate))
    const id = setInterval(() => setTimeLeft(calculate(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return timeLeft
}
