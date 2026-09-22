import type * as types from 'notion-types'
import { Header, Search, useNotionContext } from 'react-notion-x'
import { useRouter } from 'next/router'

import {
  isSearchEnabled,
  name,
  navigationLinks,
  navigationStyle
} from '@/lib/config'

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
        {isSearchEnabled && (
          <div className='academic-header-actions'>
            <Search block={block} title={null} />
          </div>
        )}
      </div>
    </header>
  )
}
