import { useState, useCallback } from 'react'

// Standalone mini-project (CHO Lec 19–24): a simple counter app.
// Demonstrates useState, useCallback, and basic controlled UI without external state.
export default function CounterDemo() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)

  const increment = useCallback(() => setCount((c) => c + step), [step])
  const decrement = useCallback(() => setCount((c) => c - step), [step])
  const reset = useCallback(() => setCount(0), [])

  return (
    <div className="glass-card rounded-[2rem] p-10 max-w-md">
      <h1 className="text-2xl font-display font-bold mb-2">Counter App</h1>
      <p className="text-xs text-on-surface-variant mb-8">
        Mini-project demo — Lecture 19–24 (useState, controlled inputs)
      </p>

      <p className="monospaced-timer text-6xl font-extrabold text-primary text-center mb-8">
        {count}
      </p>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={decrement}
          className="w-12 h-12 rounded-full bg-secondary/20 text-secondary text-xl font-bold"
          aria-label="Decrement"
        >
          −
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-full border border-white/20 text-sm"
        >
          Reset
        </button>
        <button
          onClick={increment}
          className="w-12 h-12 rounded-full bg-tertiary/20 text-tertiary text-xl font-bold"
          aria-label="Increment"
        >
          +
        </button>
      </div>

      <label className="block text-center">
        <span className="block text-xs uppercase text-on-surface-variant mb-2">
          Step size
        </span>
        <input
          type="number"
          min="1"
          value={step}
          onChange={(e) => setStep(Number(e.target.value) || 1)}
          className="w-24 mx-auto block text-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-primary"
        />
      </label>
    </div>
  )
}
