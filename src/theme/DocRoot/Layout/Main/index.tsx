import React from 'react'
import Main from '@theme-original/DocRoot/Layout/Main'
import type { Props } from '@theme/DocRoot/Layout/Main'
import { useLocation } from '@docusaurus/router'
import styles from './styles.module.css'

export default function MainWrapper(props: Props): React.JSX.Element {
  const location = useLocation()

  return (
    <div className={styles.frame}>
      <div className={styles.panel}>
        <div key={location.pathname} className={styles.contentTransition}>
          <Main {...props} />
        </div>
      </div>
    </div>
  )
}
