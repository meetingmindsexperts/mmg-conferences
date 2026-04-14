# Conference Content Model

This studio is now set up to manage multiple conferences through a `conference` document type.

## Core sections

- Hero banner image with hotspot support and required alt text
- Hero text overlay with eyebrow, headline, and subheadline
- Welcome remarks as rich text blocks
- Committee section using ordered references to committee member documents
- Program section with an external URL and CTA label
- Registration section with an external URL and CTA label
- Venue section with address and optional map URL
- Contact section with email, phone, department, and notes

## External data integration

The `externalDataSource` object is designed for content coming from EventsAir or a similar provider.

Included fields:

- Provider name
- Feed or API URL
- Provider event ID
- Data type such as speakers or committee contacts
- Integration notes for auth, mapping, or fallback logic

Recommended implementation pattern:

1. Store the external source details in Sanity for each conference.
2. Fetch speakers and committee contacts in your frontend or middleware layer using the configured feed URL.
3. Normalize the provider response into your site UI model.
4. Use `syncNotes` to document any headers, tokens, or transformation logic required.

Each conference now has:

- `speakerSource` for speakers
- `committeeSource` for committee contacts

## Committee member model

Committee members are stored as their own documents so they can support imported EventsAir contact data plus local editorial flags.

Included fields:

- Conference reference
- EventsAir contact ID
- Name, role, organization, primary email, photo, and bio
- `isOrganizingCommittee`
- `isScientificCommittee`

This lets your import process create or update committee members from EventsAir, while editors in Sanity can still control whether a person appears under organizing committee, scientific committee, or both.

## Suggested next step

Build the frontend around the `conference` document and query Sanity by `slug.current` so each conference can render its own landing page with shared structure.
