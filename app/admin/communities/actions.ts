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

export async function createCommunity(formData: FormData) {
  const supabase = await assertAdmin()
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Name required')
  const payload: TablesInsert<'communities'> = { name }
  const { error } = await supabase.from('communities').insert(payload)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/communities')
}

export async function updateCommunity(id: string, formData: FormData) {
  const supabase = await assertAdmin()
  const name = (formData.get('name') as string)?.trim()
  if (!name) throw new Error('Name required')
  const { error } = await supabase.from('communities').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/communities')
}

export async function deleteCommunityAction(formData: FormData) {
  const supabase = await assertAdmin()
  const id = formData.get('id') as string
  if (!id) throw new Error('id missing')
  const { error } = await supabase.from('communities').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/communities')
} 