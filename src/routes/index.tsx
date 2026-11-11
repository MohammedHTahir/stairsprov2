import { createFileRoute } from '@tanstack/react-router';
import { VisualizationWorkspace } from '@/components/VisualizationWorkspace';
export const Route = createFileRoute('/')({ head: () => ({ meta: [
  { title: 'StairStudio AI — Room & staircase visualization' },
  { name: 'description', content: 'Visualize your chosen staircase in a room photo, with architectural preservation, placement guidance and photorealistic results.' },
  { property: 'og:title', content: 'StairStudio AI — Room & staircase visualization' },
  { property: 'og:description', content: 'Your room photo. Your staircase reference. A photorealistic design visualization.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: VisualizationWorkspace });
