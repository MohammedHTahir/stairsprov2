import { createFileRoute } from '@tanstack/react-router';
import { VisualizationWorkspace } from '@/components/VisualizationWorkspace';
export const Route = createFileRoute('/')({ head: () => ({ meta: [
  { title: 'Sahaab Stair Studio — Staircase visualization' },
  { name: 'description', content: 'Visualize premium timber, steel and glass staircases in your own room.' },
  { property: 'og:title', content: 'Sahaab Stair Studio — Staircase Inspiration Gallery' },
  { property: 'og:description', content: 'Upload your room and configure a contemporary timber-and-steel staircase.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: VisualizationWorkspace });
