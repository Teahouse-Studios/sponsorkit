import type { Provider, ProviderName, SponsorkitConfig } from '../types'
import { GitHubProvider } from './github'
import { PatreonProvider } from './patreon'
import { AfdianProvider } from './afdian'

export * from './github'

export const ProvidersMap = {
  github: GitHubProvider,
  patreon: PatreonProvider,
  afdian: AfdianProvider,
}

export function guessProviders(config: SponsorkitConfig) {
  const items: ProviderName[] = []
  if (config.github && config.github.login)
    items.push('github')

  if (config.patreon && config.patreon.token)
    items.push('patreon')

  if (config.afdian && config.afdian.token)
    items.push('afdian')

  // fallback
  if (!items.length)
    items.push('github')

  return items
}

export function resolveProviders(names: (ProviderName | Provider)[]) {
  return Array.from(new Set(names)).map((i) => {
    if (typeof i === 'string') {
      const provider = ProvidersMap[i]
      if (!provider)
        throw new Error(`Unknown provider: ${i}`)
      return provider
    }
    return i
  })
}
