import { createFileRoute } from '@tanstack/react-router';
import { StaircaseMatcher } from '@/components/StaircaseMatcher';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Sahaab Stair Studio — Find your staircase' },
      { name: 'description', content: 'Choose your staircase layout, timber and steel finishes to find the closest real staircase reference.' },
      { property: 'og:title', content: 'Sahaab Stair Studio — Find your staircase' },
      { property: 'og:description', content: 'Find the closest real staircase photograph for your chosen configuration.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: StaircaseMatcher,
});
