import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { joinCommunity, leaveCommunity } from './actions'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function CommunitiesBrowsePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all communities with membership status for current user
  const { data: communities } = await supabase
    .from('communities')
    .select('id, name, community_members(role, user_id)')

  return (
    <div className="p-8 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Communities</h1>
      <ul className="space-y-4">
        {(communities ?? []).map((c) => {
          const memberList = (c as { community_members?: { role: string }[] }).community_members ?? []
          const isMember = memberList.length > 0
          const role = isMember ? memberList[0].role : null
          return (
            <li key={c.id} className="flex items-center justify-between border p-4 rounded-md">
              <span>{c.name}</span>
              <div>
                {isMember ? (
                  <form action={leaveCommunity} className="inline-block">
                    <input type="hidden" name="community_id" value={c.id} />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full px-4 text-red-600 border-red-300"
                      type="submit"
                    >
                      Leave
                    </Button>
                  </form>
                ) : (
                  <form action={joinCommunity} className="inline-block">
                    <input type="hidden" name="community_id" value={c.id} />
                    <Button size="sm" className="rounded-full px-4" variant="secondary" type="submit">
                      Join
                    </Button>
                  </form>
                )}
                {role && (
                  <span className="ml-3 text-xs text-gray-600">({role})</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
} 