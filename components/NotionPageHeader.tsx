import type * as types from 'notion-types'
import cs from 'classnames'
import * as React from 'react'
import { Header, Search, useNotionContext } from 'react-notion-x'
import { useRouter } from 'next/router'

import {
  isSearchEnabled,
  name,
  navigationLinks,
  navigationStyle
} from '@/lib/config'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

function ToggleThemeButton() {
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  const onToggleTheme = React.useCallback(() => {
    toggleDarkMode()
  }, [toggleDarkMode])

  return (
    <button
      type='button'
      className={cs('academic-theme-toggle', !hasMounted && styles.hidden)}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggleTheme}
    >
      {hasMounted && isDarkMode ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

export function NotionPageHeader({
  block
}: {
  block: types.CollectionViewPageBlock | types.PageBlock
}) {
  const { components, mapPageUrl } = useNotionContext()
  const router = useRouter()

  if (navigationStyle === 'default') {
    return <Header block={block} />
  }

  return (
    <header className='notion-header academic-header'>
      <div className='notion-nav-header'>
        <components.PageLink href='/' className='academic-brand'>
          {name}
        </components.PageLink>
        <nav className='academic-nav' aria-label='Main navigation'>
          {navigationLinks?.map((link) => {
            if (!link?.pageId && !link?.url) return null
            const href = link.pageId ? mapPageUrl(link.pageId) : link.url!
            const active =
              !href.includes('#') &&
              decodeURI(router.asPath.split('?')[0]!) === decodeURI(href)
            return (
              <components.PageLink
                key={link.title}
                href={href}
                className='academic-nav-link'
                aria-current={active ? 'page' : undefined}
              >
                {link.title}
              </components.PageLink>
            )
          })}
        </nav>
        <div className='academic-header-actions'>
          <ToggleThemeButton />
          {isSearchEnabled && <Search block={block} title={null} />}
        </div>
      </div>
    </header>
  )
}
