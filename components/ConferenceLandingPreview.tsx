import {useEffect, useMemo, useState} from 'react'
import {Box, Card, Flex, Grid, Heading, Stack, Text} from '@sanity/ui'
import {useClient} from 'sanity'
import type {SanityDocument} from 'sanity'

type PortableTextBlock = {
  _type: 'block'
  children?: Array<{
    _type: 'span'
    text?: string
  }>
}

type CommitteeMember = {
  _id: string
  name?: string
  role?: string
  organization?: string
  primaryEmail?: string
  bio?: string
  isOrganizingCommittee?: boolean
  isScientificCommittee?: boolean
  photo?: {
    asset?: {
      _ref?: string
    }
    alt?: string
  }
}

type ConferencePreviewDocument = Partial<SanityDocument> & {
  title?: string
  heroBanner?: {
    asset?: {
      _ref?: string
    }
    alt?: string
  }
  heroText?: {
    eyebrow?: string
    headline?: string
    subheadline?: string
  }
  welcomeRemarks?: PortableTextBlock[]
  committee?: Array<{
    _key?: string
    _ref?: string
  }>
  program?: {
    title?: string
    description?: string
    url?: string
    ctaLabel?: string
  }
  registration?: {
    title?: string
    description?: string
    url?: string
    ctaLabel?: string
  }
  venue?: {
    title?: string
    description?: string
    name?: string
    address?: string
    mapUrl?: string
    ctaLabel?: string
  }
  contact?: {
    contactName?: string
    email?: string
    phone?: string
    department?: string
    notes?: string
  }
  speakerSource?: {
    title?: string
    description?: string
    provider?: string
    feedUrl?: string
    eventId?: string
    ctaLabel?: string
  }
}

function blocksToText(blocks?: PortableTextBlock[]) {
  if (!blocks?.length) return ''
  return blocks
    .map((block) => block.children?.map((child) => child.text || '').join('') || '')
    .filter(Boolean)
    .join('\n\n')
}

function assetRefToUrl(assetRef: string | undefined, projectId: string, dataset: string) {
  if (!assetRef) return undefined
  const match = /^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-z0-9]+)$/.exec(assetRef)
  if (!match) return undefined

  const [, assetId, dimensions, extension] = match
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${extension}`
}

function SectionCard({
  sectionLabel,
  title,
  description,
  ctaUrl,
  ctaLabel,
}: {
  sectionLabel: string
  title?: string
  description?: string
  ctaUrl?: string
  ctaLabel?: string
}) {
  if (!title && !description && !ctaUrl) return null

  return (
    <Card padding={4} radius={4} border style={{background: '#fffdf6', borderColor: '#d9c8a9'}}>
      <Stack space={3}>
        <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
          {sectionLabel}
        </Text>
        {title ? (
          <Heading size={2} style={{fontSize: '2rem', lineHeight: 1}}>
            {title}
          </Heading>
        ) : null}
        {description ? <Text size={2}>{description}</Text> : null}
        {ctaUrl ? (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noreferrer"
            style={{color: '#0d5c63', fontWeight: 700, textDecoration: 'none'}}
          >
            {ctaLabel || 'Open link'}
          </a>
        ) : null}
      </Stack>
    </Card>
  )
}

export function ConferenceLandingPreview(props: {
  document: {
    displayed: ConferencePreviewDocument
  }
}) {
  const client = useClient({apiVersion: '2025-02-07'})
  const displayed = props.document.displayed
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([])

  const committeeIds = useMemo(
    () => displayed.committee?.map((member) => member?._ref).filter(Boolean) as string[] | undefined,
    [displayed.committee],
  )

  useEffect(() => {
    let cancelled = false

    async function loadCommitteeMembers() {
      if (!committeeIds?.length) {
        setCommitteeMembers([])
        return
      }

      const members = await client.fetch<CommitteeMember[]>(
        `*[_type == "committeeMember" && _id in $ids]{
          _id,
          name,
          role,
          organization,
          primaryEmail,
          bio,
          isOrganizingCommittee,
          isScientificCommittee,
          photo
        }`,
        {ids: committeeIds},
      )

      if (cancelled) return

      const orderedMembers = committeeIds
        .map((id) => members.find((member) => member._id === id))
        .filter(Boolean) as CommitteeMember[]

      setCommitteeMembers(orderedMembers)
    }

    loadCommitteeMembers().catch(() => {
      if (!cancelled) setCommitteeMembers([])
    })

    return () => {
      cancelled = true
    }
  }, [client, committeeIds])

  const organizingCommittee = committeeMembers.filter((member) => member.isOrganizingCommittee)
  const scientificCommittee = committeeMembers.filter((member) => member.isScientificCommittee)
  const projectId = client.config().projectId || ''
  const dataset = client.config().dataset || ''
  const heroImageUrl = assetRefToUrl(displayed.heroBanner?.asset?._ref, projectId, dataset)
  const heroTitle = displayed.heroText?.headline || displayed.title || 'Conference landing page preview'
  const welcomeText = blocksToText(displayed.welcomeRemarks)

  return (
    <Box
      padding={4}
      style={{
        background:
          'linear-gradient(180deg, #f3eee2 0%, #efe6d3 35%, #f9f7f2 100%)',
        minHeight: '100%',
      }}
    >
      <Card radius={5} shadow={2} style={{overflow: 'hidden', background: '#fffdf9'}}>
        <Box
          padding={5}
          style={{
            minHeight: 380,
            color: '#ffffff',
            backgroundImage: heroImageUrl
              ? `linear-gradient(120deg, rgba(8, 32, 50, 0.82), rgba(13, 92, 99, 0.55)), url(${heroImageUrl})`
              : 'linear-gradient(120deg, #143642, #0f8b8d)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <Stack space={3} style={{maxWidth: 760}}>
            {displayed.heroText?.eyebrow ? (
              <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.14em'}}>
                {displayed.heroText.eyebrow}
              </Text>
            ) : null}
            <Heading size={4} style={{fontSize: '3rem', lineHeight: 1}}>
              {heroTitle}
            </Heading>
            {displayed.heroText?.subheadline ? (
              <Text size={3} style={{maxWidth: 640, color: 'rgba(255,255,255,0.92)'}}>
                {displayed.heroText.subheadline}
              </Text>
            ) : null}
          </Stack>
        </Box>

        <Box padding={5}>
          <Stack space={5}>
            {welcomeText ? (
              <Card padding={4} radius={4} tone="transparent" style={{background: '#f7f1e3'}}>
                <Stack space={3}>
                  <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                    Welcome Remarks
                  </Text>
                  <Text size={2} style={{whiteSpace: 'pre-wrap', lineHeight: 1.7}}>
                    {welcomeText}
                  </Text>
                </Stack>
              </Card>
            ) : null}

            <SectionCard
              sectionLabel="Program"
              title={displayed.program?.title || 'Program'}
              description={displayed.program?.description}
              ctaUrl={displayed.program?.url}
              ctaLabel={displayed.program?.ctaLabel}
            />

            <SectionCard
              sectionLabel="Speakers"
              title={displayed.speakerSource?.title || 'Speakers'}
              description={displayed.speakerSource?.description}
              ctaUrl={displayed.speakerSource?.feedUrl}
              ctaLabel={displayed.speakerSource?.ctaLabel}
            />

            <SectionCard
              sectionLabel="Register"
              title={displayed.registration?.title || 'Register'}
              description={displayed.registration?.description}
              ctaUrl={displayed.registration?.url}
              ctaLabel={displayed.registration?.ctaLabel}
            />

            <SectionCard
              sectionLabel="Venue"
              title={displayed.venue?.title || displayed.venue?.name || 'Venue'}
              description={
                displayed.venue?.description ||
                displayed.venue?.address ||
                'Add venue details to show them here.'
              }
              ctaUrl={displayed.venue?.mapUrl}
              ctaLabel={displayed.venue?.ctaLabel}
            />

            {(organizingCommittee.length > 0 || scientificCommittee.length > 0) && (
              <Stack space={4}>
                <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                  Committee
                </Text>

                {organizingCommittee.length > 0 ? (
                  <Stack space={3}>
                    <Heading size={2}>Organizing Committee</Heading>
                    <Grid columns={[1, 1, 2]} gap={3}>
                      {organizingCommittee.map((member) => (
                        <Card
                          key={member._id}
                          padding={4}
                          radius={4}
                          border
                          style={{background: '#ffffff', borderColor: '#e5ddd1'}}
                        >
                          <Stack space={2}>
                            <Text size={2} weight="semibold">
                              {member.name || 'Unnamed member'}
                            </Text>
                            {member.role ? <Text size={1}>{member.role}</Text> : null}
                            {member.organization ? (
                              <Text size={1} muted>
                                {member.organization}
                              </Text>
                            ) : null}
                            {member.bio ? <Text size={1}>{member.bio}</Text> : null}
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>
                ) : null}

                {scientificCommittee.length > 0 ? (
                  <Stack space={3}>
                    <Heading size={2}>Scientific Committee</Heading>
                    <Grid columns={[1, 1, 2]} gap={3}>
                      {scientificCommittee.map((member) => (
                        <Card
                          key={member._id}
                          padding={4}
                          radius={4}
                          border
                          style={{background: '#ffffff', borderColor: '#e5ddd1'}}
                        >
                          <Stack space={2}>
                            <Text size={2} weight="semibold">
                              {member.name || 'Unnamed member'}
                            </Text>
                            {member.role ? <Text size={1}>{member.role}</Text> : null}
                            {member.organization ? (
                              <Text size={1} muted>
                                {member.organization}
                              </Text>
                            ) : null}
                            {member.bio ? <Text size={1}>{member.bio}</Text> : null}
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>
                ) : null}
              </Stack>
            )}

            <Grid columns={[1, 1, 2]} gap={4}>
              <Card padding={4} radius={4} border style={{background: '#fffdf6', borderColor: '#d9c8a9'}}>
                <Stack space={3}>
                  <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                    Venue
                  </Text>
                  <Text size={2} weight="semibold">
                    {displayed.venue?.name || 'Venue name'}
                  </Text>
                  <Text size={1}>{displayed.venue?.address || 'Add venue details to show them here.'}</Text>
                  {displayed.venue?.mapUrl ? (
                    <a
                      href={displayed.venue.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{color: '#0d5c63', fontWeight: 700, textDecoration: 'none'}}
                    >
                      {displayed.venue?.ctaLabel || 'View map'}
                    </a>
                  ) : null}
                </Stack>
              </Card>
            </Grid>

            <Card padding={4} radius={4} border style={{background: '#fffdf6', borderColor: '#d9c8a9'}}>
              <Stack space={3}>
                <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                  Contact
                </Text>
                {displayed.contact?.contactName ? (
                  <Text size={2} weight="semibold">
                    {displayed.contact.contactName}
                  </Text>
                ) : null}
                <Stack space={2}>
                  {displayed.contact?.department ? <Text size={1}>{displayed.contact.department}</Text> : null}
                  {displayed.contact?.email ? <Text size={1}>{displayed.contact.email}</Text> : null}
                  {displayed.contact?.phone ? <Text size={1}>{displayed.contact.phone}</Text> : null}
                  {displayed.contact?.notes ? <Text size={1}>{displayed.contact.notes}</Text> : null}
                </Stack>
              </Stack>
            </Card>

            <Card padding={4} radius={4} border style={{background: '#10363f', color: '#f4efe6'}}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                <Stack space={2}>
                  <Text size={1} weight="semibold" style={{textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                    Speaker Source Details
                  </Text>
                  <Text size={1}>
                    {displayed.speakerSource?.provider || 'No provider selected'}
                    {displayed.speakerSource?.eventId ? ` • Event ID: ${displayed.speakerSource.eventId}` : ''}
                  </Text>
                </Stack>
              </Flex>
            </Card>
          </Stack>
        </Box>
      </Card>
    </Box>
  )
}
