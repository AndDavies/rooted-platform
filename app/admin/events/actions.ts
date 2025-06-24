'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { TablesInsert, TablesUpdate } from '@/types/supabase'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Only admins can create
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const payload: TablesInsert<'events'> = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    type: formData.get('type') as TablesInsert<'events'>['type'],
    start_time: formData.get('start_time') as string,
    end_time: (formData.get('end_time') as string) || null,
    timezone: (formData.get('timezone') as string) || null,
    location: (formData.get('location') as string) || null,
    virtual_link: (formData.get('virtual_link') as string) || null,
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    access: formData.get('access') as TablesInsert<'events'>['access'],
    status: 'published',
    banner_image_url: (formData.get('banner_image_url') as string) || null,
    metadata: null,
    agenda: null,
    facilitators: null,
    tags: null,
    external_booking_url: (formData.get('external_booking_url') as string) || null,
    post_event_content: null,
    created_by: user.id,
  }

  const { error } = await supabase.from('events').insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/events')
  redirect('/admin/events')
}

export async function updateEvent(id: string, formData: FormData) {
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

  const payload: TablesUpdate<'events'> = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    type: formData.get('type') as TablesUpdate<'events'>['type'],
    start_time: formData.get('start_time') as string,
    end_time: (formData.get('end_time') as string) || null,
    timezone: (formData.get('timezone') as string) || null,
    location: (formData.get('location') as string) || null,
    virtual_link: (formData.get('virtual_link') as string) || null,
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    access: formData.get('access') as TablesUpdate<'events'>['access'],
    status: formData.get('status') as TablesUpdate<'events'>['status'],
    banner_image_url: (formData.get('banner_image_url') as string) || null,
    external_booking_url: (formData.get('external_booking_url') as string) || null,
    host: formData.get('host') as string | null,
    details: formData.get('details') ? { description: formData.get('details') as string } : null,
  }

  const { error } = await supabase.from('events').update(payload).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/events')
}

export async function deleteEvent(id: string) {
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

  await supabase.from('events').delete().eq('id', id)

  revalidatePath('/admin/events')
}

export async function deleteEventAction(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error('Missing id')
  await deleteEvent(id)
} 