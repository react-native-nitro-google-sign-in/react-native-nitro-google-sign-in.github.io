import React, { useRef } from 'react'
import clsx from 'clsx'
import TOCItems from '@theme/TOCItems'
import type { Props } from '@theme/TOC'
import TOCActiveIndicator from '@site/src/components/TOCActiveIndicator'
import styles from './styles.module.css'

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight'
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active'

export default function TOC({ className, ...props }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}
    >
      <TOCActiveIndicator containerRef={containerRef} />
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </div>
  )
}
