import { useState, useEffect, useCallback } from 'react'
import { differenceInCalendarDays } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const toLocalDate = (d) => d.toLocaleDateString('en-CA') // YYYY-MM-DD in local time

export function useAllowance() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const reconcile = useCallback(async (s) => {
    const todayStr = toLocalDate(new Date())
    if (s.snapshot_date >= todayStr) return s

    // Use noon to avoid DST edge cases
    const snapDate = new Date(s.snapshot_date + 'T12:00:00')
    const todayDate = new Date(todayStr + 'T12:00:00')
    const days = differenceInCalendarDays(todayDate, snapDate)
    if (days <= 0) return s

    const newBalance = +s.balance_snapshot + days * +s.daily_addition
    const { data } = await supabase
      .from('user_settings')
      .update({ balance_snapshot: newBalance, snapshot_date: todayStr })
      .eq('user_id', user.id)
      .select()
      .single()
    return data ?? s
  }, [user])

  const load = useCallback(async () => {
    if (!user) return
    const todayStr = toLocalDate(new Date())
    let { data: s } = await supabase
      .from('user_settings').select('*').eq('user_id', user.id).single()

    if (!s) {
      const { data } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id, snapshot_date: todayStr })
        .select()
        .single()
      s = data
    }

    if (s) {
      s = await reconcile(s)
      setSettings(s)
    }

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    setTransactions(txs ?? [])
    setLoading(false)
  }, [user, reconcile])

  useEffect(() => { load() }, [load])

  const logExpense = async (amount, note) => {
    const { data: tx } = await supabase
      .from('transactions')
      .insert({ user_id: user.id, amount, note: note || null, type: 'expense' })
      .select()
      .single()
    const newBal = +settings.balance_snapshot - +amount
    const { data: s } = await supabase
      .from('user_settings')
      .update({ balance_snapshot: newBal })
      .eq('user_id', user.id)
      .select()
      .single()
    if (tx) setTransactions(p => [tx, ...p])
    if (s) setSettings(s)
  }

  const deleteExpense = async (id, amount) => {
    await supabase.from('transactions').delete().eq('id', id)
    const newBal = +settings.balance_snapshot + +amount
    const { data: s } = await supabase
      .from('user_settings')
      .update({ balance_snapshot: newBal })
      .eq('user_id', user.id)
      .select()
      .single()
    setTransactions(p => p.filter(t => t.id !== id))
    if (s) setSettings(s)
  }

  const saveSettings = async (monthly, daily) => {
    const todayStr = toLocalDate(new Date())
    const { data: s, error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: user.id, monthly_budget: monthly, daily_addition: daily, snapshot_date: todayStr },
        { onConflict: 'user_id' }
      )
      .select()
      .single()
    if (s) setSettings(s)
    return { error }
  }

  return {
    settings,
    transactions,
    loading,
    balance: settings ? +settings.balance_snapshot : 0,
    logExpense,
    deleteExpense,
    saveSettings,
  }
}
