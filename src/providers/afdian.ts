import { createHash } from 'crypto'
import { $fetch } from 'ohmyfetch'
import type { Provider, Sponsorship } from '../types'

export const AfdianProvider: Provider = {
  name: 'afdian',
  fetchSponsors(config) {
    return fetchAfdianSponsors(
      config.afdian.id,
      config.afdian?.token || config.token!
    )
  },
}

export async function fetchAfdianSponsors(
  id: string,
  token: string
): Promise<Sponsorship[]> {
  if (!token) throw new Error('Afdian token is required')

  const sponsors: any[] = []
  const sponsorshipApi = 'https://afdian.net/api/open/query-sponsor'
  let page: number | null = 1
  do {
    const sponsorshipData = await $fetch(sponsorshipApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      body: JSON.stringify(
        generatePOSTData(id, token, JSON.stringify({ page }))
      ),
    })
    console.log(sponsorshipData)
    sponsors.push(
      ...sponsorshipData.data.list.map(
        (user: any): Sponsorship => ({
          sponsor: {
            name: user.user.name.includes('爱发电用户_')
              ? '匿名'
              : user.user.name,
            login: user.user.user_id,
            type: 'User',
            avatarUrl: user.user.avatar,
          },
          monthlyDollars: user.all_sum_amount,
          tierName: user.current_plan.name || '自定义',
          isOneTime: false,
          createdAt: `${new Date(user.created_time).valueOf()}`,
        })
      )
    )
    page = sponsorshipData.data.total_page === page ? null : page + 1
  } while (page)

  const processed = sponsors

  return processed
}

function generatePOSTData(
  id: string,
  token: string,
  params: string,
  time = Date.now()
) {
  const timeInSeconds = Math.floor(time / 1000)
  const content = `${token}params${params}ts${timeInSeconds}user_id${id}`
  const signature = createHash('md5').update(content).digest('hex')
  return {
    user_id: id,
    params,
    ts: timeInSeconds,
    sign: signature,
  }
}
