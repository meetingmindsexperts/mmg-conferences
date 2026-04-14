import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {defaultDocumentNode, structure} from './deskStructure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'MMG Conferences',

  projectId: 'cfy1tt5s',
  dataset: 'production',

  plugins: [structureTool({defaultDocumentNode, structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
