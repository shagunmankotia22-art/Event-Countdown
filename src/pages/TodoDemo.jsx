import { useState, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// Standalone mini-project (CHO Lec 13–18): an interactive to-do app.
// Demonstrates ES6+ (spread/destructuring), controlled forms,
// localStorage + JSON persistence, and list rendering.
export default function TodoDemo() {
  const [todos, setTodos] = useLocalStorage('event-countdown:todos', [])
  const [text, setText] = useState('')

  const addTodo = useCallback((e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((prev) => [...prev, { id: Date.now(), text: trimmed, done: false }])
    setText('')
  }, [text, setTodos])

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }, [setTodos])

  const removeTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [setTodos])

  return (
    <div className="glass-card rounded-[2rem] p-10 max-w-lg">
      <h1 className="text-2xl font-display font-bold mb-2">To-Do App</h1>
      <p className="text-xs text-on-surface-variant mb-8">
        Mini-project demo — Lecture 13–18 (DOM events, localStorage, JSON)
      </p>

      <form onSubmit={addTodo} className="flex gap-3 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="bg-primary text-on-primary px-5 rounded-xl font-bold text-sm"
        >
          Add
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No tasks yet — add one above.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className={todo.done ? 'line-through text-on-surface-variant' : ''}>
                  {todo.text}
                </span>
              </label>
              <button
                onClick={() => removeTodo(todo.id)}
                className="text-secondary text-xs"
                aria-label={`Delete ${todo.text}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
