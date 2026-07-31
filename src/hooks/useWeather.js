import { useState, useEffect } from 'react'

// Custom hook: fetches live weather for a location using the Fetch API.
// Demonstrates async/await, Promises, loading/error state, and useEffect cleanup
// to avoid setting state after unmount (race condition guard).
// Uses Open-Meteo — a free, no-API-key weather service.
export function useWeather(locationName) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!locationName) return

    let isCancelled = false

    async function fetchWeather() {
      setLoading(true)
      setError(null)
      try {
        // Step 1: geocode the location name to lat/lon
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
        )
        if (!geoRes.ok) throw new Error('Geocoding request failed')
        const geoData = await geoRes.json()

        const place = geoData.results?.[0]
        if (!place) throw new Error(`No location found for "${locationName}"`)

        // Step 2: fetch current weather for that lat/lon
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true`
        )
        if (!weatherRes.ok) throw new Error('Weather request failed')
        const weatherData = await weatherRes.json()

        if (!isCancelled) {
          setWeather({
            place: place.name,
            country: place.country,
            temperature: weatherData.current_weather?.temperature,
            windspeed: weatherData.current_weather?.windspeed
          })
        }
      } catch (err) {
        if (!isCancelled) setError(err.message)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    fetchWeather()

    return () => {
      isCancelled = true
    }
  }, [locationName])

  return { weather, loading, error }
}
