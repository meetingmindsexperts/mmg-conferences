import {defineField, defineType} from 'sanity'

export const venueDetailsType = defineType({
  name: 'venueDetails',
  title: 'Venue Details',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Venue Name',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(250),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'mapUrl',
      title: 'Map URL',
      type: 'url',
      validation: (rule) => rule.uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
  ],
})
