import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageBento from '@site/src/components/HomepageBento'
import styles from './index.module.css'

const stats = [
  { label: 'React Native', value: '0.76+' },
  { label: 'Android', value: 'Credential Manager' },
  { label: 'iOS', value: 'Google Sign-In SDK' },
  { label: 'Expo', value: 'Dev builds' },
]

export default function Home(): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  return (
    <Layout
      title="Home"
      description="Nitro-powered Universal Google Sign-In for React Native — Android, iOS, and Expo dev builds."
    >
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroGrid)}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>
                <span className={styles.kickerDot} aria-hidden />
                Nitro Modules · JSI · Universal One Tap
              </p>
              <h1 className={styles.title}>
                Google Sign-In,
                <span className={styles.titleAccent}>native speed</span>
              </h1>
              <p className={styles.subtitle}>{siteConfig.tagline}</p>

              <div className={styles.actions}>
                <Link className={styles.googleButton} to="/docs/getting-started/quick-start">
                  <span className={styles.googleMark} aria-hidden>
                    G
                  </span>
                  Start with Quick Start
                </Link>
                <Link className={styles.ghostButton} to="/docs/getting-started/installation">
                  Installation guide
                </Link>
              </div>

              <ul className={styles.stats}>
                {stats.map((item) => (
                  <li key={item.label} className={styles.stat}>
                    <span className={styles.statValue}>{item.value}</span>
                    <span className={styles.statLabel}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.heroStage}>
              <div className={styles.orbit} aria-hidden />
              <div className={styles.codeCard}>
                <div className={styles.codeHeader}>
                  <span className={styles.traffic} data-color="red" />
                  <span className={styles.traffic} data-color="yellow" />
                  <span className={styles.traffic} data-color="green" />
                  <span className={styles.fileName}>App.tsx</span>
                </div>
                <pre className={styles.codeBody}>
                  <code>
                    <span className={styles.tokenKeyword}>import</span>{' '}
                    {'{ GoogleOneTapSignIn }'}
                    <span className={styles.tokenKeyword}> from</span>{' '}
                    <span className={styles.tokenString}>
                      'react-native-nitro-google-signin'
                    </span>
                    {'\n\n'}
                    <span className={styles.tokenKeyword}>await</span>{' '}
                    GoogleOneTapSignIn.
                    <span className={styles.tokenFn}>configure</span>({'{'}
                    {'\n'}
                    {'  '}
                    <span className={styles.tokenProp}>webClientId</span>:{' '}
                    <span className={styles.tokenString}>'autoDetect'</span>,{'\n'}
                    {'  '}
                    <span className={styles.tokenProp}>scopes</span>: [
                    <span className={styles.tokenString}>'email'</span>],{'\n'}
                    {'})'}
                    {'\n\n'}
                    <span className={styles.tokenKeyword}>const</span> result ={' '}
                    <span className={styles.tokenKeyword}>await</span>{' '}
                    GoogleOneTapSignIn.
                    <span className={styles.tokenFn}>signIn</span>()
                  </code>
                </pre>
                <div className={styles.codeBadge}>Zero bridge. Direct JSI.</div>
              </div>
            </div>
          </div>
        </section>

        <HomepageBento />
      </div>
    </Layout>
  )
}
