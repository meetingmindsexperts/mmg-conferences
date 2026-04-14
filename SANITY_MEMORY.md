# Memory

This file is the local source of truth for Sanity-related context in this repository.

When making future Sanity changes in this project, check this file first.

## Project

- Repository: `mmg-conferences`
- Local path: `/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences`
- Sanity project ID: `cfy1tt5s`
- Dataset: `production`
- Studio title: `MMG Conferences`
- Main branch: `main`
- Remote: `https://github.com/meetingmindsexperts/mmg-conferences.git`

## Sanity config

- Studio config file: [`sanity.config.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/sanity.config.ts:1)
- CLI config file: [`sanity.cli.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/sanity.cli.ts:1)
- Schema registry: [`schemaTypes/index.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/index.ts:1)

Current plugin setup:

- `structureTool({defaultDocumentNode})`
- `visionTool()`

Important deployment note:

- `sanity.cli.ts` currently has `autoUpdates: true`
- There is currently no `appId` configured in `sanity.cli.ts`
- That means local schema changes do not automatically appear in a hosted Sanity Studio until the Studio is deployed

## Content model

Primary content model:

- `conference` document

Supporting schema files:

- [`schemaTypes/documents/conference.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/documents/conference.ts:1)
- [`schemaTypes/documents/siteSettings.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/documents/siteSettings.ts:1)
- [`schemaTypes/objects/committeeMember.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/committeeMember.ts:1)
- [`schemaTypes/objects/contactDetails.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/contactDetails.ts:1)
- [`schemaTypes/objects/customScript.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/customScript.ts:1)
- [`schemaTypes/objects/externalDataSource.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/externalDataSource.ts:1)
- [`schemaTypes/objects/externalLinkSection.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/externalLinkSection.ts:1)
- [`schemaTypes/objects/seoSettings.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/seoSettings.ts:1)
- [`schemaTypes/objects/venueDetails.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/schemaTypes/objects/venueDetails.ts:1)

Reference doc:

- [`CONFERENCE_CONTENT_MODEL.md`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/CONFERENCE_CONTENT_MODEL.md:1)
- [`deskStructure.ts`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/deskStructure.ts:1)
- [`components/ConferenceLandingPreview.tsx`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/components/ConferenceLandingPreview.tsx:1)
- [`PUBLIC_SITE.md`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/PUBLIC_SITE.md:1)

## Conference model requirements captured so far

Each conference should support:

- Hero banner image
- Hero text overlay
- Welcome remarks
- Committee section
- Program section with external URL
- Speaker feed from EventsAir or similar platform
- Registration section with external URL
- Venue section
- Contact section

## Current schema behavior

### Conference

The `conference` document currently contains:

- Title
- Slug
- Short code
- Status
- Date range
- Hero banner image with alt text
- Hero overlay text
- Welcome remarks
- Ordered committee references
- Program external link section
- Speaker external data source
- Committee external data source
- Registration external link section
- Venue details
- Contact details
- SEO settings

### Site settings

`siteSettings` is now the global source for public site behavior.

It supports:

- Site title and description
- Primary site URL or custom domain
- Organization details
- Default SEO metadata
- Google Analytics measurement ID
- Custom scripts for head, body start, and body end

### SEO and AEO

SEO is now modeled both globally and per conference.

Per conference:

- Meta title
- Meta description
- OG title
- OG description
- OG image
- Canonical URL override
- Noindex flag
- Keywords

Static public site generation now outputs:

- Canonical tags
- Open Graph tags
- Twitter card tags
- JSON-LD structured data for Organization and Event
- `sitemap.xml`
- `robots.txt`
- `CNAME` when a custom domain is configured

### Committee members

`committeeMember` is currently a document, not an inline object.

It supports:

- Conference reference
- External contact ID for EventsAir reconciliation
- Name
- Role
- Organization
- Primary email
- Photo
- Bio
- `isOrganizingCommittee`
- `isScientificCommittee`

Rule:

- At least one of `isOrganizingCommittee` or `isScientificCommittee` should be selected

### External data source

`externalDataSource` is the shared object used for imported data such as speakers and committee contacts.

It currently stores:

- Provider
- Feed or API URL
- Provider event ID
- Entity type
- Sync notes

Known intended providers:

- EventsAir
- Cvent
- Sessionize
- Other

Known entity types:

- `speakers`
- `committeeContacts`
- `custom`

## EventsAir context

The user shared an EventsAir implementation pattern from another system.

Important details from that pattern:

- EventsAir uses OAuth 2.0 client credentials
- Token endpoint:
  `https://login.microsoftonline.com/dff76352-1ded-46e8-96a4-1a83718b2d3a/oauth2/v2.0/token`
- Scope:
  `https://eventsairprod.onmicrosoft.com/85d8f626-4e3d-4357-89c6-327d4e6d3d93/.default`
- GraphQL endpoint:
  `https://api.eventsair.com/graphql`

Relevant external entities discussed:

- Events
- Contacts
- Speakers
- Committee contacts

Important product decision:

- Committee data also comes from EventsAir
- In Sanity, committee members still need editorial toggles for:
  - Organizing committee
  - Scientific committee

## Verification notes

Checks completed so far:

- `npx tsc --noEmit` passed after schema changes

Known environment issues seen in this workspace:

- `sanity build` attempted remote fetches to `sanity-cdn.com` and failed in the sandbox because network/DNS was unavailable
- `sanity dev` initially hit `EMFILE: too many open files, watch`
- Increasing file limits with `ulimit -n 65536` helped startup progress
- A later run reported port `3333` already in use, indicating a dev server process was likely already running

## Local studio workflow

Preferred local command:

```bash
ulimit -n 65536
npx sanity dev --host localhost --port 3333
```

If needed, try:

```bash
npx sanity dev --host 0.0.0.0 --port 3333
```

Expected local URL:

- `http://localhost:3333`

Landing page preview workflow:

- Open a `conference` document in Studio
- Use the `Landing Page` tab next to the content editor tab
- The preview renders the hero, welcome remarks, committee, links, venue, contact, and speaker source summary
- Committee members are fetched from referenced `committeeMember` documents for preview rendering

## Public site workflow

Public frontend files:

- [`docs/index.html`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/docs/index.html:1)
- [`docs/styles.css`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/docs/styles.css:1)
- [`scripts/build-public-site.mjs`](/Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences/scripts/build-public-site.mjs:1)

Behavior:

- `npm run build:public-site` generates static HTML under `docs/`
- `docs/index.html` becomes the conference directory
- `docs/conferences/<slug>/index.html` becomes each public conference landing page
- The build queries Sanity project `cfy1tt5s` dataset `production`
- Set `SANITY_READ_TOKEN` if the dataset is private

## Hosted Studio deployment

Current state:

- Hosted deploy is not fully configured yet
- `appId` has not been written into `sanity.cli.ts`
- The deploy flow likely requires an authenticated interactive Sanity CLI session

Recommended deploy steps on the user machine:

```bash
npx sanity login
npx sanity deploy
```

After deploy is completed successfully:

- The CLI may write deployment metadata back into `sanity.cli.ts`
- Hosted Studio should then reflect the latest schema after deploy

## Git history relevant to this setup

Important commit:

- `49dde96` — `Add conference content model schemas`

## Working agreement for this repo

For future Sanity-related tasks in this repository:

- Read `MEMORY.md` first
- Treat this file as the quick context handoff
- Update this file when important Sanity architecture, deployment, or schema decisions change
