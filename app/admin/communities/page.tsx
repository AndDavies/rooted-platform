import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createCommunity, updateCommunity, deleteCommunityAction } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function CommunitiesPage() {
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

  const { data: communities } = await supabase
    .from('communities')
    .select('id,name,created_at, community_members(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Communities</h1>
      <form action={createCommunity} className="flex max-w-md gap-2">
        <Input name="name" placeholder="New community name" required />
        <Button size="sm" className="rounded-full px-4" type="submit">
          Add
        </Button>
      </form>

      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Name</th>
            <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Members</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {(communities ?? []).map((c) => {
            const memberCount = c.community_members?.[0]?.count ?? 0
            return (
              <tr key={c.id}>
                <td className="px-4 py-2 whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{memberCount}</td>
                <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                  <details className="inline-block">
                    <summary className="cursor-pointer text-primary text-xs">Edit</summary>
                    <form
                      action={async (formData) => {
                        'use server'
                        await updateCommunity(c.id, formData)
                      }}
                      className="mt-2 flex gap-2"
                    >
                      <Input name="name" defaultValue={c.name} />
                      <Button size="sm" className="rounded-full px-3 text-xs" type="submit">
                        Save
                      </Button>
                    </form>
                    <form action={deleteCommunityAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-1 text-xs rounded-full px-3 text-destructive border-destructive/30"
                        type="submit"
                      >
                        Delete
                      </Button>
                    </form>
                  </details>

                  <a
                    href={`/admin/communities/${c.id}/members`}
                    className="text-primary underline text-sm"
                  >
                    Members
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
} 