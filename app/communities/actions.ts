'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { TablesInsert } from '@/types/supabase'

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function joinCommunity(formData: FormData) {
  const { supabase, user } = await requireAuth()
  const community_id = formData.get('community_id') as string
  if (!community_id) throw new Error('community_id missing')

  const payload: TablesInsert<'community_members'> = {
    community_id,
    user_id: user.id,
    role: 'member',
  }
  const { error } = await supabase.from('community_members').insert(payload)
  if (error && error.code !== '23505') throw new Error(error.message) // ignore duplicate
  revalidatePath('/communities')
}

export async function leaveCommunity(formData: FormData) {
  const { supabase, user } = await requireAuth()
  const community_id = formData.get('community_id') as string
  if (!community_id) throw new Error('community_id missing')

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', community_id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/communities')
} 