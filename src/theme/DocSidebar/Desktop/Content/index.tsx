import React, { useRef, useState } from 'react'
import clsx from 'clsx'
import { ThemeClassNames } from '@docusaurus/theme-common'
import {
  useAnnouncementBar,
  useScrollPosition,
} from '@docusaurus/theme-common/internal'
import { translate } from '@docusaurus/Translate'
import DocSidebarItems from '@theme/DocSidebarItems'
import SidebarActiveIndicator from '@site/src/components/SidebarActiveIndicator'
import type { Props } from '@theme/DocSidebar/Desktop/Content'
import styles from './styles.module.css'

function useShowAnnouncementBar(): boolean {
  const { isActive } = useAnnouncementBar()
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(isActive)
  useScrollPosition(
    ({ scrollY }) => {
      if (isActive) {
        setShowAnnouncementBar(scrollY === 0)
      }
    },
    [isActive],
  )
  return isActive && showAnnouncementBar
}

export default function DocSidebarDesktopContent({
  path,
  sidebar,
  className,
}: Props): React.JSX.Element {
  const navRef = useRef<HTMLElement>(null)
  const showAnnouncementBar = useShowAnnouncementBar()

  return (
    <nav
      ref={navRef}
      aria-label={translate({
        id: 'theme.docs.sidebar.navAriaLabel',
        message: 'Docs sidebar',
        description: 'The ARIA label for the sidebar navigation',
      })}
      className={clsx(
        'menu thin-scrollbar',
        styles.menu,
        styles.menuNav,
        showAnnouncementBar && styles.menuWithAnnouncementBar,
        className,
      )}
    >
      <SidebarActiveIndicator containerRef={navRef} />
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list', styles.menuList)}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} />
      </ul>
    </nav>
  )
}
