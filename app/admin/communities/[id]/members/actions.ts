'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { TablesInsert } from '@/types/supabase'

async function assertAdmin() {
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

  if (profile?.role !== 'admin') redirect('/dashboard')
  return supabase
}

export async function addMember(formData: FormData) {
  const supabase = await assertAdmin()
  const community_id = formData.get('community_id') as string
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const user_id = (formData.get('user_id') as string)?.trim()
  const role = (formData.get('role') as string) || 'member'

  if (!community_id) throw new Error('community_id missing')

  let targetUserId = user_id

  if (!targetUserId && email) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .single()
    if (!userRecord) throw new Error('User not found')
    targetUserId = userRecord.id
  }

  if (!targetUserId) {
    redirect(
      `/admin/communities/${community_id}/members?message=${encodeURIComponent(
        'Please provide an email or user ID'
      )}`
    )
  }

  const payload: TablesInsert<'community_members'> = {
    community_id,
    user_id: targetUserId,
    role,
  }
  const { error } = await supabase.from('community_members').insert(payload)
  if (error) {
    redirect(
      `/admin/communities/${community_id}/members?message=${encodeURIComponent(error.message)}`
    )
  }
  revalidatePath(`/admin/communities/${community_id}/members`)
}

export async function updateMemberRole(formData: FormData) {
  const supabase = await assertAdmin()
  const community_id = formData.get('community_id') as string
  const user_id = formData.get('user_id') as string
  const role = formData.get('role') as string

  if (!community_id || !user_id || !role) throw new Error('Missing data')

  const { error } = await supabase
    .from('community_members')
    .update({ role })
    .eq('community_id', community_id)
    .eq('user_id', user_id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/communities/${community_id}/members`)
}

export async function removeMember(formData: FormData) {
  const supabase = await assertAdmin()
  const community_id = formData.get('community_id') as string
  const user_id = formData.get('user_id') as string
  if (!community_id || !user_id) throw new Error('Missing data')

  const { error } = await supabase
    .from('community_members')
    .delete()
    .eq('community_id', community_id)
    .eq('user_id', user_id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/communities/${community_id}/members`)
} 