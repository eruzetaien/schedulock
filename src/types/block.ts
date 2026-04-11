export interface EncryptedPayload {
  index: number
  iv: string
  data: string
}

export interface DecryptedPayload {
  schedule: boolean[]
  prevEncryptedPayload: string | null
}