export const ONLINE_WINDOW_MS = 3 * 60 * 1000;

export const isOnline = (lastSeenAt?: string | null, now: number = Date.now()): boolean => {
  if (!lastSeenAt) return false;
  const t = new Date(lastSeenAt).getTime();
  if (Number.isNaN(t)) return false;
  return now - t <= ONLINE_WINDOW_MS;
};

export const timeAgo = (dateStr?: string | null): string => {
  if (!dateStr) return 'never';
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return 'never';
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
};
