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
  let page = 1
  do {
    const requestTS = Date.now()
    const sponsorshipData = await $fetch(sponsorshipApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'json',
      body: JSON.stringify(
        generatePOSTData(id, token, JSON.stringify({ page }, requestTS))
      ),
    })

    console.log(
      sponsorshipData,
      generatePOSTData(id, token, JSON.stringify({ page }, requestTS))
    )
    sponsors.push(
      ...sponsorshipData.data.list.map(
        (user: any): Sponsorship => ({
          sponsor: {
            name: user.user.name,
            login: user.user.user_id,
            type: 'User',
            avatarUrl: user.user.avatar,
          },
          monthlyDollars: user.all_sum_amount,
          tierName: user.current_plan.name || '自定义',
          isOneTime: false,
        })
      )
    )
    page = sponsorshipData.data.total_page === page ? page++ : page
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
  const content = `${token}params${params}ts${time}user_id${id}`
  const signature = createHash('md5').update(content).digest('hex')
  return {
    user_id: id,
    params,
    ts: time,
    sign: signature,
  }
}
