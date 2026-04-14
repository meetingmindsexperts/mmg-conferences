import {defineField, defineType} from 'sanity'

export const customScriptType = defineType({
  name: 'customScript',
  title: 'Custom Script',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'src',
      title: 'External Script URL',
      type: 'url',
      validation: (rule) => rule.uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'inlineCode',
      title: 'Inline Script',
      description: 'Paste raw JavaScript or structured data script content.',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'type',
      title: 'Script Type',
      type: 'string',
      initialValue: 'text/javascript',
      options: {
        list: [
          {title: 'JavaScript', value: 'text/javascript'},
          {title: 'Module', value: 'module'},
          {title: 'JSON-LD', value: 'application/ld+json'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isAsync',
      title: 'Async',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isDefer',
      title: 'Defer',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      if (!value || typeof value !== 'object') return true
      const script = value as {src?: string; inlineCode?: string}
      return script.src || script.inlineCode ? true : 'Provide either a script URL or inline script content.'
    }),
  preview: {
    select: {
      title: 'title',
      subtitle: 'src',
      type: 'type',
    },
    prepare({title, subtitle, type}) {
      return {
        title,
        subtitle: [type, subtitle].filter(Boolean).join(' • '),
      }
    },
  },
})
