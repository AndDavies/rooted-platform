import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { joinCommunity, leaveCommunity } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
      <h1 className="text-2xl font-bold text-foreground">Communities</h1>
      <div className="space-y-4">
        {(communities ?? []).map((c) => {
          const memberList = (c as { community_members?: { role: string }[] }).community_members ?? []
          const isMember = memberList.length > 0
          const role = isMember ? memberList[0].role : null
          return (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  {role && (
                    <span className="text-sm text-muted-foreground">({role})</span>
                  )}
                </div>
                <div>
                  {isMember ? (
                    <form action={leaveCommunity} className="inline-block">
                      <input type="hidden" name="community_id" value={c.id} />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full px-4"
                        type="submit"
                      >
                        Leave
                      </Button>
                    </form>
                  ) : (
                    <form action={joinCommunity} className="inline-block">
                      <input type="hidden" name="community_id" value={c.id} />
                      <Button size="sm" className="rounded-full px-4" type="submit">
                        Join
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 