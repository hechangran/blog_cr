import Image from 'next/image'
import { getBlockValue } from 'notion-utils'
import * as React from 'react'
import { useNotionContext } from 'react-notion-x'

import * as config from '@/lib/config'
import { mapImageUrl } from '@/lib/map-image-url'
import { GitHubIcon } from '@/lib/icons/github'
import { LinkedInIcon } from '@/lib/icons/linkedin'
import { MoonIcon } from '@/lib/icons/moon'
import { SunIcon } from '@/lib/icons/sun'
import { TwitterIcon } from '@/lib/icons/twitter'
import { useDarkMode } from '@/lib/use-dark-mode'

import styles from './styles.module.css'

const footerLogoBlockId = '3e41c6ca-a59f-8041-8dde-ce76d8744564'

export function FooterImpl() {
  const { recordMap } = useNotionContext()
  const logoBlock = getBlockValue(recordMap.block[footerLogoBlockId])
  // Read the current image URL from the Notion data fetched for this page.
  // Signed URLs are refreshed with the page data instead of being hardcoded.
  const logoUrl =
    logoBlock?.type === 'image'
      ? recordMap.signed_urls?.[footerLogoBlockId] ||
        mapImageUrl(logoBlock.properties?.source?.[0]?.[0], logoBlock)
      : undefined
  const [hasMounted, setHasMounted] = React.useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const currentYear = new Date().getFullYear()

  const onToggleDarkMode = React.useCallback(
    (e: any) => {
      e.preventDefault()
      toggleDarkMode()
    },
    [toggleDarkMode]
  )

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <footer className={styles.footer}>
      <div
        className={styles.copyright}
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <span>
          Copyright {currentYear} {config.author}
        </span>
        {logoUrl && (
          <Image
            src={logoUrl}
            alt='Changran He personal logo'
            width={48}
            height={48}
            unoptimized
            style={{ objectFit: 'contain', flexShrink: 0 }}
          />
        )}
      </div>

      <div className={styles.settings}>
        {hasMounted && (
          <a
            className={styles.toggleDarkMode}
            href='#'
            role='button'
            onClick={onToggleDarkMode}
            title='Toggle dark mode'
          >
            {isDarkMode ? <MoonIcon /> : <SunIcon />}
          </a>
        )}
      </div>

      <div className={styles.social}>
        {config.twitter && (
          <a
            className={styles.twitter}
            href={`https://x.com/${config.twitter}`}
            title={`X @${config.twitter}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <TwitterIcon />
          </a>
        )}

        {config.github && (
          <a
            className={styles.github}
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <GitHubIcon />
          </a>
        )}

        {config.linkedin && (
          <a
            className={styles.linkedin}
            href={`https://www.linkedin.com/in/${config.linkedin}`}
            title={`LinkedIn ${config.author}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
    </footer>
  )
}

export const Footer = React.memo(FooterImpl)
