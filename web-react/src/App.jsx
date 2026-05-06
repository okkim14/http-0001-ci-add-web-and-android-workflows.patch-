import React from 'react'
import TodoApp from './components/TodoApp'

export default function App(){
  return (
    <div className="app-root">
      <header>
        <h1>Nexus v9 — To‑Do (React)</h1>
        <p className="sr-only" aria-hidden>Keyboard shortcuts: Ctrl+N focus new task, Ctrl+K focus search</p>
      </header>
      <main>
        <TodoApp />
      </main>
    </div>
  )
}
