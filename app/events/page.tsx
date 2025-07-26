import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <h1 className="text-2xl font-bold text-foreground">Upcoming Events</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(events ?? []).map((evt) => {
          const reg = regMap.get(evt.id)
          const isRegistered = !!reg
          const waitlisted = reg?.status === 'waitlisted'
          return (
            <Card key={evt.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{evt.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {new Date(evt.start_time).toLocaleString()} —{' '}
                  {evt.end_time ? new Date(evt.end_time).toLocaleString() : ''}
                </p>
                <p className="text-sm text-foreground flex-1">{evt.description ?? ''}</p>

                {isRegistered ? (
                  <form
                    action={async () => {
                      'use server'
                      const { cancelRegistration } = await import('./actions')
                      await cancelRegistration(evt.id)
                    }}
                  >
                    <Button type="submit" variant="secondary" className="rounded-full w-full">
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
                    <Button type="submit" className="rounded-full w-full">
                      RSVP
                    </Button>
                  </form>
                )}
                {waitlisted && (
                  <span className="text-xs text-accent font-medium">You are on the wait-list</span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 