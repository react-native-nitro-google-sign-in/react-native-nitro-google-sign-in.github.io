import React, { useCallback, useEffect, useState } from 'react'
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

export default function TOCActiveIndicator({
  containerRef,
}: Props): React.JSX.Element {
  const [indicator, setIndicator] = useState<IndicatorStyle>(hidden)

  const updateIndicator = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      setIndicator(hidden)
      return
    }

    const activeLink = container.querySelector<HTMLElement>(
      '.table-of-contents__link--active',
    )

    if (!activeLink) {
      setIndicator(hidden)
      return
    }

    const containerRect = container.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()

    setIndicator({
      top: linkRect.top - containerRect.top + container.scrollTop,
      left: linkRect.left - containerRect.left + container.scrollLeft,
      width: Math.max(linkRect.width, 8),
      height: Math.max(linkRect.height, 8),
      opacity: 1,
    })
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    updateIndicator()
    const boot = window.setTimeout(updateIndicator, 50)

    const resizeObserver = new ResizeObserver(updateIndicator)
    resizeObserver.observe(container)

    const mutationObserver = new MutationObserver(() => {
      window.requestAnimationFrame(updateIndicator)
    })
    mutationObserver.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
    })

    const onScroll = () => window.requestAnimationFrame(updateIndicator)
    container.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', updateIndicator, { passive: true })

    return () => {
      window.clearTimeout(boot)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      container.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', updateIndicator)
    }
  }, [updateIndicator, containerRef])

  return (
    <span
      className={styles.indicator}
      aria-hidden
      style={{
        transform: `translate3d(${indicator.left}px, ${indicator.top}px, 0)`,
        width: `${indicator.width}px`,
        height: `${indicator.height}px`,
        opacity: indicator.opacity,
      }}
    />
  )
}
