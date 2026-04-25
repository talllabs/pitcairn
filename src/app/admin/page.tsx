import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import type { Suggestion } from '@/lib/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: suggestions } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (suggestions as Suggestion[]) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Post Suggestions</h1>
            <p className="text-gray-500 text-sm">{list.length} suggestion{list.length !== 1 ? 's' : ''} submitted</p>
          </div>

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center text-gray-400">
              No suggestions yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Submitted</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Theme / Event</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Proposed Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {list.map(suggestion => (
                      <tr key={suggestion.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(suggestion.created_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {suggestion.submitted_by_name ?? <span className="text-gray-400 italic">Anonymous</span>}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                          {suggestion.theme}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {suggestion.proposed_date ?? <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-sm">
                          {suggestion.notes ?? <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
