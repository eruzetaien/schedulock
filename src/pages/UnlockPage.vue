<script setup lang="ts">
import { ref } from 'vue'
import { getKey, decryptData, decodeBlock, stringToCryptoKey } from '@/utils/crypto'
import { days, times, getIndex } from '@/constants/schedule'
import type { EncryptedPayload, DecryptedPayload } from '@/types/block'

const encryptedBlock = ref('')
const passwordList = ref('') 
const result = ref<number[] | null>(null)
const progress = ref(0)
const totalBlocks = ref(0)
const isUnlocking = ref(false)

function parsePasswords(input: string, size = 44): string[] {
  const RAW = input.replace(/\s/g, '')

  const passwords: string[] = []

  for (let i = 0; i < RAW.length; i += size) {
    const chunk = RAW.slice(i, i + size)

    if (chunk.length === size) {
      passwords.push(chunk)
    }
  }
  return passwords
}

async function unlock() {
  if (!encryptedBlock.value || !passwordList.value) {
    alert('Missing input')
    return
  }

  const passwords = parsePasswords(passwordList.value)

  let current: EncryptedPayload = decodeBlock(encryptedBlock.value)
  totalBlocks.value = current.index + 1;
  const collectedSchedules: boolean[][] = []

  if (passwords.length < totalBlocks.value){
    alert('Key is not enough')
    return
  }

  isUnlocking.value = true
  progress.value = 0

  let encryptedBlockCount = 0;
  while (current) {
    let decrypted: DecryptedPayload | null = null

    for (const password of passwords) {
      try {
        const key = await stringToCryptoKey(password)
        decrypted = await decryptData(key, current)
        break
      } catch (error) {
        continue
      }
    }

    if (!decrypted) {
      alert('Failed to decrypt chain')
      isUnlocking.value = false
      return
    }

    collectedSchedules.push(decrypted.schedule)

    encryptedBlockCount += 1
    progress.value = encryptedBlockCount

    await new Promise(resolve => setTimeout(resolve, 400))

    if (!decrypted.prevEncryptedPayload) break
    current = decodeBlock(decrypted.prevEncryptedPayload)
  }

  if (encryptedBlockCount != totalBlocks.value){
    alert('Failed to decrypt chain')
    return
  }

  // aggregation (OR logic)
  const final = Array(21).fill(0)

  for (const sched of collectedSchedules) {
    for (let i = 0; i < 21; i++) {
      if (sched[i]) {
        final[i] += 1
      }
    }
  }

  result.value = final
}

function getCellStyle(value: number) {
  if (value === 0 || totalBlocks.value === 0) {
    return {
      backgroundColor: '#ffffff'
    }
  }

  // normalize 0 → 1
  const intensity = Math.min((value -1) / totalBlocks.value, 1)

  // base Vue green
  const base = { r: 66, g: 184, b: 131 }

  // interpolate toward darker green
  const factor = 1 - intensity * 0.5 // max 50% darker

  const r = Math.floor(base.r * factor)
  const g = Math.floor(base.g * factor)
  const b = Math.floor(base.b * factor)

  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`
  }
}
</script>

<template>
  <div class="container">
    <div class="app">

      <h1>Unlock Schedule 🔓</h1>

      <textarea
        v-model="encryptedBlock"
        placeholder="Paste encrypted block"
        rows="5"
      />

      <textarea
        v-model="passwordList"
        placeholder="Enter passwords"
        rows="3"
      />

      <button @click="unlock">
        Unlock & See The Result
      </button>

      <div v-if="isUnlocking" class="progress">
        Decrypting block {{ progress }} / {{ totalBlocks }}
      </div>

      <div v-if="isUnlocking" class="bar">
        <div
          class="bar-inner"
          :style="{ width: (progress / totalBlocks) * 100 + '%' }"
        />
      </div>

      <div v-if="result">
        <h3>Final Schedule</h3>
        <div class="grid">
          <div></div>
          <div v-for="day in days" :key="day" class="header">
            {{ day }}
          </div>

          <template v-for="(time, tIndex) in times" :key="time">
            <div class="time-label">{{ time }}</div>

            <div
              v-for="(day, dIndex) in days"
              :key="day + time"
              class="cell"
              :style="getCellStyle(result[getIndex(dIndex, tIndex)] ?? 0)"
            ></div>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>


<style>

.progress {
  margin-bottom: 10px;
  font-weight: bold;
}

.bar {
  width: 300px;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.bar-inner {
  height: 100%;
  background: #42b883;
  transition: width 0.3s ease;
}

</style>