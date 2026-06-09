import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('sort_order')
    setTasks(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const add = async (title, parentId = null) => {
    const siblings = tasks.filter(t => t.parent_id === parentId)
    const maxOrder = siblings.reduce((m, t) => Math.max(m, t.sort_order), -1)
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, title, parent_id: parentId, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (data) setTasks(p => [...p, data])
  }

  const complete = async (id) => {
    const { data } = await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks(p => p.map(t => t.id === id ? data : t))
  }

  const setActive = async (id) => {
    setTasks(p => p.map(t => ({ ...t, is_active: t.id === id })))
    await supabase.from('tasks').update({ is_active: false }).eq('user_id', user.id).neq('id', id)
    await supabase.from('tasks').update({ is_active: true }).eq('id', id)
  }

  const archive = async (id) => {
    await supabase.from('tasks').update({ status: 'archived' }).eq('id', id)
    setTasks(p => p.filter(t => t.id !== id && t.parent_id !== id))
  }

  const rename = async (id, title) => {
    const { data } = await supabase
      .from('tasks')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) setTasks(p => p.map(t => (t.id === id ? data : t)))
  }

  return {
    tasks,
    loading,
    add,
    complete,
    setActive,
    archive,
    rename,
    activeTask: tasks.find(t => t.is_active && t.status === 'todo') ?? null,
    rootTasks: tasks.filter(t => !t.parent_id && t.status === 'todo'),
    subtasksOf: (id) => tasks.filter(t => t.parent_id === id),
  }
}
