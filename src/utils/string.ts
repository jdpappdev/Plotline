export function computeInitials(name: string): string {
  const clean = (name || '').trim();
  if (!clean) return 'PL';
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}
