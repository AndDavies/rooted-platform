import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StatsGrid } from '@/components/stats-grid'

export const dynamic = 'force-dynamic'

export default async function AdminOverview() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Counts
  const [{ count: eventsCount }, { count: communitiesCount }, { count: usersCount }] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('communities').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <StatsGrid
        stats={[
          {
            title: 'Total Events',
            value: String(eventsCount ?? 0),
            icon: null,
            change: { value: '', trend: 'up' },
          },
          {
            title: 'Communities',
            value: String(communitiesCount ?? 0),
            icon: null,
            change: { value: '', trend: 'up' },
          },
          {
            title: 'Users',
            value: String(usersCount ?? 0),
            icon: null,
            change: { value: '', trend: 'up' },
          },
        ]}
      />
    </div>
  )
} 