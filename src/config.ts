import { loadConfig as _loadConfig } from 'unconfig'
import { loadEnv } from './env'
import { FALLBACK_AVATAR } from './fallback'
import { presets } from './presets'
import type { SponsorkitConfig, Sponsorship, Tier } from './types'

export const defaultTiers: Tier[] = [
  {
    title: '石镐',
    preset: presets.medium,
  },
  {
    title: '铁镐',
    monthlyDollars: 15,
    preset: presets.large,
  },
  {
    title: '钻石镐',
    monthlyDollars: 30,
    preset: presets.xl,
  },
  {
    title: '下界合金镐',
    monthlyDollars: 50,
    preset: presets.xl,
  },
]

export const defaultInlineCSS = `
text {
  font-weight: 300;
  font-size: 14px;
  fill: #777777;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
.sponsorkit-link {
  cursor: pointer;
}
.sponsorkit-tier-title {
  font-weight: 500;
  font-size: 20px;
}
`

export const defaultConfig: SponsorkitConfig = {
  width: 800,
  outputDir: './sponsorkit',
  cacheFile: '.cache.json',
  formats: ['json', 'svg', 'png'],
  tiers: defaultTiers,
  name: 'sponsors',
  includePrivate: false,
  svgInlineCSS: defaultInlineCSS,
}

export function defineConfig(config: SponsorkitConfig) {
  return config
}

export async function loadConfig(inlineConfig: SponsorkitConfig = {}) {
  const env = loadEnv()

  const { config = {} } = await _loadConfig<SponsorkitConfig>({
    sources: [
      {
        files: 'sponsor.config',
      },
      {
        files: 'sponsorkit.config',
      },
    ],
    merge: true,
  })

  const hasNegativeTier = !!config.tiers?.find(tier => tier && tier.monthlyDollars! <= 0)

  const resolved = {
    fallbackAvatar: FALLBACK_AVATAR,
    includePastSponsors: hasNegativeTier,
    ...defaultConfig,
    ...env,
    ...config,
    ...inlineConfig,
    github: {
      ...env.github,
      ...config.github,
      ...inlineConfig.github,
    },
    patreon: {
      ...env.patreon,
      ...config.patreon,
      ...inlineConfig.patreon,
    },
    opencollective: {
      ...env.opencollective,
      ...config.opencollective,
      ...inlineConfig.opencollective,
    },
    afdian: {
      ...env.afdian,
      ...config.afdian,
      ...inlineConfig.afdian,
    },
  } as Required<SponsorkitConfig>

  return resolved
}

export interface TierPartition {
  monthlyDollars: number
  tier: Tier
  sponsors: Sponsorship[]
}

export function partitionTiers(sponsors: Sponsorship[], tiers: Tier[], includePastSponsors?: boolean) {
  const tierMappings = tiers!.map<TierPartition>(tier => ({
    monthlyDollars: tier.monthlyDollars ?? 0,
    tier,
    sponsors: [],
  }))

  tierMappings.sort((a, b) => b.monthlyDollars - a.monthlyDollars)

  const finalSponsors = tierMappings.filter(i => i.monthlyDollars === 0)

  if (finalSponsors.length !== 1)
    throw new Error(`There should be exactly one tier with no \`monthlyDollars\`, but got ${finalSponsors.length}`)

  sponsors
    .sort((a, b) => Date.parse(a.createdAt!) - Date.parse(b.createdAt!))
    .filter(s => s.monthlyDollars > 0 || includePastSponsors) // Past sponsors monthlyDollars is -1
    .forEach((sponsor) => {
      const tier = tierMappings.find(t => sponsor.monthlyDollars >= t.monthlyDollars) ?? tierMappings[0]
      tier.sponsors.push(sponsor)
    })

  return tierMappings
}
