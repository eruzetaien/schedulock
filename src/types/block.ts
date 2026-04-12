export type EncryptedPayload = {
  index: number
  scheduleConfig: ScheduleConfig
  iv: string
  data: string
}

export type DecryptedPayload = {
  schedule: boolean[]
  prevEncryptedPayload: string | null
}

export type ScheduleConfig = {
  days: number[]
  startTime: number // in minutes
  endTime: number
}