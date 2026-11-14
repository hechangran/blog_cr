import type { Collection, Decoration, ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getBlockValue } from 'notion-utils'

export interface TimelineEntry {
  id: string
  title: string
  start?: number
  end?: number
}

// Timeline views exist in Notion but are absent from notion-types 7.x.
export interface TimelineView {
  type: string
  name?: string
  format?: {
    timeline_by?: string | { property: string }
    hide_linked_collection_name?: boolean
  }
}

const DAY = 86_400_000

function parseDate(value: string | undefined): number | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const timestamp = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp
    : undefined
}

function dateRange(value: Decoration[] | undefined) {
  for (const part of value ?? []) {
    for (const decoration of part[1] ?? []) {
      if (decoration[0] === 'd') {
        const date = decoration[1]
        const start = parseDate(date.start_date)
        const end = date.end_date ? parseDate(date.end_date) : start
        if (start !== undefined && end !== undefined && end >= start) {
          return { start, end }
        }
      }
    }
  }
  return {}
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Read only this view's query results, preserving its filters and ordering.
// Scanning every page in recordMap could expose rows excluded from the view.
export function getTimelineRows(query: unknown) {
  const ids = new Set<string>()
  let hasMore = false
  function collect(value: unknown) {
    if (!isObject(value)) return
    if (Array.isArray(value.blockIds)) {
      for (const id of value.blockIds) {
        if (typeof id === 'string') ids.add(id)
      }
    }
    if (value.hasMore === true) hasMore = true
    for (const [key, child] of Object.entries(value)) {
      if (
        key === 'reducerResults' ||
        key === 'collection_group_results' ||
        key.startsWith('results:')
      ) {
        collect(child)
      }
    }
    if (Array.isArray(value.groupResults)) {
      for (const group of value.groupResults) collect(group)
    }
  }
  collect(query)
  return { ids: [...ids], hasMore }
}

export function getTimelineEntries(
  recordMap: ExtendedRecordMap,
  collection: Collection,
  view: TimelineView,
  ids: string[]
) {
  const configured = view.format?.timeline_by
  const configuredId =
    typeof configured === 'string' ? configured : configured?.property
  const dates = Object.entries(collection.schema).filter(
    ([, property]) => property.type === 'date'
  )
  // A single date property is unambiguous even when Notion omits timeline_by.
  const dateId =
    configuredId ?? (dates.length === 1 ? dates[0]?.[0] : undefined)
  const validProperty = dateId && collection.schema[dateId]?.type === 'date'
  let missingRows = false
  const entries: TimelineEntry[] = ids.flatMap((id) => {
    const block = getBlockValue(recordMap.block[id])
    if (!block) {
      missingRows = true
      return []
    }
    if (block.alive === false) return []
    return [
      {
        id,
        title: getBlockTitle(block, recordMap) || 'Untitled',
        ...(validProperty ? dateRange(block.properties?.[dateId]) : {})
      }
    ]
  })
  return { entries, missingRows, hasDateProperty: Boolean(validProperty) }
}

export function getTimelineScale(entries: TimelineEntry[]) {
  const dated = entries.filter(
    (entry): entry is TimelineEntry & { start: number; end: number } =>
      entry.start !== undefined && entry.end !== undefined
  )
  if (!dated.length) return undefined
  const first = Math.min(...dated.map((entry) => entry.start))
  const last = Math.max(...dated.map((entry) => entry.end))
  const firstYear = new Date(first).getUTCFullYear()
  const lastYear = new Date(last).getUTCFullYear()
  const start = Date.parse(
    `${String(firstYear).padStart(4, '0')}-01-01T00:00:00Z`
  )
  const end = Date.parse(
    `${String(lastYear + 1).padStart(4, '0')}-01-01T00:00:00Z`
  )
  const span = end - start
  const position = (date: number) => ((date - start) / span) * 100
  const yearCount = lastYear - firstYear + 1
  const step = Math.max(1, Math.ceil(yearCount / 16))
  const ticks = []
  for (let year = firstYear; year <= lastYear; year += step) {
    ticks.push({
      year,
      left: position(
        Date.parse(`${String(year).padStart(4, '0')}-01-01T00:00:00Z`)
      )
    })
  }
  return {
    ticks,
    width: Math.max(640, Math.min(1440, yearCount * 76)),
    bars: new Map(
      dated.map((entry) => [
        entry.id,
        {
          left: position(entry.start),
          // Date ranges include their end date. Single dates remain visible.
          width: Math.min(
            100 - position(entry.start),
            ((entry.end + DAY - entry.start) / span) * 100
          )
        }
      ])
    )
  }
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
})

export function formatTimelineDate(entry: TimelineEntry) {
  if (entry.start === undefined || entry.end === undefined)
    return 'No date range'
  const start = dateFormatter.format(entry.start)
  return entry.start === entry.end
    ? start
    : `${start} – ${dateFormatter.format(entry.end)}`
}
