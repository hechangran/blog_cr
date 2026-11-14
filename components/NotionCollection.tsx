/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- The scroll region must be keyboard accessible. */
import type { ComponentProps, CSSProperties } from 'react'
import {
  getBlockCollectionId,
  getBlockValue,
  getTextContent
} from 'notion-utils'
import { Collection } from 'react-notion-x/third-party/collection'

import {
  formatTimelineDate,
  getTimelineEntries,
  getTimelineRows,
  getTimelineScale,
  type TimelineView
} from '@/lib/notion-timeline'

import styles from './NotionTimeline.module.css'

export function NotionCollection(props: ComponentProps<typeof Collection>) {
  const { block, ctx, className } = props
  const { recordMap, mapPageUrl, components } = ctx
  // Leave ordinary databases and database-page properties to react-notion-x.
  if (block.type === 'page') return <Collection {...props} />
  const viewId = block.view_ids?.[0]
  const view = viewId
    ? (getBlockValue(recordMap.collection_view[viewId]) as
        | TimelineView
        | undefined)
    : undefined
  if (view?.type !== 'timeline') return <Collection {...props} />

  const collectionId = getBlockCollectionId(block, recordMap)
  const collection = collectionId
    ? getBlockValue(recordMap.collection[collectionId])
    : undefined
  const query =
    collectionId && viewId
      ? recordMap.collection_query[collectionId]?.[viewId]
      : undefined
  const notionUrl = `https://www.notion.so/${block.id.replaceAll('-', '')}`
  const title = collection ? getTextContent(collection.name).trim() : ''
  const showTitle =
    title &&
    !(
      block.format &&
      'hide_inline_collection_name' in block.format &&
      block.format.hide_inline_collection_name
    ) &&
    !view.format?.hide_linked_collection_name
  const { ids, hasMore } = getTimelineRows(query)
  const data = collection
    ? getTimelineEntries(recordMap, collection, view, ids)
    : undefined
  const entries = data?.entries ?? []
  const scale = getTimelineScale(entries)
  const PageLink = components.PageLink
  const notice =
    !collection || !query
      ? 'The timeline is currently unavailable.'
      : !data?.hasDateProperty
        ? 'This timeline needs a date property.'
        : !entries.length
          ? 'No entries to display.'
          : undefined

  return (
    <section
      className={`${styles.timeline} ${className ?? ''}`}
      aria-label={title || 'Research timeline'}
    >
      {showTitle ? <h2 className={styles.title}>{title}</h2> : null}
      {notice ? <p className={styles.note}>{notice}</p> : null}
      {entries.length > 0 ? (
        <div
          className={styles.scroll}
          role='region'
          aria-label='Timeline, scroll horizontally to see all dates'
          tabIndex={0}
        >
          <div
            className={styles.chart}
            style={
              {
                '--timeline-width': `${scale?.width ?? 640}px`
              } as CSSProperties
            }
          >
            {scale ? (
              <div className={styles.axis} aria-hidden='true'>
                <span className={styles.axisLabel}>Experience</span>
                <div className={styles.track}>
                  {scale.ticks.map((tick) => (
                    <span
                      className={styles.year}
                      key={tick.year}
                      style={{ left: `${tick.left}%` }}
                    >
                      {tick.year}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <ol className={styles.entries}>
              {entries.map((entry) => {
                const bar = scale?.bars.get(entry.id)
                const date = formatTimelineDate(entry)
                return (
                  <li key={entry.id}>
                    <PageLink
                      href={mapPageUrl(entry.id)}
                      className={styles.entry}
                    >
                      <span className={styles.label}>
                        <span className={styles.name}>{entry.title}</span>
                        <span className={styles.date}>{date}</span>
                      </span>
                      <span className={styles.track} aria-hidden='true'>
                        {scale?.ticks.map((tick) => (
                          <span
                            className={styles.gridline}
                            key={tick.year}
                            style={{ left: `${tick.left}%` }}
                          />
                        ))}
                        {bar ? (
                          <span
                            className={styles.bar}
                            style={{
                              left: `${bar.left}%`,
                              width: `${bar.width}%`
                            }}
                          />
                        ) : null}
                      </span>
                    </PageLink>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      ) : null}
      {hasMore || data?.missingRows ? (
        <p className={styles.note}>Some entries are not available here.</p>
      ) : null}
      <a
        className={styles.source}
        href={notionUrl}
        target='_blank'
        rel='noopener noreferrer'
      >
        View timeline in Notion ↗
      </a>
    </section>
  )
}
