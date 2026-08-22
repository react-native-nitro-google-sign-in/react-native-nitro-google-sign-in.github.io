import React from 'react'

import untypedCompatibilityData from '../../../compatibility.json'
import styles from './styles.module.css'

interface CompatibilityEntry {
  'react-native': string[]
  'react-native-nitro-modules': string[]
}

type CompatibilityData = Record<string, CompatibilityEntry>

const compatibilityData = untypedCompatibilityData as CompatibilityData

function Yes() {
  return (
    <span className={styles.yesBadge} aria-label="Supported">
      ✓
    </span>
  )
}

function No() {
  return (
    <span className={styles.noBadge} aria-label="Not supported">
      ✕
    </span>
  )
}

interface CompatibilityItem {
  version: string
  compatibility: Record<string, boolean>
}

function sortVersionKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const majorA = Number.parseInt(a.split('.')[0] ?? '0', 10)
    const majorB = Number.parseInt(b.split('.')[0] ?? '0', 10)
    if (majorA !== majorB) {
      return majorB - majorA
    }
    return b.localeCompare(a, undefined, { numeric: true })
  })
}

function parseNumericVersion(version: string): number {
  const parsed = Number.parseFloat(version)
  return Number.isNaN(parsed) ? 0 : parsed
}

/** Keep the table readable without horizontal scroll. */
const RN_COLUMN_LIMIT = 6
const NITRO_COLUMN_LIMIT = 4

function trimVersionsForDisplay(
  versions: string[],
  limit: number,
): { visible: string[]; hidden: string[] } {
  const sorted = [...versions].sort(
    (a, b) => parseNumericVersion(a) - parseNumericVersion(b),
  )

  if (sorted.length <= limit) {
    return { visible: sorted, hidden: [] }
  }

  return {
    visible: sorted.slice(-limit),
    hidden: sorted.slice(0, sorted.length - limit),
  }
}

function formatHiddenVersions(hidden: string[]): string {
  if (hidden.length === 0) {
    return ''
  }
  if (hidden.length === 1) {
    return hidden[0]
  }
  return `${hidden[0]}–${hidden[hidden.length - 1]}`
}

function extractVersions(
  entries: [string, CompatibilityEntry][],
  key: keyof CompatibilityEntry,
): string[] {
  return Array.from(new Set(entries.flatMap(([, entry]) => entry[key]))).sort(
    (a, b) => a.localeCompare(b, undefined, { numeric: true }),
  )
}

function createCompatibilityItems(
  entries: [string, CompatibilityEntry][],
  versions: string[],
  getSupportedVersions: (entry: CompatibilityEntry) => Set<string>,
): CompatibilityItem[] {
  return entries.map(([version, data]) => {
    const supportedVersions = getSupportedVersions(data)
    const compatibility = Object.fromEntries(
      versions.map((versionNumber) => [
        versionNumber,
        supportedVersions.has(versionNumber),
      ]),
    )

    return {
      version,
      compatibility,
    }
  })
}

interface CompatibilityTableProps {
  versions: string[]
  items: CompatibilityItem[]
  hiddenVersions?: string[]
  hiddenVersionsLabel?: string
}

function CompatibilityTable({
  versions,
  items,
  hiddenVersions = [],
  hiddenVersionsLabel = 'React Native',
}: CompatibilityTableProps) {
  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.labelCol} />
            {versions.map((version) => (
              <col key={version} className={styles.dataCol} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className={styles.cornerCell} scope="col" />
              {versions.map((version) => (
                <th key={version} className={styles.headerCell} scope="col">
                  {version}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.version}>
                <th className={styles.version} scope="row">
                  {item.version}
                </th>
                {versions.map((version) => (
                  <td
                    key={version}
                    className={
                      item.compatibility[version]
                        ? styles.supported
                        : styles.notSupported
                    }
                  >
                    {item.compatibility[version] ? <Yes /> : <No />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hiddenVersions.length > 0 ? (
        <p className={styles.tableNote}>
          {hiddenVersionsLabel}{' '}
          <code>{formatHiddenVersions(hiddenVersions)}</code> is also supported.
          See{' '}
          <a href="https://github.com/react-native-nitro-google-sign-in/google-signin/blob/main/compatibility.json">
            compatibility.json
          </a>{' '}
          for the full matrix.
        </p>
      ) : null}
    </>
  )
}

function getCompatibilityEntries(): [string, CompatibilityEntry][] {
  return sortVersionKeys(Object.keys(compatibilityData)).map((key) => [
    key,
    compatibilityData[key],
  ])
}

export function NitroGoogleSignInCompatibility() {
  const entries = getCompatibilityEntries()
  const reactNativeVersions = extractVersions(entries, 'react-native')
  const { visible, hidden } = trimVersionsForDisplay(
    reactNativeVersions,
    RN_COLUMN_LIMIT,
  )
  const items = createCompatibilityItems(
    entries,
    visible,
    (data) => new Set(data['react-native']),
  )

  return (
    <CompatibilityTable
      versions={visible}
      items={items}
      hiddenVersions={hidden}
      hiddenVersionsLabel="React Native"
    />
  )
}

export function NitroModulesCompatibility() {
  const entries = getCompatibilityEntries()
  const nitroModulesVersions = extractVersions(
    entries,
    'react-native-nitro-modules',
  )

  if (nitroModulesVersions.length === 0) {
    return (
      <p>
        No react-native-nitro-modules compatibility data available for this
        version.
      </p>
    )
  }

  const { visible, hidden } = trimVersionsForDisplay(
    nitroModulesVersions,
    NITRO_COLUMN_LIMIT,
  )
  const items = createCompatibilityItems(
    entries,
    visible,
    (data) => new Set(data['react-native-nitro-modules']),
  )

  return (
    <CompatibilityTable
      versions={visible}
      items={items}
      hiddenVersions={hidden}
      hiddenVersionsLabel="react-native-nitro-modules"
    />
  )
}
