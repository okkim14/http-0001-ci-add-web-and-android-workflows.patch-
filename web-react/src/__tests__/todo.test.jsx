import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import TodoApp from '../components/TodoApp'

// Mock localStorage
const STORAGE_KEY = 'nexus_v9_todos_v2'

beforeEach(()=>{
  localStorage.clear()
})

describe('TodoApp', ()=>{
  it('renders and adds a task', ()=>{
    render(<TodoApp />)
    const input = screen.getByPlaceholderText(/Add a new task/i)
    fireEvent.change(input, { target: { value: 'Test task' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })

  it('toggles a task complete', ()=>{
    render(<TodoApp />)
    const input = screen.getByPlaceholderText(/Add a new task/i)
    fireEvent.change(input, { target: { value: 'Toggle me' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    const check = screen.getByRole('button', { name: /Mark as complete/i })
    fireEvent.click(check)
    expect(check).toHaveAttribute('aria-pressed', 'true')
  })
})
