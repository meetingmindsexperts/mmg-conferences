import {defineField, defineType} from 'sanity'

export const venueDetailsType = defineType({
  name: 'venueDetails',
  title: 'Venue Details',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'Venue',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'description',
      title: 'Section Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(280),
    }),
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
      name: 'mapUrl',
      title: 'Map URL',
      type: 'url',
      validation: (rule) => rule.uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      initialValue: 'View map',
      validation: (rule) => rule.max(40),
    }),
  ],
})
