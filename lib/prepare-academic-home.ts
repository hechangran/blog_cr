import type { Block, Decoration, ExtendedRecordMap } from 'notion-types'
import { getBlockTitle, getBlockValue, parsePageId } from 'notion-utils'

// Presentation only: the original Notion records are never changed.
export function prepareAcademicHome(
  source: ExtendedRecordMap,
  rootPageId: string
): ExtendedRecordMap {
  const rootId = parsePageId(rootPageId, { uuid: true })!
  const root = getBlockValue(source.block[rootId])
  if (!root?.content) return source

  const result = { ...source, block: { ...source.block } }
  const read = (id: string) => getBlockValue(result.block[id])
  const title = (id: string) => {
    const block = read(id)
    return block ? getBlockTitle(block, result).trim() : ''
  }
  const write = (block: Block) => {
    result.block[block.id] = { role: 'reader', value: block }
    return block.id
  }
  const make = (suffix: string, type: Block['type'], text: Decoration[]) =>
    write({
      ...root,
      id: `ea305000-0000-4000-8000-${suffix.padStart(12, '0')}`,
      type,
      parent_id: root.id,
      parent_table: 'block',
      content: [],
      format: {},
      properties: { title: text }
    } as Block)

  const intro: string[] = []
  const groups = new Map<string, string[]>()
  const navigation: string[] = []
  let current = intro
  for (const id of root.content) {
    // Keep the image record for Footer, but omit it from the page body.
    if (id === '3e41c6ca-a59f-8041-8dde-ce76d8744564') continue
    const block = read(id)
    if (!block) {
      current.push(id)
      continue
    }
    if (block.type === 'text' && !title(id) && !block.content?.length) continue
    if (
      block.type === 'callout' &&
      block.content?.some((child) => title(child) === 'Navigation')
    ) {
      navigation.push(
        ...block.content.filter((child) => read(child)?.type === 'page')
      )
      continue
    }
    if (
      ['header', 'sub_header', 'sub_sub_header', 'header_4'].includes(
        block.type
      )
    ) {
      const key = title(id).toLowerCase()
      // Keep repeated or unrecognised sections rather than dropping their content.
      if (!groups.has(key)) groups.set(key, [])
      current = groups.get(key)!
      write({ ...block, type: 'header' } as Block)
    }
    current.push(id)
  }

  const contact = groups.get('contact') ?? []
  const contactLinks: Decoration[] = []
  let allContactsRecognised = contact.length > 1
  for (const id of contact.slice(1)) {
    const block = read(id)
    if (!block || block.content?.length) {
      allContactsRecognised = false
      continue
    }
    const text = title(id)
    const email = text
      .replace(/\s*\[at\]\s*/i, '@')
      .match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0]
    const decorations = (block.properties?.title ?? []) as Decoration[]
    const link = decorations
      ?.flatMap((part) => part[1] ?? [])
      .find((part) => part[0] === 'a')
    const label = /Google Scholar/i.test(text)
      ? 'Google Scholar'
      : /ORCID/i.test(text)
        ? 'ORCID'
        : undefined
    if (email) contactLinks.push([email.replace('@', ' [at] ')])
    else if (label && link)
      contactLinks.push([label, [['a', link[1] as string]]])
    else allContactsRecognised = false
  }
  const contactContent = allContactsRecognised
    ? [
        contact[0]!,
        make(
          '1',
          'text',
          contactLinks.flatMap((link, i) =>
            i ? [['  '] as Decoration, link] : [link]
          )
        )
      ]
    : contact

  const research = [
    ...(groups.get('research interests') ?? []),
    ...(groups.get('research') ?? [])
  ]
  const publications = navigation.find(
    (id) => title(id).toLowerCase() === 'publications'
  )
  const admissions = navigation.find((id) => title(id) === '招生信息')
  const experience = navigation.find(
    (id) =>
      title(id).replace(/\s+/g, ' ').toLowerCase() === 'research experience'
  )
  const publicationsContent =
    groups.get('publications') ??
    (publications
      ? [
          make('2', 'header', [['Publications']]),
          make('3', 'text', [
            [
              'Browse the publication list, including journal articles and conference papers.'
            ]
          ]),
          publications
        ]
      : [])
  const admissionsContent =
    groups.get('prospective students') ??
    (admissions
      ? [
          make('4', 'header', [['Prospective students']]),
          make('5', 'text', [
            [
              'Research opportunities and application information are available in Chinese.'
            ]
          ]),
          admissions
        ]
      : [])

  const preferred = new Set([
    'contact',
    'research',
    'research interests',
    'publications',
    'prospective students',
    'education',
    'honors and awards'
  ])
  const remainder = [...groups]
    .filter(([name]) => !preferred.has(name))
    .flatMap(([, ids]) => ids)
  const otherNavigation = navigation.filter(
    (id) => ![publications, admissions, experience].includes(id)
  )
  const content = [
    ...intro,
    ...contactContent,
    ...research,
    ...(experience ? [experience] : []),
    ...publicationsContent,
    ...admissionsContent,
    ...(groups.get('education') ?? []),
    ...(groups.get('honors and awards') ?? []),
    ...remainder,
    ...otherNavigation
  ]
  write({ ...root, content })
  return result
}
