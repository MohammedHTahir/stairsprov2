import { createFileRoute } from '@tanstack/react-router';

type CommonsPage = {
  title?: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

function plain(value?: string) {
  return (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

const layouts: Record<string, { label: string; search: string }> = {
  all: { label: 'Contemporary timber / steel / glass', search: '"floating staircase" OR "cantilevered staircase" OR "modern timber staircase"' },
  straight: { label: 'Straight', search: '"straight floating staircase" OR "straight timber staircase" OR "straight glass balustrade stairs"' },
  'l-shaped': { label: 'L-shaped', search: '"L shaped floating staircase" OR "quarter turn timber staircase" OR "L shaped glass staircase"' },
  'u-shaped': { label: 'U-shaped', search: '"U shaped floating staircase" OR "switchback timber staircase" OR "U shaped glass staircase"' },
  spiral: { label: 'Spiral', search: '"floating staircase" OR "cantilevered timber staircase"' },
  floating: { label: 'Floating', search: '"floating timber staircase" OR "floating oak stairs" OR "glass balustrade floating stairs"' },
  cantilevered: { label: 'Cantilevered', search: '"cantilevered timber staircase" OR "wall mounted oak stairs" OR "glass cantilever staircase"' },
};

const materials: Record<string, string> = {
  all: '',
  wood: 'wood OR timber OR oak',
  glass: '"glass balustrade" OR "glass railing"',
  steel: 'steel OR metal',
  stone: 'stone OR marble',
};

export const Route = createFileRoute('/api/inspiration')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const layoutId = url.searchParams.get('layout') ?? 'all';
        const material = url.searchParams.get('material') ?? 'all';
        const layout = layouts[layoutId] ?? layouts.all;
        const offset = Math.max(0, Math.min(500, Number(url.searchParams.get('offset') ?? 0) || 0));
        const query = [layout.search, 'wood OR timber OR oak', 'glass OR balustrade', 'steel OR metal'].join(' ');
        const params = new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: query,
          gsrnamespace: '6',
          gsrlimit: '50',
          gsroffset: String(offset),
          prop: 'imageinfo',
          iiprop: 'url|extmetadata',
          iiextmetadatafilter: 'Artist|LicenseShortName',
          iiurlwidth: '1200',
          format: 'json',
          formatversion: '2',
        });

        try {
          const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
            headers: { 'User-Agent': 'SahaabStairStudio/1.0 (staircase inspiration gallery)' },
            signal: AbortSignal.timeout(12000),
          });
          if (!response.ok) {
            return Response.json({ message: 'The image library is temporarily unavailable.' }, { status: 502 });
          }

          const data = await response.json() as {
            query?: { pages?: CommonsPage[] };
            continue?: { gsroffset?: number };
          };
          const images = (data.query?.pages ?? []).flatMap(page => {
            const info = page.imageinfo?.[0];
            if (!info?.thumburl || !info.descriptionurl) return [];
            const metadata = info.extmetadata ?? {};
            const author = plain(metadata.Artist?.value) || 'Wikimedia Commons contributor';
            const license = plain(metadata.LicenseShortName?.value) || 'See source page';
            return [{
              id: page.title ?? info.descriptionurl,
              title: (page.title ?? 'Staircase')
                .replace(/^File:/, '')
                .replace(/\.[^.]+$/, '')
                .replace(/[_-]+/g, ' '),
              imageUrl: info.thumburl,
              sourceUrl: info.descriptionurl,
              author,
              license,
              layout: layoutId,
              category: layout.label,
              attribution: `Photo by ${author} · ${license}`,
            }];
          });

          images.sort((a, b) => {
            const rank = (title: string) => { const t = title.toLowerCase(); return ['floating','cantilever','wood','timber','oak','glass','balustrade','steel'].reduce((n, word) => n + (t.includes(word) ? 1 : 0), 0); };
            return rank(b.title) - rank(a.title);
          });

          return Response.json({
            images,
            nextOffset: data.continue?.gsroffset ?? null,
            category: layout.label,
            query,
          }, {
            headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' },
          });
        } catch {
          return Response.json({ message: 'Could not reach the image library. Please try again.' }, { status: 502 });
        }
      },
    },
  },
});
