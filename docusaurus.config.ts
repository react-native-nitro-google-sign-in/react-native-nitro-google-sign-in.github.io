import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const organizationName = 'react-native-nitro-google-sign-in'
const projectName = 'react-native-nitro-google-sign-in.github.io'
const npmPackageName = 'react-native-nitro-google-signin'
const npmPackageUrl = `https://www.npmjs.com/package/${npmPackageName}`
const githubRepoUrl =
  'https://github.com/react-native-nitro-google-sign-in/google-signin'

/**
 * Org GitHub Pages site (this repo): https://react-native-nitro-google-sign-in.github.io/
 * CI sets DOCUSAURUS_BASE_URL=/ ; override locally if needed.
 */
const baseUrl = process.env.DOCUSAURUS_BASE_URL ?? '/'
const docsOrigin = 'https://react-native-nitro-google-sign-in.github.io'
const siteBase = `${docsOrigin}${baseUrl.replace(/\/$/, '')}`

const config: Config = {
  title: 'React Native Nitro Google Sign-In',
  tagline: 'Nitro-powered Universal Google Sign-In for React Native',
  favicon: 'img/favicon.svg',
  url: 'https://react-native-nitro-google-sign-in.github.io',
  baseUrl,
  organizationName,
  projectName,
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'content',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.svg',
    navbar: {
      title: 'Nitro Google Sign-In',
      logo: {
        alt: 'Nitro Google Sign-In',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guideSidebar',
          position: 'left',
          label: 'Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'agentsSidebar',
          position: 'left',
          label: 'Agents',
        },
        {
          label: 'Agent skill',
          to: '/docs/agents/skill',
          position: 'right',
        },
        {
          href: npmPackageUrl,
          label: 'npm',
          position: 'right',
        },
        {
          href: githubRepoUrl,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Installation', to: '/docs/getting-started/installation' },
            { label: 'Quick Start', to: '/docs/getting-started/quick-start' },
          ],
        },
        {
          title: 'Setup',
          items: [
            { label: 'Expo', to: '/docs/setup/expo' },
            { label: 'Android', to: '/docs/setup/android' },
            { label: 'iOS', to: '/docs/setup/ios' },
            { label: 'Google Cloud & config', to: '/docs/setup/google-cloud' },
          ],
        },
        {
          title: 'Agents',
          items: [
            { label: 'For AI agents', to: '/docs/agents/overview' },
            { label: 'Install agent skill', to: '/docs/agents/skill' },
            { label: 'Rules & workflow', to: '/docs/agents/rules' },
            { label: 'List on skills.sh', to: '/docs/agents/skills-sh' },
            { label: 'Skill source (GitHub)', href: 'https://github.com/react-native-nitro-google-sign-in/google-signin/tree/main/skills/react-native-nitro-google-signin' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Contributing', to: '/docs/community/contributing' },
            { label: 'Code of Conduct', to: '/docs/community/code-of-conduct' },
            { label: 'Security', to: '/docs/community/security' },
            { label: 'Support', to: '/docs/community/support' },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/react-native-nitro-google-sign-in/google-signin/issues',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Usage guide',
              to: '/docs/guide/usage',
            },
            {
              label: 'npm package',
              href: npmPackageUrl,
            },
            {
              label: 'Nitro Modules',
              href: 'https://nitro.margelo.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} react-native-nitro-google-signin. MIT.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'swift', 'kotlin'],
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
