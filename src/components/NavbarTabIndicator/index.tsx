import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from '@docusaurus/router'
import styles from './styles.module.css'

type IndicatorStyle = {
  left: number
  width: number
  opacity: number
}

const hidden: IndicatorStyle = { left: 0, width: 0, opacity: 0 }

export default function NavbarTabIndicator(): React.JSX.Element {
  const location = useLocation()
  const [indicator, setIndicator] = useState<IndicatorStyle>(hidden)

  const updateIndicator = useCallback(() => {
    const activeLink = document.querySelector<HTMLElement>(
      '.navbar__items--left .navbar__link--active',
    )

    if (!activeLink) {
      setIndicator(hidden)
      return
    }

    const linkRect = activeLink.getBoundingClientRect()

    setIndicator({
      left: linkRect.left,
      width: linkRect.width,
      opacity: 1,
    })
  }, [])

  useEffect(() => {
    updateIndicator()

    window.addEventListener('resize', updateIndicator, { passive: true })
    window.addEventListener('scroll', updateIndicator, { passive: true })

    return () => {
      window.removeEventListener('resize', updateIndicator)
      window.removeEventListener('scroll', updateIndicator)
    }
  }, [location.pathname, updateIndicator])

  return (
    <span
      className={styles.indicator}
      aria-hidden
      style={{
        transform: `translateX(${indicator.left}px)`,
        width: `${indicator.width}px`,
        opacity: indicator.opacity,
      }}
    />
  )
}
