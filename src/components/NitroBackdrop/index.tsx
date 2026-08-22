import React from 'react'
import styles from './styles.module.css'

export default function NitroBackdrop(): React.JSX.Element {
  return (
    <div className={styles.backdrop} aria-hidden>
      <div className={styles.grid} />
    </div>
  )
}
