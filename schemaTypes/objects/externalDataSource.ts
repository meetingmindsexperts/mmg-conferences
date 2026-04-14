import {defineField, defineType} from 'sanity'

export const externalDataSourceType = defineType({
  name: 'externalDataSource',
  title: 'External Data Source',
  type: 'object',
  fields: [
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      initialValue: 'eventsAir',
      options: {
        list: [
          {title: 'EventsAir', value: 'eventsAir'},
          {title: 'Cvent', value: 'cvent'},
          {title: 'Sessionize', value: 'sessionize'},
          {title: 'Other', value: 'other'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'feedUrl',
      title: 'Feed or API URL',
      description: 'The external endpoint your frontend or integration service will use to fetch data.',
      type: 'url',
      validation: (rule) => rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'eventId',
      title: 'Provider Event ID',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'entityType',
      title: 'Data Type',
      type: 'string',
      options: {
        list: [
          {title: 'Speakers', value: 'speakers'},
          {title: 'Committee Contacts', value: 'committeeContacts'},
          {title: 'Custom', value: 'custom'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'syncNotes',
      title: 'Integration Notes',
      description: 'Document auth requirements, transform rules, mapping, or fallback handling.',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(500),
    }),
  ],
  preview: {
    select: {
      provider: 'provider',
      entityType: 'entityType',
      subtitle: 'feedUrl',
    },
    prepare({provider, entityType, subtitle}) {
      const title = [provider, entityType].filter(Boolean).join(' • ') || 'External source'
      return {
        title,
        subtitle,
      }
    },
  },
})
