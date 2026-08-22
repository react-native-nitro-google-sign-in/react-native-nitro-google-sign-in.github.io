import React, { useEffect } from 'react'
import Layout from '@theme-original/Layout'
import type { Props } from '@theme/Layout'
import NitroBackdrop from '@site/src/components/NitroBackdrop'
import NavbarTabIndicator from '@site/src/components/NavbarTabIndicator'
import styles from './styles.module.css'

export default function LayoutWrapper(props: Props): React.JSX.Element {
  useEffect(() => {
    document.documentElement.classList.add('ngs-docs-shell')
    return () => document.documentElement.classList.remove('ngs-docs-shell')
  }, [])

  return (
    <div className={styles.root}>
      <NitroBackdrop />
      <NavbarTabIndicator />
      <Layout {...props} />
    </div>
  )
}
