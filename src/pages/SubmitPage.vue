<script setup lang="ts">
import { ref } from 'vue'
import { getKey, encryptData, cryptoKeyToString, encodeBlock, decodeBlock } from '@/utils/crypto'
import { days, times, getIndex } from '@/constants/schedule'
import type { EncryptedPayload, DecryptedPayload } from '@/types/block'

// Input
const schedule = ref<boolean[]>(Array(21).fill(false))
const password = ref('')
const lastBlock = ref('')

// Output
const outputBlock = ref('')
const outputKey = ref('')

function toggle(day: number, time: number) {
  const index = getIndex(day, time)
  schedule.value[index] = !schedule.value[index]
}

async function submitSchedule() {
  if (!password.value) {
    alert('Password is required!')
    return
  }

  const key : CryptoKey = await getKey(password.value)

  let index = 0

  if (lastBlock.value) {
    const prev: EncryptedPayload = decodeBlock(lastBlock.value)
    index = prev.index + 1
  }

  const payload: DecryptedPayload = {
    schedule: schedule.value,
    prevEncryptedPayload: lastBlock.value || null
  }

  const encrypted = await encryptData(key, payload, index)

  outputBlock.value = encodeBlock(encrypted)
  
  outputKey.value = await cryptoKeyToString(key)
  lastBlock.value = outputBlock.value

}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard!')
}

</script>

<template>
  <div class="container">
    <div class="app">
      <h1>Lock Schedule 🔐</h1>

      <div class="grid">
        <!-- Header Row -->
        <div></div>
        <div v-for="day in days" :key="day" class="header">
          {{ day }}
        </div>

        <!-- Time Rows -->
        <template v-for="(time, tIndex) in times" :key="time">
          <div class="time-label">{{ time }}</div>

          <div
            v-for="(day, dIndex) in days"
            :key="day + time"
            class="cell"
            :class="{ active: schedule[getIndex(dIndex, tIndex)] }"
            @click="toggle(dIndex, tIndex)"
          >
          </div>
        </template>
      </div>

      <div class="password-section">
        <input
          v-model="password"
          type="password"
          placeholder="Enter your secret key"
        />
      </div>

      <div class="block-section">
        <textarea
          v-model="lastBlock"
          placeholder="Paste last encrypted block (optional for first user)"
          rows="4"
        ></textarea>
      </div>

      <button @click="submitSchedule">
        Submit Schedule
      </button>

      <div v-if="outputBlock" class="output-section">
        <h3>Encrypted Block</h3>

        <textarea
          :value="outputBlock"
          readonly
          rows="8"
        ></textarea>

        <button @click="copyText(outputBlock)">
          Copy
        </button>
      </div>

      <div v-if="outputKey" class="output-section">
        <h3>Key</h3>

        <div class="key-box">
          {{ outputKey }}
        </div>

        <button @click="copyText(outputKey)">
          Copy
        </button>
      </div>

    </div>
  </div>
</template>