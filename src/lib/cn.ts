/** className 조합 유틸 (tailwind-merge 없이 경량 구현) */
export function cn(...inputs: (string | Record<string, boolean> | undefined | null | false)[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue
    if (typeof input === 'string') {
      classes.push(input)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}
