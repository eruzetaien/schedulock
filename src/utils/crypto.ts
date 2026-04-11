import type { DecryptedPayload, EncryptedPayload } from '@/types/block'

export async function getKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(password)
  )

  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(
  key: CryptoKey,
  data: DecryptedPayload,
  index: number
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encoder.encode(JSON.stringify(data))
  )

  // convert to base64
  const ivBase64 = btoa(String.fromCharCode(...iv))
  const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))

  return {
    index,
    iv: ivBase64,
    data: dataBase64
  }
}

export async function decryptData(
  key: CryptoKey,
  payload: EncryptedPayload
): Promise<DecryptedPayload> {
  const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0))
  const data = Uint8Array.from(atob(payload.data), c => c.charCodeAt(0))

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  )

  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decrypted)) as DecryptedPayload
}

export async function cryptoKeyToString(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key)

  const bytes = new Uint8Array(raw)

  const base64 = btoa(String.fromCharCode(...bytes))

  return base64
}

export async function stringToCryptoKey(base64: string): Promise<CryptoKey> {
  const binary = atob(base64)

  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return crypto.subtle.importKey(
    'raw',
    bytes.buffer,
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  )
}

export function encodeBlock(block: EncryptedPayload): string {
  return btoa(JSON.stringify(block))
}

export function decodeBlock(encoded: string) : EncryptedPayload{
  return JSON.parse(atob(encoded))
}