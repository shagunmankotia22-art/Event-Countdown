import { useState, useEffect, useRef } from 'react'

// Custom hook: live countdown to a target date.
// Demonstrates useState, useEffect (with cleanup), and useRef (interval id).
export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calculate(targetDate))
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(calculate(targetDate))
    }, 1000)

    // cleanup on unmount / targetDate change
    return () => clearInterval(intervalRef.current)
  }, [targetDate])

  return timeLeft
}

function calculate(targetDate) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, isPast: diff <= 0 }
}
