import { loadConfig as _loadConfig } from 'unconfig'
import { loadEnv } from './env'
import { presets } from './presets'
import type { SponsorkitConfig, Tier } from './types'

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

  return {
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
  } as Required<SponsorkitConfig>
}
