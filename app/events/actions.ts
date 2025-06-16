'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { TablesInsert } from '@/types/supabase'

export async function registerForEvent(eventId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const payload: TablesInsert<'event_registrations'> = {
    event_id: eventId,
    user_id: user.id,
  }

  const { error } = await supabase.from('event_registrations').insert(payload)

  if (error && error.code !== '23505') {
    // 23505 unique violation means they are already registered; ignore
    throw error
  }

  revalidatePath('/events')
}

export async function cancelRegistration(eventId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('event_registrations')
    .delete()
    .match({ event_id: eventId, user_id: user.id })

  revalidatePath('/events')
} 