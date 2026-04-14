import {defineField, defineType} from 'sanity'

export const committeeMemberType = defineType({
  name: 'committeeMember',
  title: 'Committee Member',
  type: 'document',
  fields: [
    defineField({
      name: 'conference',
      title: 'Conference',
      description: 'Optional back-reference for imports and filtering.',
      type: 'reference',
      to: [{type: 'conference'}],
    }),
    defineField({
      name: 'externalContactId',
      title: 'EventsAir Contact ID',
      description: 'Store the external contact identifier for sync or reconciliation.',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'organization',
      title: 'Organization',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'primaryEmail',
      title: 'Primary Email',
      type: 'string',
      validation: (rule) => rule.email().warning('This should be a valid email address.'),
    }),
    defineField({
      name: 'isOrganizingCommittee',
      title: 'Is Organizing Committee',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isScientificCommittee',
      title: 'Is Scientific Committee',
      type: 'boolean',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {isOrganizingCommittee?: boolean} | undefined
          if (value || parent?.isOrganizingCommittee) return true
          return 'Select at least one committee type.'
        }),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (rule) => rule.max(160),
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
      isOrganizingCommittee: 'isOrganizingCommittee',
      isScientificCommittee: 'isScientificCommittee',
    },
    prepare({title, subtitle, media, isOrganizingCommittee, isScientificCommittee}) {
      const tags = [
        isOrganizingCommittee ? 'Organizing' : null,
        isScientificCommittee ? 'Scientific' : null,
      ].filter(Boolean)

      return {
        title,
        subtitle: [subtitle, tags.join(', ')].filter(Boolean).join(' • '),
        media,
      }
    },
  },
})
