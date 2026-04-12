export function generateTimes(start: number, end: number): number[] {
  const result: number[] = []

  for (let t = start; t <= end; t += 30) { // 30 minutes interval
    result.push(t)
  }

  return result
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseTimeParts(time: string): { h: number; m: number } {
  const parts = time.split(':')

  if (parts.length !== 2) {
    throw new Error('Invalid time format')
  }

  const h = Number(parts[0])
  const m = Number(parts[1])

  if (isNaN(h) || isNaN(m)) {
    throw new Error('Invalid time value')
  }

  return { h, m }
}

export function parseTime(time: string): number {
  const { h, m } = parseTimeParts(time)
  return h * 60 + m
}

export function normalizeTo30Min(time: string): string {
  const { h, m } = parseTimeParts(time)

  const rounded = m < 30 ? 0 : 30

  return `${String(h).padStart(2, '0')}:${String(rounded).padStart(2, '0')}`
}