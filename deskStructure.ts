import type {DefaultDocumentNodeResolver, StructureResolver} from 'sanity/structure'

import {ConferenceLandingPreview} from './components/ConferenceLandingPreview'

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, context) => {
  if (context.schemaType === 'conference') {
    return S.document().views([
      S.view.form().id('editor').title('Content'),
      S.view.component(ConferenceLandingPreview).id('landing-page').title('Landing Page'),
    ])
  }

  return S.document()
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .child(S.editor().id('siteSettings').schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('conference').title('Conferences'),
      S.documentTypeListItem('committeeMember').title('Committee Members'),
    ])
