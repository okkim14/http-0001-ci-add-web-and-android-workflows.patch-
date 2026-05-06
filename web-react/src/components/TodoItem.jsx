import React, { useState, useRef } from 'react'

export default function TodoItem({ todo, onToggle, onDelete, onEdit }){
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  function startEdit(){ setEditing(true); setTimeout(()=>inputRef.current?.focus(),0) }
  function finishEdit(save){ if(!save) { setEditing(false); return } const v=inputRef.current.value.trim(); if(!v){ onDelete(); } else { onEdit(v); setEditing(false) } }

  return (
    <div className="todo-item" role="listitem" aria-label={`Task: ${todo.text}`}>
      <button className={`check ${todo.completed? 'completed':''}`} aria-pressed={todo.completed} aria-label={todo.completed? 'Mark as incomplete' : 'Mark as complete'} onClick={onToggle}>
        {todo.completed ? '✓' : ''}
      </button>
      {editing ? (
        <input ref={inputRef} defaultValue={todo.text} onKeyDown={(e)=>{ if(e.key==='Enter') finishEdit(true); if(e.key==='Escape') finishEdit(false) }} onBlur={()=>finishEdit(true)} aria-label={`Edit task ${todo.text}`} />
      ) : (
        <div className={`todo-text ${todo.completed? 'completed':''}`} tabIndex={0} onDoubleClick={startEdit} onKeyDown={(e)=>{ if(e.key==='Enter'){ startEdit() } }}>
          {todo.text}
        </div>
      )}
      <div className="todo-actions">
        <button onClick={startEdit} aria-label={`Edit ${todo.text}`}>Edit</button>
        <button onClick={onDelete} aria-label={`Delete ${todo.text}`}>Delete</button>
      </div>
    </div>
  )
}
