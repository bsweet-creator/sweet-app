import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { Target, Plus, Check, ChevronDown, ChevronRight, ArrowLeft, X, Trash2 } from 'lucide-react'

function QuickCapture({ onAdd }) {
  const [text, setText] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await onAdd(text.trim())
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2 mb-4">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Capture a task…"
        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
      />
      <button
        type="submit"
        className="bg-indigo-600 text-white rounded-xl px-4 shadow-sm active:scale-95 transition-transform"
      >
        <Plus size={20} />
      </button>
    </form>
  )
}

function TaskItem({ task, subtasks, onComplete, onSetActive, onArchive, onAdd }) {
  const [expanded, setExpanded] = useState(false)
  const [addingStep, setAddingStep] = useState(false)
  const [stepText, setStepText] = useState('')

  const submitStep = async (e) => {
    e.preventDefault()
    if (!stepText.trim()) return
    await onAdd(stepText.trim(), task.id)
    setStepText('')
    setAddingStep(false)
  }

  const doneCount = subtasks.filter(s => s.status === 'done').length
  const hasSubtasks = subtasks.length > 0

  return (
    <div className="bg-white rounded-xl shadow-sm mb-2 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => onComplete(task.id)}
          className="shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-emerald-500 transition-colors"
        />
        <span className="flex-1 text-gray-900 font-medium leading-snug">{task.title}</span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => { setAddingStep(a => !a); setExpanded(true) }}
            className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Add step"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => onSetActive(task.id)}
            className="p-1.5 text-gray-400 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors"
            title="Focus now"
          >
            <Target size={15} />
          </button>
          {hasSubtasks && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-gray-400 rounded-lg"
            >
              {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
          )}
          <button
            onClick={() => onArchive(task.id)}
            className="p-1.5 text-gray-300 hover:text-rose-400 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {hasSubtasks && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full pb-3 text-xs text-gray-400 text-left pl-12"
        >
          {doneCount}/{subtasks.length} steps
        </button>
      )}

      {(expanded || addingStep) && (
        <div className="border-t border-gray-50 pb-2">
          {subtasks.map(sub => (
            <div key={sub.id} className="flex items-center gap-3 py-2 px-4 pl-12">
              <button onClick={() => onComplete(sub.id)} className="shrink-0">
                {sub.status === 'done'
                  ? <Check size={16} className="text-emerald-500" />
                  : <div className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-emerald-500 transition-colors" />
                }
              </button>
              <span className={`text-sm flex-1 ${sub.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {sub.title}
              </span>
              <button onClick={() => onArchive(sub.id)} className="text-gray-300 hover:text-rose-400 transition-colors">
                <X size={13} />
              </button>
            </div>
          ))}
          {addingStep && (
            <form onSubmit={submitStep} className="pl-12 pr-4 pt-1">
              <input
                autoFocus
                value={stepText}
                onChange={e => setStepText(e.target.value)}
                onBlur={() => { if (!stepText) setAddingStep(false) }}
                placeholder="Add a step…"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </form>
          )}
        </div>
      )}
    </div>
  )
}

function NowMode({ activeTask, subtasks, onComplete, onAddStep, onBack }) {
  const [stepText, setStepText] = useState('')
  const [addingStep, setAddingStep] = useState(false)

  if (!activeTask) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <Target size={52} className="text-gray-200 mb-5" />
        <p className="text-gray-500 font-semibold text-lg">Nothing in focus</p>
        <p className="text-gray-400 text-sm mt-1">Tap the target icon on a task to focus it here</p>
        <button onClick={onBack} className="mt-8 text-indigo-600 font-medium flex items-center gap-1">
          <ArrowLeft size={16} /> Back to list
        </button>
      </div>
    )
  }

  const submitStep = async (e) => {
    e.preventDefault()
    if (!stepText.trim()) return
    await onAddStep(stepText.trim(), activeTask.id)
    setStepText('')
    setAddingStep(false)
  }

  const doneCount = subtasks.filter(s => s.status === 'done').length

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] px-2">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm mb-8 self-start">
        <ArrowLeft size={15} /> All tasks
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-4">Now</p>
        <h2 className="text-3xl font-bold text-gray-900 leading-snug mb-3 max-w-xs">
          {activeTask.title}
        </h2>

        {subtasks.length > 0 && (
          <p className="text-gray-400 text-sm mb-6">{doneCount} of {subtasks.length} steps done</p>
        )}

        {subtasks.length > 0 && (
          <div className="w-full max-w-xs text-left space-y-3 mb-6">
            {subtasks.map(sub => (
              <button
                key={sub.id}
                onClick={() => onComplete(sub.id)}
                className="flex items-center gap-3 w-full"
              >
                {sub.status === 'done'
                  ? <Check size={20} className="text-emerald-500 shrink-0" />
                  : <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-emerald-400 transition-colors shrink-0" />
                }
                <span className={sub.status === 'done' ? 'line-through text-gray-400 text-left' : 'text-gray-700 text-left'}>
                  {sub.title}
                </span>
              </button>
            ))}
          </div>
        )}

        {addingStep ? (
          <form onSubmit={submitStep} className="w-full max-w-xs mb-2">
            <input
              autoFocus
              value={stepText}
              onChange={e => setStepText(e.target.value)}
              onBlur={() => { if (!stepText) setAddingStep(false) }}
              placeholder="Describe the step…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>
        ) : (
          <button
            onClick={() => setAddingStep(true)}
            className="text-gray-400 text-sm flex items-center gap-1 mb-2 hover:text-gray-600 transition-colors"
          >
            <Plus size={14} /> Add step
          </button>
        )}
      </div>

      <button
        onClick={() => onComplete(activeTask.id)}
        className="w-full bg-emerald-500 text-white rounded-2xl py-4 font-bold text-lg active:scale-95 transition-transform"
      >
        Mark Done ✓
      </button>
    </div>
  )
}

export default function TasksPage() {
  const { loading, add, complete, setActive, archive, activeTask, rootTasks, subtasksOf } = useTasks()
  const [mode, setMode] = useState('list')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const handleSetActive = async (id) => {
    await setActive(id)
    setMode('now')
  }

  const handleComplete = async (id) => {
    await complete(id)
    if (activeTask?.id === id) setMode('list')
  }

  return (
    <div className="p-4 pt-5">
      {mode === 'now' ? (
        <NowMode
          activeTask={activeTask}
          subtasks={activeTask ? subtasksOf(activeTask.id) : []}
          onComplete={handleComplete}
          onAddStep={add}
          onBack={() => setMode('list')}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
            <button
              onClick={() => setMode('now')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                activeTask
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Target size={14} />
              {activeTask ? `Now: ${activeTask.title.slice(0, 20)}${activeTask.title.length > 20 ? '…' : ''}` : 'Now'}
            </button>
          </div>

          <QuickCapture onAdd={add} />

          {rootTasks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Type above and hit Enter to capture one</p>
            </div>
          ) : (
            rootTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                subtasks={subtasksOf(task.id)}
                onComplete={handleComplete}
                onSetActive={handleSetActive}
                onArchive={archive}
                onAdd={add}
              />
            ))
          )}
        </>
      )}
    </div>
  )
}
