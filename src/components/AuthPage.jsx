import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await (mode === 'signin' ? signIn : signUp)(email, password)
    if (error) setError(error.message)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">sweet-app</h1>
          <p className="text-gray-400 mt-2">Your personal command center</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {error && <p className="text-rose-500 text-sm pt-1">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold mt-2 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {submitting ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
          className="w-full text-center text-gray-400 text-sm mt-5 hover:text-gray-600 transition-colors"
        >
          {mode === 'signin' ? "No account? Sign up" : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
