export function extractImageUrl(bgImageStr: string): string {
  const match = bgImageStr.match(/url\(['"]?(.*?)['"]?\)/)
  return match ? match[1] : ""
}
