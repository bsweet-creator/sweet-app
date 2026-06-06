import { useState } from 'react'
import { useAllowance } from '../hooks/useAllowance'
import { useAuth } from '../contexts/AuthContext'
import { Settings, Delete, Plus, Trash2 } from 'lucide-react'
import { format, getDaysInMonth } from 'date-fns'

function NumberPad({ onSubmit, onClose }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const press = (key) => {
    if (key === '⌫') {
      setAmount(a => a.slice(0, -1))
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount(a => a + '.')
    } else {
      const [, decimals = ''] = amount.split('.')
      if (amount.includes('.') && decimals.length >= 2) return
      setAmount(a => (a === '0' ? key : a + key))
    }
  }

  const numeric = parseFloat(amount) || 0
  const display = amount ? `$${amount}` : '$0'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Log Expense</h3>
          <button onClick={onClose} className="text-gray-400 text-sm font-medium">Cancel</button>
        </div>

        <div className="text-center mb-1">
          <span className={`text-6xl font-bold tracking-tight ${numeric > 0 ? 'text-gray-900' : 'text-gray-200'}`}>
            {display}
          </span>
        </div>

        <input
          type="text"
          placeholder="What was it for? (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full text-center border-0 border-b border-gray-200 py-3 mb-5 text-gray-600 placeholder:text-gray-300 focus:outline-none focus:border-indigo-400"
        />

        <div className="grid grid-cols-3 gap-2 mb-3">
          {['7','8','9','4','5','6','1','2','3','.','0','⌫'].map(k => (
            <button
              key={k}
              onClick={() => press(k)}
              className="bg-gray-100 rounded-2xl py-4 text-xl font-semibold text-gray-900 hover:bg-gray-200 active:scale-95 transition-transform flex items-center justify-center"
            >
              {k === '⌫' ? <Delete size={20} /> : k}
            </button>
          ))}
        </div>

        <button
          onClick={() => numeric > 0 && onSubmit(numeric, note)}
          disabled={numeric <= 0}
          className="w-full bg-rose-500 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-25 active:scale-95 transition-transform"
        >
          Log {numeric > 0 ? `$${amount}` : '$0'}
        </button>
      </div>
    </div>
  )
}

function SettingsModal({ settings, onSave, onClose, onSignOut }) {
  const days = getDaysInMonth(new Date())
  const [monthly, setMonthly] = useState(
    settings?.monthly_budget > 0 ? (+settings.monthly_budget).toFixed(2) : ''
  )
  const [daily, setDaily] = useState(
    settings?.daily_addition > 0 ? (+settings.daily_addition).toFixed(2) : ''
  )

  const onMonthlyChange = (v) => {
    setMonthly(v)
    const m = parseFloat(v)
    if (!isNaN(m) && m > 0) setDaily((m / days).toFixed(2))
  }
  const onDailyChange = (v) => {
    setDaily(v)
    const d = parseFloat(v)
    if (!isNaN(d) && d > 0) setMonthly((d * days).toFixed(2))
  }

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setError('')
    setSaving(true)
    const res = await onSave(parseFloat(monthly) || 0, parseFloat(daily) || 0)
    setSaving(false)
    if (res?.error) {
      setError(res.error.message)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Budget Settings</h3>
          <button onClick={onClose} className="text-gray-400 text-sm font-medium">Cancel</button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1.5">Monthly Budget</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <span className="text-gray-400 mr-2 font-medium">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={monthly}
                onChange={e => onMonthlyChange(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent focus:outline-none text-gray-900 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center text-gray-400 text-sm justify-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            ÷ {days} days this month
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 block mb-1.5">Daily Addition</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <span className="text-gray-400 mr-2 font-medium">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={daily}
                onChange={e => onDailyChange(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent focus:outline-none text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-rose-500 text-sm text-center mb-3">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg mb-3 disabled:opacity-50 active:scale-95 transition-transform"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={onSignOut}
          className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

function TransactionRow({ tx, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm font-medium truncate">{tx.note || 'Expense'}</p>
        <p className="text-gray-400 text-xs mt-0.5">{format(new Date(tx.created_at), 'MMM d · h:mm a')}</p>
      </div>
      <span className="text-rose-500 font-semibold text-sm shrink-0">
        −${(+tx.amount).toFixed(2)}
      </span>
      <button
        onClick={() => onDelete(tx.id, +tx.amount)}
        className="text-gray-300 hover:text-rose-400 transition-colors ml-1 shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function AllowancePage() {
  const { balance, settings, transactions, loading, logExpense, deleteExpense, saveSettings } = useAllowance()
  const { signOut } = useAuth()
  const [showPad, setShowPad] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleExpense = async (amount, note) => {
    await logExpense(amount, note)
    setShowPad(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const isNeg = balance < 0
  const needsSetup = !settings?.daily_addition || +settings.daily_addition === 0

  return (
    <div className="p-4 pt-5">
      {showPad && <NumberPad onSubmit={handleExpense} onClose={() => setShowPad(false)} />}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
          onSignOut={signOut}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Spend</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Balance card */}
      <div className={`rounded-2xl p-6 mb-4 text-center ${isNeg ? 'bg-rose-50' : 'bg-emerald-50'}`}>
        <p className="text-sm font-medium text-gray-500 mb-1">Safe to Spend</p>
        <p className={`text-6xl font-bold tracking-tight leading-none ${isNeg ? 'text-rose-500' : 'text-emerald-500'}`}>
          {isNeg ? '−' : ''}${Math.abs(balance).toFixed(2)}
        </p>
        {!needsSetup && (
          <p className="text-sm text-gray-400 mt-3">
            +${(+settings.daily_addition).toFixed(2)} / day
          </p>
        )}
      </div>

      {needsSetup && (
        <button
          onClick={() => setShowSettings(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-gray-400 text-sm font-medium mb-4 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
        >
          ⚙ Set your monthly budget to get started
        </button>
      )}

      <button
        onClick={() => setShowPad(true)}
        className="w-full bg-rose-500 text-white rounded-2xl py-4 font-bold text-lg mb-6 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
      >
        <Plus size={22} /> Add Expense
      </button>

      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm px-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 pt-4 pb-2">Recent</p>
          {transactions.map(tx => (
            <TransactionRow key={tx.id} tx={tx} onDelete={deleteExpense} />
          ))}
        </div>
      )}

      {transactions.length === 0 && !needsSetup && (
        <div className="text-center py-12 text-gray-400">
          <p className="font-medium">No expenses logged yet</p>
          <p className="text-sm mt-1">Tap Add Expense to log one</p>
        </div>
      )}
    </div>
  )
}
