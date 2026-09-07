export function parseRgbColor(colorStr: string): string {
  if (!colorStr || colorStr === "transparent" || colorStr === "rgba(0, 0, 0, 0)") {
    return ""
  }
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (match) {
    const r = parseInt(match[1], 10).toString(16).padStart(2, "0")
    const g = parseInt(match[2], 10).toString(16).padStart(2, "0")
    const b = parseInt(match[3], 10).toString(16).padStart(2, "0")
    if (match[4] !== undefined && parseFloat(match[4]) === 0) {
      return ""
    }
    return `#${r}${g}${b}`
  }
  if (colorStr.startsWith("#")) {
    return colorStr
  }
  return colorStr
}
