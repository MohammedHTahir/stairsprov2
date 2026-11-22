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
  return (value ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}
const layouts: Record<string, string> = {
  all: 'staircase OR stairs OR stairwell',
  straight: 'straight staircase',
  'l-shaped': 'L-shaped staircase',
  'u-shaped': 'U-shaped staircase',
  spiral: 'spiral staircase',
  floating: 'floating staircase',
};
const materials: Record<string, string> = {
  all: '',
  wood: 'wood OR timber OR oak',
  glass: 'glass balustrade OR glass railing',
  steel: 'steel OR metal',
  stone: 'stone OR marble',
};
export const Route = createFileRoute('/api/inspiration')({
  server: { handlers: { GET: async ({ request }) => {
    const url = new URL(request.url);
    const layout = url.searchParams.get('layout') ?? 'all';
    const material = url.searchParams.get('material') ?? 'all';
    const offset = Math.max(0, Math.min(500, Number(url.searchParams.get('offset') ?? 0) || 0));
    const query = [layouts[layout] ?? layouts.all, materials[material] ?? ''].filter(Boolean).join(' ');
    const params = new URLSearchParams({
      action: 'query', generator: 'search', gsrsearch: query, gsrnamespace: '6',
      gsrlimit: '30', gsroffset: String(offset), prop: 'imageinfo',
      iiprop: 'url|extmetadata', iiextmetadatafilter: 'Artist|LicenseShortName', iiurlwidth: '1000', format: 'json', formatversion: '2',
    });
    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
        headers: { 'User-Agent': 'SahaabStairStudio/1.0 (staircase inspiration gallery)' },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) return Response.json({ message: 'The image library is temporarily unavailable.' }, { status: 502 });
      const data = await response.json() as { query?: { pages?: CommonsPage[] }; continue?: { gsroffset?: number } };
      const images = (data.query?.pages ?? []).flatMap(page => {
        const info = page.imageinfo?.[0];
        if (!info?.thumburl || !info.descriptionurl) return [];
        const meta = info.extmetadata ?? {};
        const author = plain(meta.Artist?.value) || 'Wikimedia Commons contributor';
        const license = plain(meta.LicenseShortName?.value) || 'See source page';
        return [{
          id: page.title ?? info.descriptionurl,
          title: (page.title ?? 'Staircase').replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
          imageUrl: info.thumburl,
          sourceUrl: info.descriptionurl,
          author,
          license,
          attribution: `Photo by ${author} · ${license}`,
        }];
      });
      return Response.json({ images, nextOffset: data.continue?.gsroffset ?? null, query }, {
        headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' },
      });
    } catch {
      return Response.json({ message: 'Could not reach the image library. Please try again.' }, { status: 502 });
    }
  } } },
});
