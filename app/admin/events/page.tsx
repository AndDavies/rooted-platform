import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createEvent } from './actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function EventsAdminPage() {
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

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: false })

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Events</h1>

      <form action={createEvent} className="mb-10 grid max-w-2xl gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Event title" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Short summary" rows={3} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="h-9 rounded-md border px-2">
            <option value="virtual">Virtual</option>
            <option value="in_person">In-person</option>
            <option value="hybrid">Hybrid</option>
            <option value="retreat">Retreat</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="start_time">Start</Label>
          <Input id="start_time" name="start_time" type="datetime-local" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="end_time">End</Label>
          <Input id="end_time" name="end_time" type="datetime-local" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" name="timezone" placeholder="Europe/Lisbon" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="Venue or city" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="virtual_link">Virtual Link</Label>
          <Input id="virtual_link" name="virtual_link" placeholder="https://zoom.us/..." />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" name="capacity" type="number" placeholder="Max attendees" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="access">Access</Label>
          <select id="access" name="access" className="h-9 rounded-md border px-2">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" className="h-9 rounded-md border px-2">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="host">Host</Label>
          <Input id="host" name="host" placeholder="Event host" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="banner_image_url">Banner Image URL</Label>
          <Input id="banner_image_url" name="banner_image_url" placeholder="https://...jpg" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="external_booking_url">External Booking URL</Label>
          <Input id="external_booking_url" name="external_booking_url" placeholder="https://eventbrite.com/..." />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="details">Details</Label>
          <Textarea id="details" name="details" placeholder="Long description or agenda" rows={4} />
        </div>

        <Button type="submit" className="rounded-full px-6 w-fit">
          Create Event
        </Button>
      </form>

      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Title</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Start</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">End</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Host</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Capacity</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events?.map((evt) => (
            <tr key={evt.id}>
              <td className="px-4 py-2 whitespace-nowrap">{evt.title}</td>
              <td className="px-4 py-2 whitespace-nowrap">{new Date(evt.start_time).toLocaleString()}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                {evt.end_time ? new Date(evt.end_time).toLocaleString() : '—'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">{evt.host ?? '—'}</td>
              <td className="px-4 py-2 whitespace-nowrap">{evt.capacity ?? '—'}</td>
              <td className="px-4 py-2">
                <details>
                  <summary className="cursor-pointer text-primary">Edit</summary>
                  <form action={async (formData) => {
                    'use server'
                    const { updateEvent } = await import('./actions')
                    await updateEvent(evt.id, formData)
                  }} className="mt-2 grid gap-2">
                    <input type="hidden" name="id" value={evt.id} />
                    <input name="title" defaultValue={evt.title} className="rounded-md border px-2 py-1" />
                    <input type="datetime-local" name="start_time" defaultValue={evt.start_time.slice(0,16)} className="rounded-md border px-2 py-1" />
                    <input type="datetime-local" name="end_time" defaultValue={evt.end_time?.slice(0,16) ?? ''} className="rounded-md border px-2 py-1" />
                    <input type="number" name="capacity" defaultValue={evt.capacity ?? ''} placeholder="Capacity" className="rounded-md border px-2 py-1" />
                    <input name="host" defaultValue={evt.host ?? ''} placeholder="Host" className="rounded-md border px-2 py-1" />
                    <textarea name="details" defaultValue={typeof evt.details === 'string' ? evt.details : ''} className="rounded-md border px-2 py-1" />
                    <button className="rounded-md bg-primary px-3 py-1 text-primary-foreground text-xs w-fit" type="submit">Save</button>
                  </form>
                  <form action={async (formData) => {
                    'use server'
                    const { deleteEventAction } = await import('./actions')
                    await deleteEventAction(formData)
                  }}>
                    <input type="hidden" name="id" value={evt.id} />
                    <button className="mt-2 text-xs text-destructive" type="submit">Delete</button>
                  </form>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 