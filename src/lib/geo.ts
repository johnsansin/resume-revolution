export interface GeoInfo {
  ip: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;
}

export const getGeoInfo = async (): Promise<GeoInfo | null> => {
  try {
    const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data?.ip || null,
        country: data?.country || null,
        country_code: data?.country_code || null,
        city: data?.city || null,
      };
    }
  } catch {
    // fall through
  }
  try {
    const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const text = await res.text();
      const lines: Record<string, string> = {};
      text.split('\n').forEach((line) => {
        const i = line.indexOf('=');
        if (i > 0) lines[line.slice(0, i)] = line.slice(i + 1);
      });
      return {
        ip: lines.ip || null,
        country: null,
        country_code: lines.loc || null,
        city: null,
      };
    }
  } catch {
    // fall through
  }
  return null;
};
