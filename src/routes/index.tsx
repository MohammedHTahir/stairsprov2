import { createFileRoute } from '@tanstack/react-router';
import { StaircaseGallery } from '@/components/StaircaseGallery';
export const Route = createFileRoute('/')({ head: () => ({ meta: [
  { title: 'Sahaab Stair Studio — Staircase Inspiration Gallery' },
  { name: 'description', content: 'Explore real staircase photography by layout, material and finish. Choose a reference for your staircase design.' },
  { property: 'og:title', content: 'Sahaab Stair Studio — Staircase Inspiration Gallery' },
  { property: 'og:description', content: 'Browse staircase ideas and select a real-world design reference.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
] }), component: StaircaseGallery });
