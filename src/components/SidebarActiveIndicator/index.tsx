import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from '@docusaurus/router'
import styles from './styles.module.css'

type IndicatorStyle = {
  top: number
  left: number
  width: number
  height: number
  opacity: number
}

const hidden: IndicatorStyle = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  opacity: 0,
}

type Props = {
  containerRef: React.RefObject<HTMLElement | null>
}

function findActiveLink(container: HTMLElement): HTMLElement | null {
  const currentPage = container.querySelector<HTMLElement>(
    '.menu__link[aria-current="page"]:not(.menu__link--sublist)',
  )
  if (currentPage) {
    return currentPage
  }

  const activeLinks = container.querySelectorAll<HTMLElement>(
    '.menu__link--active:not(.menu__link--sublist)',
  )

  return activeLinks.length > 0
    ? activeLinks[activeLinks.length - 1] ?? null
    : null
}

export default function SidebarActiveIndicator({ containerRef }: Props): React.JSX.Element {
  const location = useLocation()
  const [indicator, setIndicator] = useState<IndicatorStyle>(hidden)

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      setIndicator(hidden)
      return
    }

    const activeLink = findActiveLink(container)
    if (!activeLink) {
      setIndicator(hidden)
      return
    }

    const containerRect = container.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()

    setIndicator({
      top: linkRect.top - containerRect.top + container.scrollTop,
      left: linkRect.left - containerRect.left + container.scrollLeft,
      width: linkRect.width,
      height: linkRect.height,
      opacity: 1,
    })
  }, [containerRef])

  useEffect(() => {
    updateIndicator()

    const container = containerRef.current
    if (!container) {
      return undefined
    }

    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(container)

    const mutationObserver = new MutationObserver(updateIndicator)
    mutationObserver.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'aria-current'],
      childList: true,
    })

    container.addEventListener('scroll', updateIndicator, { passive: true })
    window.addEventListener('resize', updateIndicator, { passive: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      container.removeEventListener('scroll', updateIndicator)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [location.pathname, updateIndicator, containerRef])

  return (
    <span
      className={styles.indicator}
      aria-hidden
      style={{
        transform: `translate(${indicator.left}px, ${indicator.top}px)`,
        width: `${indicator.width}px`,
        height: `${indicator.height}px`,
        opacity: indicator.opacity,
      }}
    />
  )
}
