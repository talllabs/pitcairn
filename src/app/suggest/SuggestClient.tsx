'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SuggestClient() {
  const supabase = createClient()

  const [name, setName] = useState('')
  const [proposedDate, setProposedDate] = useState('')
  const [theme, setTheme] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('suggestions').insert({
      submitted_by_name: name || null,
      proposed_date: proposedDate || null,
      theme,
      notes: notes || null,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Thanks for your suggestion!</h1>
        <p className="text-gray-600 mb-8">
          Your post idea has been submitted. The Pitcairn comms team will review it.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setName('')
            setProposedDate('')
            setTheme('')
            setNotes('')
          }}
          className="bg-pitcairn-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors"
        >
          Suggest another
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Suggest a Post</h1>
        <p className="text-gray-500 text-sm">Have an idea for the calendar? Share it here.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Steve"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proposed date</label>
          <input
            type="text"
            value={proposedDate}
            onChange={e => setProposedDate(e.target.value)}
            placeholder="e.g. July 2026 or specific date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme / Event <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={theme}
            onChange={e => setTheme(e.target.value)}
            placeholder="e.g. New longboat launch, Community harvest"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Any extra details, photo ideas, or captions…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pitcairn-blue focus:border-transparent resize-y transition"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pitcairn-blue hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Submitting…' : 'Submit suggestion'}
        </button>
      </form>
    </div>
  )
}
