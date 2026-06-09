import { useState } from 'react'
import { useMedications, SLOTS } from '../hooks/useMedications'
import { Pill, Plus, Check, X, Trash2, Pencil, Sunrise, Sun, Moon } from 'lucide-react'

const SLOT_META = {
  morning: { label: 'Morning', Icon: Sunrise },
  lunch: { label: 'Lunch', Icon: Sun },
  evening: { label: 'Evening', Icon: Moon },
}

function MedicineModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dose, setDose] = useState(initial?.dose ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [slots, setSlots] = useState(initial ? SLOTS.filter(s => initial[s]) : [])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleSlot = (s) =>
    setSlots(p => (p.includes(s) ? p.filter(x => x !== s) : [...p, s]))

  const save = async () => {
    setError('')
    if (!name.trim()) return setError('Name is required')
    if (slots.length === 0) return setError('Pick at least one time of day')
    setSaving(true)
    const res = await onSave({
      name: name.trim(),
      dose: dose.trim(),
      notes: notes.trim(),
      slots,
    })
    setSaving(false)
    if (res?.error) return setError(res.error.message)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit medicine' : 'Add medicine'}
          </h2>
          <button onClick={onClose} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Vitamin D"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <label className="block text-xs font-medium text-gray-500 mb-1">Dose</label>
        <input
          value={dose}
          onChange={e => setDose(e.target.value)}
          placeholder="e.g. 1000 IU (optional)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Take with food (optional)"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <label className="block text-xs font-medium text-gray-500 mb-2">When do you take it?</label>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {SLOTS.map(s => {
            const active = slots.includes(s)
            const { label, Icon } = SLOT_META[s]
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSlot(s)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-colors ${
                  active
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 text-gray-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            )
          })}
        </div>

        {error && <p className="text-rose-500 text-sm text-center mb-3">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function TodayView({ medsForSlot, isTaken, toggleDose, scheduledCount, takenCount }) {
  if (scheduledCount === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Pill size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="font-medium">No medicines scheduled</p>
        <p className="text-sm mt-1">Add one in the Medicines tab</p>
      </div>
    )
  }

  const pct = scheduledCount ? (takenCount / scheduledCount) * 100 : 0

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Today's progress</span>
          <span className="text-gray-400">{takenCount} of {scheduledCount} taken</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {SLOTS.map(slot => {
        const meds = medsForSlot(slot)
        if (meds.length === 0) return null
        const { label, Icon } = SLOT_META[slot]
        return (
          <div key={slot} className="mb-5">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Icon size={16} />
              <h2 className="text-sm font-semibold uppercase tracking-wide">{label}</h2>
            </div>
            <div className="space-y-2">
              {meds.map(med => {
                const taken = isTaken(med.id, slot)
                return (
                  <button
                    key={med.id}
                    onClick={() => toggleDose(med.id, slot)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl shadow-sm text-left transition-colors ${
                      taken ? 'bg-emerald-50' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        taken ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                      }`}
                    >
                      {taken && <Check size={15} className="text-white" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block font-medium ${taken ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {med.name}
                      </span>
                      {med.dose && <span className="block text-xs text-gray-400">{med.dose}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

function ManageView({ medications, onAdd, onEdit, onRemove }) {
  return (
    <>
      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3 font-medium mb-4 active:scale-95 transition-transform"
      >
        <Plus size={18} /> Add medicine
      </button>

      {medications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No medicines yet</p>
          <p className="text-sm mt-1">Tap “Add medicine” to get started</p>
        </div>
      ) : (
        medications.map(med => (
          <div key={med.id} className="bg-white rounded-xl shadow-sm p-4 mb-2">
            <div className="flex items-start gap-3">
              <Pill size={18} className="text-indigo-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">
                  {med.name}
                  {med.dose && <span className="text-gray-400 font-normal"> · {med.dose}</span>}
                </p>
                {med.notes && <p className="text-sm text-gray-500 mt-0.5">{med.notes}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SLOTS.filter(s => med[s]).map(s => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                      {SLOT_META[s].label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <button
                  onClick={() => onEdit(med)}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onRemove(med.id)}
                  className="p-1.5 text-gray-300 hover:text-rose-400 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  )
}

export default function MedicinePage() {
  const {
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
  } = useMedications()
  const [view, setView] = useState('today')
  const [modal, setModal] = useState(null) // null | { med } | {}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const handleSave = (fields) =>
    modal?.med ? updateMedication(modal.med.id, fields) : addMedication(fields)

  return (
    <div className="p-4 pt-5">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Medicine</h1>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {[
          ['today', 'Today'],
          ['manage', 'Medicines'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'today' ? (
        <TodayView
          medsForSlot={medsForSlot}
          isTaken={isTaken}
          toggleDose={toggleDose}
          scheduledCount={scheduledCount}
          takenCount={takenCount}
        />
      ) : (
        <ManageView
          medications={medications}
          onAdd={() => setModal({})}
          onEdit={(med) => setModal({ med })}
          onRemove={removeMedication}
        />
      )}

      {modal && (
        <MedicineModal
          initial={modal.med ?? null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
