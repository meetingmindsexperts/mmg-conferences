import {defineField, defineType} from 'sanity'

export const externalLinkSectionType = defineType({
  name: 'externalLinkSection',
  title: 'External Link Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Section Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: 'url',
      title: 'External URL',
      type: 'url',
      validation: (rule) => rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      initialValue: 'Open link',
      validation: (rule) => rule.required().max(40),
    }),
  ],
})
