import clsx from 'clsx'
import Link from '@docusaurus/Link'
import styles from './styles.module.css'

type Tile = {
  title: string
  description: string
  to: string
  size: 'wide' | 'tall' | 'normal'
  accent: 'blue' | 'violet' | 'cyan' | 'green' | 'amber' | 'rose'
  tag: string
}

const tiles: Tile[] = [
  {
    title: 'Universal One Tap API',
    description:
      'configure, signIn, createAccount, and presentExplicitSignIn with typed responses.',
    to: '/docs/guide/usage',
    size: 'wide',
    accent: 'blue',
    tag: 'API',
  },
  {
    title: 'Nitro + JSI bridge',
    description:
      'Direct JS-to-native calls through react-native-nitro-modules — no legacy bridge.',
    to: '/docs/getting-started/requirements',
    size: 'tall',
    accent: 'violet',
    tag: 'Native',
  },
  {
    title: 'Expo dev builds',
    description: 'Config plugin for Google Services, URL schemes, and Firebase files.',
    to: '/docs/setup/expo',
    size: 'normal',
    accent: 'cyan',
    tag: 'Expo',
  },
  {
    title: 'Official sign-in button',
    description: 'HybridView with native GIDSignInButton / SignInButton styling.',
    to: '/docs/guide/google-sign-in-button',
    size: 'normal',
    accent: 'green',
    tag: 'UI',
  },
  {
    title: 'TypeScript-first',
    description: 'Status helpers, typed tokens, and exhaustive API reference.',
    to: '/docs/guide/api-reference',
    size: 'normal',
    accent: 'amber',
    tag: 'Types',
  },
  {
    title: 'Agent skill + rules',
    description: 'Install the skill for Cursor, Copilot, Claude Code, and skills.sh.',
    to: '/docs/agents/skill',
    size: 'wide',
    accent: 'rose',
    tag: 'Agents',
  },
]

export default function HomepageBento(): React.JSX.Element {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>Explore the docs</p>
          <h2 className={styles.sectionTitle}>Everything you need to ship sign-in</h2>
        </div>

        <div className={styles.grid}>
          {tiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.to}
              className={clsx(
                styles.tile,
                styles[`size_${tile.size}`],
                styles[`accent_${tile.accent}`],
              )}
            >
              <span className={styles.tileTag}>{tile.tag}</span>
              <h3 className={styles.tileTitle}>{tile.title}</h3>
              <p className={styles.tileDesc}>{tile.description}</p>
              <span className={styles.tileArrow} aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
