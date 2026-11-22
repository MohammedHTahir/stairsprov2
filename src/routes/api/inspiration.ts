import { createFileRoute } from '@tanstack/react-router';

type CommonsPage = {
  title?: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

type Candidate = {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  attribution: string;
  license: string;
  score: number;
};

const layoutTerms: Record<string, string[]> = {
  straight: ['straight', 'linear', 'single flight'],
  'l-shaped': ['l shaped', 'quarter turn', '90 degree'],
  'u-shaped': ['u shaped', 'switchback', 'half turn'],
  cantilevered: ['cantilever', 'floating', 'wall mounted'],
};
const woodTerms: Record<string, string[]> = {
  'light-oak': ['oak', 'light wood', 'timber', 'wooden'],
  'natural-oak': ['oak', 'timber', 'wooden'],
  walnut: ['walnut', 'dark wood', 'timber', 'wooden'],
  'dark-walnut': ['walnut', 'dark wood', 'timber', 'wooden'],
};
const metalTerms: Record<string, string[]> = {
  'matte-black': ['black steel', 'black metal', 'steel', 'metal'],
  anthracite: ['anthracite', 'dark steel', 'steel', 'metal'],
  'brushed-steel': ['stainless steel', 'brushed steel', 'steel', 'metal'],
};
const supportTerms: Record<string, string[]> = {
  'central-spine': ['central spine', 'mono stringer', 'central stringer', 'steel spine'],
  'side-stringer': ['side stringer', 'side support', 'steel stringer'],
  cantilevered: ['cantilever', 'floating', 'wall mounted'],
};

function clean(value?: string) {
  return (value ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function scoreCandidate(text: string, layout: string, wood: string, metal: string, support: string) {
  const value = text.toLowerCase();
  let score = 0;
  const groups = [
    { terms: layoutTerms[layout] ?? [], weight: 5 },
    { terms: woodTerms[wood] ?? [], weight: 4 },
    { terms: metalTerms[metal] ?? [], weight: 3 },
    { terms: supportTerms[support] ?? [], weight: 4 },
    { terms: ['glass balustrade', 'glass railing', 'glass panel', 'frameless glass', 'glass'], weight: 5 },
    { terms: ['staircase', 'stairs', 'stair'], weight: 6 },
  ];
  for (const group of groups) if (group.terms.some(term => value.includes(term))) score += group.weight;
  for (const term of ['carpet', 'wrought iron', 'spiral', 'stone steps', 'concrete steps', 'ladder', 'fire escape', 'stair runner']) {
    if (value.includes(term)) score -= 8;
  }
  return score;
}

export const Route = createFileRoute('/api/inspiration')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const layout = url.searchParams.get('layout') ?? 'straight';
        const wood = url.searchParams.get('wood') ?? 'natural-oak';
        const metal = url.searchParams.get('metal') ?? 'matte-black';
        const support = url.searchParams.get('support') ?? 'central-spine';
        const layoutQuery: Record<string, string> = {
          straight: '"straight staircase" OR "floating staircase"',
          'l-shaped': '"L shaped staircase" OR "quarter turn staircase"',
          'u-shaped': '"U shaped staircase" OR "switchback staircase"',
          cantilevered: '"cantilevered staircase" OR "floating staircase"',
        };
        const woodQuery: Record<string, string> = {
          'light-oak': 'oak timber wood',
          'natural-oak': 'oak timber wood',
          walnut: 'walnut dark wood timber',
          'dark-walnut': 'walnut dark wood timber',
        };
        const queries = [
          `${layoutQuery[layout] ?? layoutQuery.straight} ${woodQuery[wood] ?? woodQuery['natural-oak']} glass steel`,
          `floating staircase ${woodQuery[wood] ?? woodQuery['natural-oak']} glass`,
          'modern timber staircase glass balustrade steel',
        ];
        try {
          const batches = await Promise.all(queries.map(async query => {
            const params = new URLSearchParams({
              action: 'query', generator: 'search', gsrsearch: query,
              gsrnamespace: '6', gsrlimit: '35',
              prop: 'imageinfo', iiprop: 'url|extmetadata',
              iiextmetadatafilter: 'Artist|LicenseShortName|ImageDescription',
              iiurlwidth: '1600', format: 'json', formatversion: '2',
            });
            const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
              headers: { 'User-Agent': 'SahaabStairStudio/1.0 (reference matching)' },
              signal: AbortSignal.timeout(12000),
            });
            if (!response.ok) throw new Error('The staircase reference collection is temporarily unavailable.');
            const data = await response.json() as { query?: { pages?: CommonsPage[] } };
            return data.query?.pages ?? [];
          }));
          const unique = new Map<string, Candidate>();
          for (const page of batches.flat()) {
            const info = page.imageinfo?.[0];
            if (!page.title || !info?.thumburl || !info.descriptionurl || unique.has(page.title)) continue;
            const metadata = info.extmetadata ?? {};
            const description = clean(metadata.ImageDescription?.value);
            const title = page.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
            const score = scoreCandidate(`${title} ${description}`, layout, wood, metal, support);
            if (score < 10) continue;
            const author = clean(metadata.Artist?.value) || 'Wikimedia Commons contributor';
            const license = clean(metadata.LicenseShortName?.value) || 'See original source';
            unique.set(page.title, {
              title, imageUrl: info.thumburl, sourceUrl: info.descriptionurl,
              attribution: `Photo by ${author}`, license, score,
            });
          }
          const match = [...unique.values()].sort((a, b) => b.score - a.score)[0];
          if (!match) return Response.json({ message: 'No close match was found in the current reference collection. Try a different configuration.' }, { status: 404 });
          return Response.json({ match }, {
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
          });
        } catch {
          return Response.json({ message: 'Could not reach the staircase reference collection. Please try again.' }, { status: 502 });
        }
      },
    },
  },
});
