import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: '0e046dfaf0e84f5ab0a77cd4897d345a',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: null,

  // basic site info (required)
  name: 'Changran He',
  domain: 'crhe.vercel.app',
  author: 'Changran He',

  // open graph metadata (optional)
  description:
    'Changran He | Cooperative control, output regulation and their applications. South China University of Technology.',

  // social usernames (optional)
  // twitter: 'transitive_bs',
  github: 'hechangran',
  linkedin: 'crhe',
  // mastodon: '#', // optional mastodon profile URL, provides link verification
  // newsletter: '#', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: null,

  // whether to use the default notion navigation style or a custom one with links to
  // important pages. To use `navigationLinks`, set `navigationStyle` to `custom`.
  navigationStyle: 'custom',
  navigationLinks: [
    { title: 'Research', url: '/#3d46c77827a14414bbbbb2a83db20f0c' },
    { title: 'Publications', pageId: '4850c6aadc234f9e89029e6c0951dbea' },
    { title: '招生信息', pageId: '3591c6caa59f80d492e5dc275fd36490' },
    { title: 'Contact', url: '/#d2416af857db4c069ccd7d9f7fad80a5' }
  ],
  isSearchEnabled: false
})
