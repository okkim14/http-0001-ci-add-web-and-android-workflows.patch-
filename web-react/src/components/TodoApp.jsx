import React, { useState, useEffect, useMemo, useRef } from 'react'
import TodoItem from './TodoItem'

const STORAGE_KEY = 'nexus_v9_todos_v2'

function useLocalStorageState(key, defaultValue){
  const [state, setState] = useState(() => {
    try{
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : defaultValue
    }catch(e){
      console.error('load error', e)
      return defaultValue
    }
  })
  useEffect(() => {
    try{ localStorage.setItem(key, JSON.stringify(state)) }catch(e){console.error('save error', e)}
  }, [key, state])
  return [state, setState]
}

export default function TodoApp(){
  const [todos, setTodos] = useLocalStorageState(STORAGE_KEY, [])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const newRef = useRef(null)
  const searchRef = useRef(null)

  // keyboard shortcuts
  useEffect(()=>{
    function onKey(e){
      if (e.ctrlKey && e.key.toLowerCase() === 'n'){
        e.preventDefault(); newRef.current?.focus()
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'k'){
        e.preventDefault(); searchRef.current?.focus()
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT'){
        e.preventDefault(); searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

  function addTodo(text){
    const t = text?.trim()
    if (!t) return
    setTodos(prev => [{ id: uid(), text: t, completed: false, createdAt: Date.now(), updatedAt: Date.now() }, ...prev])
  }
  function toggle(id){ setTodos(prev => prev.map(t => t.id===id?({...t, completed: !t.completed, updatedAt: Date.now()}):t)) }
  function remove(id){ setTodos(prev => prev.filter(t=>t.id!==id)) }
  function edit(id, newText){ setTodos(prev => prev.map(t=> t.id===id?({...t, text:newText, updatedAt:Date.now()}):t)) }
  function clearCompleted(){ if (!confirm('Remove all completed tasks?')) return; setTodos(prev => prev.filter(t=>!t.completed)) }

  const visible = useMemo(()=> todos.filter(t=>{
    if (filter==='active' && t.completed) return false
    if (filter==='completed' && !t.completed) return false
    if (query && !t.text.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [todos, filter, query])

  function exportJSON(){
    const blob = new Blob([JSON.stringify({ exportedAt:Date.now(), todos }, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `todos-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url)
  }

  function importFile(file){
    const reader = new FileReader()
    reader.onload = e => {
      try{
        const parsed = JSON.parse(e.target.result)
        if (parsed && Array.isArray(parsed.todos)){
          const existing = new Set(todos.map(t=>t.id))
          const incoming = parsed.todos.filter(t=>!existing.has(t.id))
          setTodos(prev => [...incoming, ...prev])
          alert(`Imported ${incoming.length} tasks`)
        } else alert('Invalid file format')
      }catch(err){ alert('Import failed: '+err.message) }
    }
    reader.readAsText(file)
  }

  return (
    <section className="todo-app" aria-label="To-do application">
      <div className="controls">
        <div className="entry">
          <input ref={newRef} aria-label="New task" placeholder="Add a new task and press Enter" onKeyDown={(e)=>{ if(e.key==='Enter'){ addTodo(e.target.value); e.target.value=''} }} />
          <button onClick={()=>{ const v=newRef.current.value; addTodo(v); newRef.current.value=''}} aria-label="Add task">Add</button>
        </div>
        <div className="search-filter">
          <input ref={searchRef} aria-label="Search tasks" placeholder="Search... (Ctrl+K or /)" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <div role="tablist" aria-label="Filter tasks" className="filters">
            <button role="tab" aria-selected={filter==='all'} onClick={()=>setFilter('all')}>All</button>
            <button role="tab" aria-selected={filter==='active'} onClick={()=>setFilter('active')}>Active</button>
            <button role="tab" aria-selected={filter==='completed'} onClick={()=>setFilter('completed')}>Completed</button>
          </div>
        </div>
      </div>

      <div className="list-section" role="list" aria-label="Task list">
        {visible.length===0 ? <div className="empty" role="status">No tasks</div> : visible.map(t=> (
          <TodoItem key={t.id} todo={t} onToggle={()=>toggle(t.id)} onDelete={()=>remove(t.id)} onEdit={(text)=>edit(t.id,text)} />
        ))}
      </div>

      <div className="footer">
        <div aria-live="polite">{todos.filter(t=>!t.completed).length} task{todos.filter(t=>!t.completed).length!==1?'s':''} remaining</div>
        <div className="actions">
          <button onClick={clearCompleted}>Clear completed</button>
          <button onClick={exportJSON}>Export</button>
          <label className="import" aria-label="Import tasks">
            <input type="file" accept="application/json" onChange={(e)=>{ const f=e.target.files[0]; if(f) importFile(f); e.target.value='';}} />
            <span>Import</span>
          </label>
        </div>
      </div>
    </section>
  )
}
