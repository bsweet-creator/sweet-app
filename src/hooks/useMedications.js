import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const toLocalDate = (d) => d.toLocaleDateString('en-CA') // YYYY-MM-DD in local time

export const SLOTS = ['morning', 'lunch', 'evening']

export function useMedications() {
  const { user } = useAuth()
  const [medications, setMedications] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const today = toLocalDate(new Date())

    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    setMedications(meds ?? [])

    const { data: logs } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
    setTodayLogs(logs ?? [])

    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const addMedication = async ({ name, dose, notes, slots }) => {
    const maxOrder = medications.reduce((m, x) => Math.max(m, x.sort_order), -1)
    const { data, error } = await supabase
      .from('medications')
      .insert({
        user_id: user.id,
        name,
        dose: dose || null,
        notes: notes || null,
        morning: slots.includes('morning'),
        lunch: slots.includes('lunch'),
        evening: slots.includes('evening'),
        sort_order: maxOrder + 1,
      })
      .select()
      .single()
    if (data) setMedications(p => [...p, data])
    return { error }
  }

  const updateMedication = async (id, { name, dose, notes, slots }) => {
    const { data, error } = await supabase
      .from('medications')
      .update({
        name,
        dose: dose || null,
        notes: notes || null,
        morning: slots.includes('morning'),
        lunch: slots.includes('lunch'),
        evening: slots.includes('evening'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (data) setMedications(p => p.map(m => (m.id === id ? data : m)))
    return { error }
  }

  const removeMedication = async (id) => {
    setMedications(p => p.filter(m => m.id !== id))
    setTodayLogs(p => p.filter(l => l.medication_id !== id))
    await supabase.from('medications').update({ active: false }).eq('id', id)
  }

  const isTaken = (medicationId, slot) =>
    todayLogs.some(l => l.medication_id === medicationId && l.slot === slot)

  const toggleDose = async (medicationId, slot) => {
    const today = toLocalDate(new Date())
    const existing = todayLogs.find(
      l => l.medication_id === medicationId && l.slot === slot
    )
    if (existing) {
      setTodayLogs(p => p.filter(l => l.id !== existing.id))
      await supabase.from('medication_logs').delete().eq('id', existing.id)
    } else {
      const { data } = await supabase
        .from('medication_logs')
        .insert({ user_id: user.id, medication_id: medicationId, slot, log_date: today })
        .select()
        .single()
      if (data) setTodayLogs(p => [...p, data])
    }
  }

  const medsForSlot = (slot) => medications.filter(m => m[slot])

  const scheduledCount = medications.reduce(
    (n, m) => n + SLOTS.filter(s => m[s]).length,
    0
  )
  const takenCount = todayLogs.filter(l => {
    const med = medications.find(m => m.id === l.medication_id)
    return med && med[l.slot]
  }).length

  return {
    medications,
    loading,
    addMedication,
    updateMedication,
    removeMedication,
    toggleDose,
    isTaken,
    medsForSlot,
    scheduledCount,
    takenCount,
  }
}
