import {defineField, defineType} from 'sanity'

export const contactDetailsType = defineType({
  name: 'contactDetails',
  title: 'Contact Details',
  type: 'object',
  fields: [
    defineField({
      name: 'contactName',
      title: 'Primary Contact Name',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) =>
        rule.required().email().error('Please provide a valid contact email address.'),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'department',
      title: 'Department or Team',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'notes',
      title: 'Contact Notes',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(280),
    }),
  ],
})
