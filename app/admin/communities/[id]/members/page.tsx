import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { addMember, updateMemberRole, removeMember } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { id: communityId } = await params
  const { message } = await searchParams
  const supabase = await createClient()

  // Auth & admin check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: community } = await supabase
    .from('communities')
    .select('name')
    .eq('id', communityId)
    .single()
  if (!community) redirect('/admin/communities')

  const { data: members } = await supabase
    .from('community_members')
    .select('user_id, role, joined_at')
    .eq('community_id', communityId)
    .order('joined_at', { ascending: false })

  // fetch all users for datalist suggestions
  const { data: allUsers } = await supabase.from('users').select('id,email').order('email')

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Members – {community.name}</h1>
      {message && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {message}
        </div>
      )}

      {/* Add member */}
      <form action={addMember} className="flex flex-wrap gap-2 max-w-lg items-end">
        <input type="hidden" name="community_id" value={communityId} />
        <Input list="user-suggestions" name="email" placeholder="User email" className="flex-1" />
        <Input name="user_id" placeholder="User UUID (optional)" className="flex-1" />
        <label className="text-sm flex items-center">
          <span className="mr-2">Role:</span>
          <select name="role" className="h-9 rounded-md border px-2 text-sm">
            <option value="member">member</option>
            <option value="facilitator">facilitator</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <Button className="rounded-full px-4" type="submit" size="sm">
          Add
        </Button>
      </form>

      {/* datalist for email suggestions */}
      <datalist id="user-suggestions">
        {(allUsers ?? []).map((u) => (
          <option key={u.id} value={u.email || ''} />
        ))}
      </datalist>

      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">User ID</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Role</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-700">Joined</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {(members ?? []).map((m) => (
            <tr key={m.user_id}>
              <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">{m.user_id}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span
                  className={
                    {
                      member: 'bg-gray-200 text-gray-800',
                      facilitator: 'bg-blue-200 text-blue-800',
                      admin: 'bg-green-200 text-green-800',
                    }[m.role as 'member' | 'facilitator' | 'admin'] +
                    ' rounded px-2 py-0.5 text-xs font-medium'
                  }
                >
                  {m.role}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : ''}
              </td>
              <td className="px-4 py-2 whitespace-nowrap space-x-2">
                {/* Update role */}
                <form action={updateMemberRole} className="inline-block">
                  <input type="hidden" name="community_id" value={communityId} />
                  <input type="hidden" name="user_id" value={m.user_id} />
                  <select
                    name="role"
                    defaultValue={m.role}
                    className="h-8 rounded-md border px-2 text-xs mr-1"
                  >
                    <option value="member">member</option>
                    <option value="facilitator">facilitator</option>
                    <option value="admin">admin</option>
                  </select>
                  <Button size="sm" className="rounded-full px-3 text-xs" type="submit">
                    Save
                  </Button>
                </form>
                {/* Remove */}
                <form action={removeMember} className="inline-block">
                  <input type="hidden" name="community_id" value={communityId} />
                  <input type="hidden" name="user_id" value={m.user_id} />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full px-3 text-xs text-red-600 border-red-300"
                    type="submit"
                  >
                    Delete
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <a href="/admin/communities" className="text-blue-600 underline text-sm">
        ← Back to Communities
      </a>
    </div>
  )
} 