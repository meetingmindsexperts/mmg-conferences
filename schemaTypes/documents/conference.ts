import {defineArrayMember, defineField, defineType} from 'sanity'

export const conferenceType = defineType({
  name: 'conference',
  title: 'Conference',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'content', title: 'Content'},
    {name: 'links', title: 'External Links'},
    {name: 'logistics', title: 'Logistics'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Conference Title',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'overview',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortCode',
      title: 'Conference Short Code',
      description: 'Useful for internal identifiers such as MMG-DXB-2026.',
      type: 'string',
      group: 'overview',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'overview',
      initialValue: 'draft',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'Registration Open', value: 'registrationOpen'},
          {title: 'Completed', value: 'completed'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dateRange',
      title: 'Conference Dates',
      type: 'object',
      group: 'overview',
      fields: [
        defineField({
          name: 'startDate',
          title: 'Start Date',
          type: 'datetime',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'endDate',
          title: 'End Date',
          type: 'datetime',
          validation: (rule) =>
            rule.required().custom((endDate, context) => {
              const parent = context.parent as {startDate?: string} | undefined
              const startDate = parent?.startDate || ''

              if (!endDate || !startDate) return true
              return endDate >= startDate ? true : 'End date must be after the start date.'
            }),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroBanner',
      title: 'Hero Banner',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (rule) => rule.required().max(160),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroText',
      title: 'Hero Text Overlay',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow Text',
          type: 'string',
          validation: (rule) => rule.max(80),
        }),
        defineField({
          name: 'headline',
          title: 'Headline',
          type: 'string',
          validation: (rule) => rule.required().max(140),
        }),
        defineField({
          name: 'subheadline',
          title: 'Subheadline',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.max(280),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'welcomeRemarks',
      title: 'Welcome Remarks',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'committee',
      title: 'Committee',
      type: 'array',
      group: 'content',
      description: 'Ordered committee members linked to this conference.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'committeeMember'}],
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'program',
      title: 'Program Section',
      type: 'externalLinkSection',
      group: 'links',
      initialValue: {
        title: 'Program',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'speakerSource',
      title: 'Speaker Feed',
      type: 'externalDataSource',
      group: 'links',
      initialValue: {
        provider: 'eventsAir',
        entityType: 'speakers',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'committeeSource',
      title: 'Committee Feed',
      description: 'Use this when committee contacts are fetched from EventsAir or another platform.',
      type: 'externalDataSource',
      group: 'links',
      initialValue: {
        provider: 'eventsAir',
        entityType: 'committeeContacts',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'registration',
      title: 'Registration Section',
      type: 'externalLinkSection',
      group: 'links',
      initialValue: {
        title: 'Register',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venue',
      title: 'Venue',
      type: 'venueDetails',
      group: 'logistics',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contact',
      title: 'Contact Section',
      type: 'contactDetails',
      group: 'logistics',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'heroBanner',
      status: 'status',
      startDate: 'dateRange.startDate',
    },
    prepare({title, media, status, startDate}) {
      const dateLabel = startDate ? new Date(startDate).toLocaleDateString() : 'No date'
      return {
        title,
        media,
        subtitle: [status, dateLabel].filter(Boolean).join(' • '),
      }
    },
  },
})
