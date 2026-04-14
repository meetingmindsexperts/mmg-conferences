import {mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'docs')
const publicStylesPath = path.join(docsDir, 'styles.css')

const PROJECT_ID = 'cfy1tt5s'
const DATASET = 'production'
const API_VERSION = '2025-02-07'
const DEFAULT_BASE_URL = 'https://meetingmindsexperts.github.io/mmg-conferences'
const BASE_QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`

async function fetchQuery(query, params = {}) {
  const url = new URL(BASE_QUERY_URL)
  url.searchParams.set('query', query)
  if (Object.keys(params).length > 0) {
    url.searchParams.set('$', JSON.stringify(params))
  }

  const headers = {}
  if (process.env.SANITY_READ_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SANITY_READ_TOKEN}`
  }

  const response = await fetch(url, {headers})
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Sanity query failed (${response.status}): ${body.slice(0, 300)}`)
  }

  const json = await response.json()
  return json.result
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function blocksToHtml(blocks = []) {
  return blocks
    .map((block) => {
      const text = (block.children || []).map((child) => escapeHtml(child.text || '')).join('')
      return text ? `<p>${text}</p>` : ''
    })
    .join('')
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ')
}

function truncate(value = '', maxLength = 160) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trim()}…`
}

function formatDateRange(dateRange) {
  if (!dateRange?.startDate) return ''

  const start = new Date(dateRange.startDate)
  const end = dateRange.endDate ? new Date(dateRange.endDate) : null
  const formatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (!end) return formatter.format(start)
  return `${formatter.format(start)} - ${formatter.format(end)}`
}

function normalizeBaseUrl(siteUrl) {
  if (!siteUrl) return DEFAULT_BASE_URL
  return siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
}

function buildSeo(conference, siteSettings, pageUrl) {
  const defaultSeo = siteSettings?.defaultSeo || {}
  const pageSeo = conference?.seo || {}
  const welcomeHtml = blocksToHtml(conference?.welcomeRemarks || [])
  const fallbackDescription = truncate(
    stripHtml(pageSeo.metaDescription || conference?.heroText?.subheadline || welcomeHtml || siteSettings?.siteDescription || ''),
    160,
  )

  const title = pageSeo.metaTitle || conference?.title || siteSettings?.siteTitle || 'Conference'
  const description = pageSeo.metaDescription || fallbackDescription
  const ogTitle = pageSeo.ogTitle || defaultSeo.ogTitle || title
  const ogDescription = pageSeo.ogDescription || defaultSeo.ogDescription || description
  const ogImage = pageSeo.ogImage?.url || defaultSeo.ogImage?.url || conference?.heroBanner?.url || ''
  const canonicalUrl = pageSeo.canonicalUrl || pageUrl
  const noIndex = Boolean(pageSeo.noIndex || defaultSeo.noIndex)
  const keywords = [...(defaultSeo.keywords || []), ...(pageSeo.keywords || [])]
    .filter(Boolean)
    .join(', ')

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    canonicalUrl,
    noIndex,
    keywords,
  }
}

function renderScriptTag(script) {
  const typeAttr =
    script.type && script.type !== 'text/javascript' ? ` type="${escapeHtml(script.type)}"` : ''
  const asyncAttr = script.isAsync ? ' async' : ''
  const deferAttr = script.isDefer ? ' defer' : ''

  if (script.src) {
    return `<script${typeAttr} src="${escapeHtml(script.src)}"${asyncAttr}${deferAttr}></script>`
  }

  return `<script${typeAttr}>${script.inlineCode || ''}</script>`
}

function renderAnalytics(measurementId) {
  if (!measurementId) return ''

  return `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(measurementId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${escapeHtml(measurementId)}');
    </script>
  `
}

function buildOrganizationSchema(siteSettings, baseUrl) {
  if (!siteSettings?.organizationName && !siteSettings?.siteTitle) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteSettings.organizationName || siteSettings.siteTitle,
    description: siteSettings.organizationDescription || siteSettings.siteDescription || undefined,
    url: baseUrl,
    logo: siteSettings.organizationLogo?.url || undefined,
    sameAs: siteSettings.sameAsUrls?.length ? siteSettings.sameAsUrls : undefined,
  }
}

function buildEventSchema(conference, pageUrl, siteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: conference.title,
    description:
      conference.seo?.metaDescription ||
      conference.heroText?.subheadline ||
      truncate(stripHtml(blocksToHtml(conference.welcomeRemarks || [])), 200),
    startDate: conference.dateRange?.startDate || undefined,
    endDate: conference.dateRange?.endDate || undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: conference.seo?.ogImage?.url || conference.heroBanner?.url || undefined,
    url: pageUrl,
    location: conference.venue?.name
      ? {
          '@type': 'Place',
          name: conference.venue.name,
          address: conference.venue.address
            ? {
                '@type': 'PostalAddress',
                streetAddress: conference.venue.address,
              }
            : undefined,
        }
      : undefined,
    organizer:
      siteSettings?.organizationName || siteSettings?.siteTitle
        ? {
            '@type': 'Organization',
            name: siteSettings.organizationName || siteSettings.siteTitle,
            url: siteSettings.siteUrl || undefined,
          }
        : undefined,
  }
}

function layout({title, meta, bodyClass = '', headExtra = '', bodyStart = '', content = '', bodyEnd = ''}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(meta.description || '')}" />
    <link rel="canonical" href="${escapeHtml(meta.canonicalUrl || '')}" />
    ${meta.noIndex ? '<meta name="robots" content="noindex,nofollow" />' : '<meta name="robots" content="index,follow,max-image-preview:large" />'}
    ${meta.keywords ? `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />` : ''}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(meta.ogTitle || title)}" />
    <meta property="og:description" content="${escapeHtml(meta.ogDescription || meta.description || '')}" />
    <meta property="og:url" content="${escapeHtml(meta.canonicalUrl || '')}" />
    ${meta.ogImage ? `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />` : ''}
    <meta name="twitter:card" content="${meta.ogImage ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${escapeHtml(meta.ogTitle || title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.ogDescription || meta.description || '')}" />
    ${meta.ogImage ? `<meta name="twitter:image" content="${escapeHtml(meta.ogImage)}" />` : ''}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${bodyClass.includes('conference-page') ? '../../styles.css' : './styles.css'}" />
    ${headExtra}
  </head>
  <body class="${bodyClass}">
    ${bodyStart}
    ${content}
    ${bodyEnd}
  </body>
</html>`
}

function renderCommitteeMember(member) {
  return `
    <article class="committee-member">
      <h4>${escapeHtml(member.name || 'Committee member')}</h4>
      ${member.role ? `<p>${escapeHtml(member.role)}</p>` : ''}
      ${member.organization ? `<p>${escapeHtml(member.organization)}</p>` : ''}
      ${member.bio ? `<p>${escapeHtml(member.bio)}</p>` : ''}
    </article>
  `
}

function renderSection(sectionLabel, title, description, ctaUrl, ctaLabel) {
  if (!title && !description && !ctaUrl) return ''

  return `
    <article class="card action-card">
      <p class="section-label">${escapeHtml(sectionLabel)}</p>
      <h3 class="card-title">${escapeHtml(title || sectionLabel)}</h3>
      ${description ? `<p>${escapeHtml(description)}</p>` : ''}
      ${ctaUrl ? `<a class="action-link" href="${escapeHtml(ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(ctaLabel || 'Open link')}</a>` : ''}
    </article>
  `
}

function renderConferencePage(conference, siteSettings, baseUrl) {
  const pageUrl = `${baseUrl}/conferences/${conference.slug}/`
  const seo = buildSeo(conference, siteSettings, pageUrl)
  const organizationSchema = buildOrganizationSchema(siteSettings, baseUrl)
  const eventSchema = buildEventSchema(conference, pageUrl, siteSettings)
  const headScripts = (siteSettings.headScripts || []).map(renderScriptTag).join('\n')
  const bodyStartScripts = (siteSettings.bodyStartScripts || []).map(renderScriptTag).join('\n')
  const bodyEndScripts = (siteSettings.bodyEndScripts || []).map(renderScriptTag).join('\n')
  const organizingCommittee = (conference.committee || []).filter((member) => member.isOrganizingCommittee)
  const scientificCommittee = (conference.committee || []).filter((member) => member.isScientificCommittee)

  return layout({
    title: seo.title,
    meta: seo,
    bodyClass: 'conference-page',
    headExtra: `
      ${renderAnalytics(siteSettings.googleAnalyticsMeasurementId)}
      ${organizationSchema ? `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>` : ''}
      <script type="application/ld+json">${JSON.stringify(eventSchema)}</script>
      ${headScripts}
    `,
    bodyStart: bodyStartScripts,
    bodyEnd: bodyEndScripts,
    content: `
      <div class="shell">
        <header class="site-header">
          <a class="brand" href="${baseUrl}/">${escapeHtml(siteSettings.siteTitle || 'MMG Conferences')}</a>
          <div class="header-copy">
            <p>${escapeHtml(siteSettings.siteDescription || 'Conference landing pages powered by Sanity')}</p>
          </div>
        </header>

        <main class="app-shell">
          <section class="hero">
            ${
              conference.heroBanner?.url
                ? `<img class="hero-image" src="${escapeHtml(conference.heroBanner.url)}" alt="${escapeHtml(conference.heroBanner.alt || conference.title || 'Conference hero image')}" />`
                : ''
            }
            <div class="hero-content">
              ${conference.heroText?.eyebrow ? `<p class="eyebrow">${escapeHtml(conference.heroText.eyebrow)}</p>` : ''}
              <h1>${escapeHtml(conference.heroText?.headline || conference.title || 'Conference')}</h1>
              ${conference.heroText?.subheadline ? `<p class="hero-subheadline">${escapeHtml(conference.heroText.subheadline)}</p>` : ''}
              <div class="hero-meta">
                ${formatDateRange(conference.dateRange) ? `<span class="hero-pill">${escapeHtml(formatDateRange(conference.dateRange))}</span>` : ''}
                ${conference.venue?.name ? `<span class="hero-pill">${escapeHtml(conference.venue.name)}</span>` : ''}
                ${conference.status ? `<span class="hero-pill">${escapeHtml(conference.status)}</span>` : ''}
              </div>
            </div>
          </section>

          <section class="content-grid">
            <div class="stack">
              ${
                conference.welcomeRemarks?.length
                  ? `
                    <article class="card">
                      <p class="section-label">Welcome</p>
                      <h2 class="section-title">A conference experience shaped around clear communication and real collaboration.</h2>
                      <div class="richtext">${blocksToHtml(conference.welcomeRemarks)}</div>
                    </article>
                  `
                  : ''
              }

              ${renderSection(
                'Program',
                conference.program?.title || 'Program',
                conference.program?.description || 'View the latest scientific agenda, sessions, and schedule details.',
                conference.program?.url,
                conference.program?.ctaLabel || 'View program',
              )}

              ${renderSection(
                'Speakers',
                conference.speakerSource?.title || 'Speakers',
                conference.speakerSource?.description || 'Discover the current speaker line-up and access the latest speaker information.',
                conference.speakerSource?.feedUrl,
                conference.speakerSource?.ctaLabel || 'View speakers',
              )}

              ${renderSection(
                'Register',
                conference.registration?.title || 'Register',
                conference.registration?.description || 'Secure your place and access registration details through the official external registration page.',
                conference.registration?.url,
                conference.registration?.ctaLabel || 'Register now',
              )}

              ${renderSection(
                'Venue',
                conference.venue?.title || conference.venue?.name || 'Venue',
                conference.venue?.description || conference.venue?.address || 'Venue details will be announced soon.',
                conference.venue?.mapUrl,
                conference.venue?.ctaLabel || 'View map',
              )}

              ${
                organizingCommittee.length || scientificCommittee.length
                  ? `
                    <article class="card">
                      <p class="section-label">Committee</p>
                      <h3 class="section-title">Leadership and scientific guidance</h3>
                      <div class="stack">
                        ${
                          organizingCommittee.length
                            ? `
                              <section>
                                <h4 class="committee-title">Organizing Committee</h4>
                                <div class="committee-grid">
                                  ${organizingCommittee.map(renderCommitteeMember).join('')}
                                </div>
                              </section>
                            `
                            : ''
                        }
                        ${
                          scientificCommittee.length
                            ? `
                              <section>
                                <h4 class="committee-title">Scientific Committee</h4>
                                <div class="committee-grid">
                                  ${scientificCommittee.map(renderCommitteeMember).join('')}
                                </div>
                              </section>
                            `
                            : ''
                        }
                      </div>
                    </article>
                  `
                  : ''
              }
            </div>

            <aside class="stack">
              <article class="card">
                <p class="section-label">Contact</p>
                <h3 class="card-title">${escapeHtml(conference.contact?.contactName || 'Conference contact')}</h3>
                ${conference.contact?.department ? `<p>${escapeHtml(conference.contact.department)}</p>` : ''}
                ${conference.contact?.email ? `<p>${escapeHtml(conference.contact.email)}</p>` : ''}
                ${conference.contact?.phone ? `<p>${escapeHtml(conference.contact.phone)}</p>` : ''}
                ${conference.contact?.notes ? `<p>${escapeHtml(conference.contact.notes)}</p>` : ''}
              </article>

              <article class="card speaker-banner">
                <p class="section-label">Speaker Source</p>
                <h3 class="card-title">External speaker source configured</h3>
                <p>
                  Provider: ${escapeHtml(conference.speakerSource?.provider || 'External provider')}
                  ${conference.speakerSource?.eventId ? `<br />Event ID: ${escapeHtml(conference.speakerSource.eventId)}` : ''}
                </p>
              </article>
            </aside>
          </section>
        </main>
      </div>
    `,
  })
}

function renderIndexPage(conferences, siteSettings, baseUrl) {
  const seo = buildSeo({}, siteSettings, `${baseUrl}/`)
  const organizationSchema = buildOrganizationSchema(siteSettings, baseUrl)
  const headScripts = (siteSettings.headScripts || []).map(renderScriptTag).join('\n')
  const bodyStartScripts = (siteSettings.bodyStartScripts || []).map(renderScriptTag).join('\n')
  const bodyEndScripts = (siteSettings.bodyEndScripts || []).map(renderScriptTag).join('\n')

  return layout({
    title: seo.title || siteSettings.siteTitle || 'MMG Conferences',
    meta: {
      ...seo,
      title: seo.title || siteSettings.siteTitle || 'MMG Conferences',
      description:
        seo.description ||
        siteSettings.siteDescription ||
        'Browse conference landing pages powered by Sanity.',
      canonicalUrl: `${baseUrl}/`,
    },
    headExtra: `
      ${renderAnalytics(siteSettings.googleAnalyticsMeasurementId)}
      ${organizationSchema ? `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>` : ''}
      ${headScripts}
    `,
    bodyStart: bodyStartScripts,
    bodyEnd: bodyEndScripts,
    content: `
      <div class="shell">
        <header class="site-header">
          <a class="brand" href="${baseUrl}/">${escapeHtml(siteSettings.siteTitle || 'MMG Conferences')}</a>
          <div class="header-copy">
            <p>${escapeHtml(siteSettings.siteDescription || 'Conference landing pages powered by Sanity')}</p>
          </div>
        </header>

        <main class="app-shell">
          <section class="card">
            <p class="section-label">Conference Directory</p>
            <h1 class="page-list-title">Explore conference landing pages</h1>
            <p>${escapeHtml(siteSettings.siteDescription || 'Select a conference below to open its public landing page.')}</p>
            <div class="conference-grid">
              ${conferences
                .map(
                  (conference) => `
                    <article class="conference-card">
                      <h3>${escapeHtml(conference.title || 'Untitled conference')}</h3>
                      <p>${escapeHtml(formatDateRange(conference.dateRange) || 'Date coming soon')}</p>
                      <a href="${baseUrl}/conferences/${escapeHtml(conference.slug)}/">Open landing page</a>
                    </article>
                  `,
                )
                .join('')}
            </div>
          </section>
        </main>
      </div>
    `,
  })
}

async function emptyDir(targetDir) {
  await mkdir(targetDir, {recursive: true})
  const entries = await readdir(targetDir, {withFileTypes: true})
  await Promise.all(
    entries
      .filter((entry) => entry.name !== 'styles.css')
      .map((entry) => rm(path.join(targetDir, entry.name), {recursive: true, force: true})),
  )
}

async function writeStaticAssets() {
  const styles = await readFile(publicStylesPath, 'utf8')
  await writeFile(path.join(docsDir, 'styles.css'), styles)
}

async function generate() {
  const [siteSettingsRaw, conferencesRaw] = await Promise.all([
    fetchQuery(`*[_type == "siteSettings"][0]{
      title,
      siteTitle,
      siteDescription,
      siteUrl,
      organizationName,
      organizationDescription,
      "organizationLogo": {
        "url": organizationLogo.asset->url
      },
      sameAsUrls,
      googleAnalyticsMeasurementId,
      headScripts,
      bodyStartScripts,
      bodyEndScripts,
      "defaultSeo": {
        "metaTitle": defaultSeo.metaTitle,
        "metaDescription": defaultSeo.metaDescription,
        "ogTitle": defaultSeo.ogTitle,
        "ogDescription": defaultSeo.ogDescription,
        "noIndex": defaultSeo.noIndex,
        "keywords": defaultSeo.keywords,
        "canonicalUrl": defaultSeo.canonicalUrl,
        "ogImage": {
          "url": defaultSeo.ogImage.asset->url
        }
      }
    }`),
    fetchQuery(`*[_type == "conference"] | order(dateRange.startDate asc){
      title,
      "slug": slug.current,
      status,
      dateRange,
      heroText,
      welcomeRemarks,
      program,
      registration,
      venue,
      contact,
      speakerSource,
      "seo": {
        "metaTitle": seo.metaTitle,
        "metaDescription": seo.metaDescription,
        "ogTitle": seo.ogTitle,
        "ogDescription": seo.ogDescription,
        "canonicalUrl": seo.canonicalUrl,
        "noIndex": seo.noIndex,
        "keywords": seo.keywords,
        "ogImage": {
          "url": seo.ogImage.asset->url
        }
      },
      "heroBanner": {
        "url": heroBanner.asset->url,
        "alt": heroBanner.alt
      },
      "committee": committee[]->{
        _id,
        name,
        role,
        organization,
        bio,
        isOrganizingCommittee,
        isScientificCommittee
      }
    }`),
  ])

  const siteSettings = siteSettingsRaw || {
    siteTitle: 'MMG Conferences',
    siteDescription: 'Conference landing pages powered by Sanity',
    siteUrl: DEFAULT_BASE_URL,
    defaultSeo: {},
    headScripts: [],
    bodyStartScripts: [],
    bodyEndScripts: [],
  }

  const conferences = (conferencesRaw || []).filter((conference) => conference.slug)
  const baseUrl = normalizeBaseUrl(siteSettings.siteUrl)

  await emptyDir(docsDir)
  await writeStaticAssets()

  await writeFile(path.join(docsDir, 'index.html'), renderIndexPage(conferences, siteSettings, baseUrl))

  const conferenceDir = path.join(docsDir, 'conferences')
  await mkdir(conferenceDir, {recursive: true})

  for (const conference of conferences) {
    const conferencePath = path.join(conferenceDir, conference.slug)
    await mkdir(conferencePath, {recursive: true})
    await writeFile(
      path.join(conferencePath, 'index.html'),
      renderConferencePage(conference, siteSettings, baseUrl),
    )
  }

  const sitemapEntries = [
    `${baseUrl}/`,
    ...conferences.map((conference) => `${baseUrl}/conferences/${conference.slug}/`),
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}
</urlset>`
  await writeFile(path.join(docsDir, 'sitemap.xml'), sitemapXml)
  await writeFile(
    path.join(docsDir, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`,
  )

  const hostname = new URL(baseUrl).hostname
  if (!hostname.endsWith('github.io')) {
    await writeFile(path.join(docsDir, 'CNAME'), `${hostname}\n`)
  }
}

generate().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
