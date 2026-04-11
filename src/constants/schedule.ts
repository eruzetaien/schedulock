export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const times = ['20:00', '20:30', '21:00']

export function getIndex(day: number, time: number): number {
  return day * times.length + time
}