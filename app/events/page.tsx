import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch published events (RLS will filter depending on access)
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('start_time', { ascending: true })

  // Fetch current user's registrations if logged in
  const registrations = user
    ? (await supabase
        .from('event_registrations')
        .select('event_id,status')
        .eq('user_id', user.id)).data || []
    : []

  const regMap = new Map<string, { status: string }>()
  registrations?.forEach((r) => regMap.set(r.event_id, { status: r.status }))

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Upcoming Events</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(events ?? []).map((evt) => {
          const reg = regMap.get(evt.id)
          const isRegistered = !!reg
          const waitlisted = reg?.status === 'waitlisted'
          return (
            <div key={evt.id} className="rounded-lg border p-4 flex flex-col">
              <h2 className="text-lg font-semibold mb-1">{evt.title}</h2>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(evt.start_time).toLocaleString()} —{' '}
                {evt.end_time ? new Date(evt.end_time).toLocaleString() : ''}
              </p>
              {/* @ts-expect-error generated types may lag behind */}
              <p className="text-sm flex-1">{evt.description ?? ''}</p>

              {isRegistered ? (
                <form
                  action={async () => {
                    'use server'
                    const { cancelRegistration } = await import('./actions')
                    await cancelRegistration(evt.id)
                  }}
                >
                  <Button type="submit" variant="secondary" className="rounded-full mt-4">
                    {waitlisted ? 'Leave wait-list' : 'Cancel RSVP'}
                  </Button>
                </form>
              ) : (
                <form
                  action={async () => {
                    'use server'
                    const { registerForEvent } = await import('./actions')
                    await registerForEvent(evt.id)
                  }}
                >
                  <Button type="submit" className="rounded-full mt-4">
                    RSVP
                  </Button>
                </form>
              )}
              {waitlisted && (
                <span className="mt-2 text-xs text-yellow-600">You are on the wait-list</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 