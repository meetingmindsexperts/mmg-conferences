import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Settings Label',
      type: 'string',
      initialValue: 'Global Site Settings',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'siteUrl',
      title: 'Primary Site URL',
      description: 'Use the final public URL. If you later move to a custom domain, update it here.',
      type: 'url',
      validation: (rule) => rule.required().uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'organizationName',
      title: 'Organization Name',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'organizationDescription',
      title: 'Organization Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'organizationLogo',
      title: 'Organization Logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'sameAsUrls',
      title: 'Organization Social/Profile URLs',
      type: 'array',
      of: [defineArrayMember({type: 'url'})],
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seoSettings',
    }),
    defineField({
      name: 'googleAnalyticsMeasurementId',
      title: 'Google Analytics Measurement ID',
      description: 'Example: G-XXXXXXXXXX',
      type: 'string',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'headScripts',
      title: 'Head Scripts',
      type: 'array',
      of: [defineArrayMember({type: 'customScript'})],
    }),
    defineField({
      name: 'bodyStartScripts',
      title: 'Body Start Scripts',
      type: 'array',
      of: [defineArrayMember({type: 'customScript'})],
    }),
    defineField({
      name: 'bodyEndScripts',
      title: 'Body End Scripts',
      type: 'array',
      of: [defineArrayMember({type: 'customScript'})],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'siteUrl',
    },
  },
})
