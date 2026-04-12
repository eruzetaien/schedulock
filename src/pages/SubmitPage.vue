<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getKey, encryptData, cryptoKeyToString, encodeBlock, decodeBlock } from '@/utils/crypto'
import { generateTimes, parseTime, formatTime, normalizeTo30Min} from '@/utils/time'
import { allDays} from '@/constants/schedule'
import type { EncryptedPayload, DecryptedPayload, ScheduleConfig } from '@/types/block'

import ScheduleGrid from '@/components/Schedule.vue'

// Input
const startTime = ref("20:00")
const endTime = ref("21:00")

const times = computed(() => {
  const start : number = parseTime(startTime.value)
  const end : number = parseTime(endTime.value)

  if (end < start) return []

  return generateTimes(start, end)
})
const days = ref<number[]>([0,1,2,3,4,5,6]) // all days 
const password = ref('')
const prevBlock = ref('')
const lockedConfig = ref<ScheduleConfig | null>(null)
const sortedDays = computed(() =>
  [...days.value].sort((a, b) => a - b)
)

const schedule = ref<boolean[]>([])
watch(
  prevBlock,
  (newVal) => {
    if (!newVal) {
      lockedConfig.value = null
      return
    }

    try {
      const prev: EncryptedPayload = decodeBlock(newVal)

      if (!prev.scheduleConfig) {
        alert('Invalid block: missing schedule config')
        lockedConfig.value = null
        return
      }

      lockedConfig.value = prev.scheduleConfig

      days.value = [...prev.scheduleConfig.days]
      startTime.value = formatTime(prev.scheduleConfig.startTime)
      endTime.value = formatTime(prev.scheduleConfig.endTime)

    } catch (e) {
      lockedConfig.value = null
    }
  },
  { immediate: true }
)

// Output
const outputBlock = ref('')
const outputKey = ref('')

async function submitSchedule() {
  if (!password.value) {
    alert('Password is required!')
    return
  }

  const key : CryptoKey = await getKey(password.value)

  let index = 0

 if (prevBlock.value) {
    let prev: EncryptedPayload | null = null;
    try {
      prev = decodeBlock(prevBlock.value);
      index = prev.index + 1;
    } catch (e) {
      prevBlock.value = "";
      alert("Previous block is not valid. Starting as the first block.");
    }
  }
  const payload: DecryptedPayload = {
    schedule: schedule.value,
    prevEncryptedPayload: prevBlock.value || null
  }

  const scheduleConfig: ScheduleConfig = {
    days: sortedDays.value,
    startTime: parseTime(startTime.value),
    endTime: parseTime(endTime.value),
  }

  const encrypted = await encryptData(key, payload, index, scheduleConfig)

  outputBlock.value = encodeBlock(encrypted)
  
  outputKey.value = await cryptoKeyToString(key)
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard!')
}

const isValidConfig = computed(() =>
  days.value.length > 0 && times.value.length > 0
)
const isLocked = computed(() => !!lockedConfig.value)


watch(
  [sortedDays, times],
  ([newDays, newTimes], [oldDaysVal, oldTimesVal]) => {
    if (isLocked.value) return

    if (
      !oldDaysVal || oldDaysVal.length === 0 ||
      !oldTimesVal|| oldTimesVal.length === 0
    ) {
      // initial case
      const size = newDays.length * newTimes.length
      schedule.value = Array(size).fill(false)
    } else {
      schedule.value = resizeSchedule(
        schedule.value,
        oldDaysVal ?? [],
        oldTimesVal ?? [],
        newDays,
        newTimes
      )
    }
  },
  { immediate: true }
)
function resizeSchedule(
  oldSchedule: boolean[],
  oldDays: number[],
  oldTimes: number[],
  newDays: number[],
  newTimes: number[]
): boolean[] {
  const newSize = newDays.length * newTimes.length
  const newSchedule = Array(newSize).fill(false)

  const oldWidth = oldTimes.length
  const newWidth = newTimes.length

  // create lookup maps
  const dayIndexMap = new Map<number, number>()
  const timeIndexMap = new Map<number, number>()

  newDays.forEach((d, i) => dayIndexMap.set(d, i))
  newTimes.forEach((t, i) => timeIndexMap.set(t, i))

  oldDays.forEach((day, oldDayIndex) => {
    const newDayIndex = dayIndexMap.get(day)
    if (newDayIndex === undefined) return

    oldTimes.forEach((time, oldTimeIndex) => {
      const newTimeIndex = timeIndexMap.get(time)
      if (newTimeIndex === undefined) return

      const oldIndex = oldDayIndex * oldWidth + oldTimeIndex
      const newIndex = newDayIndex * newWidth + newTimeIndex

      newSchedule[newIndex] = oldSchedule[oldIndex] ?? false
    })
  })

  return newSchedule
}

</script>

<template>
  <div class="container">
    <div class="layout">
      
      <div class="left">
        <h1>Lock Schedule 🔐</h1>

        <div class="times-section">
          <label>
            Start Time:
          </label>
          <input
              type="time"
              v-model="startTime"
              step="1800"
              @change="startTime = normalizeTo30Min(startTime)"
              :disabled="isLocked"
          />

          <label>
            End Time:
          </label>
          <input
              type="time"
              v-model="endTime"
              step="1800"
              @change="endTime = normalizeTo30Min(endTime)"
              :disabled="isLocked"
          />
        </div>

        <div class="days-section">
          <label v-for="(d, i) in allDays" :key="i">
            {{ d }}
            <input
              type="checkbox"
              :value="i"
              v-model="days"
              :disabled="isLocked"
            />
          </label>
        </div>

        <ScheduleGrid
          v-if="isValidConfig"
          :days="sortedDays"
          :times="times"
          v-model="schedule"
        />

        <div class="password-section">
          <input
            v-model="password"
            type="password"
            placeholder="Enter your key to lock the schedule"
          />
        </div>

        <div class="block-section">
          <textarea
            v-model="prevBlock"
            placeholder="Paste previous encrypted block (optional)"
            rows="4"
          ></textarea>
        </div>

        <button @click="submitSchedule">
          Submit Schedule
        </button>

      </div>
      
      <!-- Output -->
      <div class="right">
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
  </div>
</template>

<style>

.password-section {
  margin-top: 20px;
}


.block-section {
  margin-top: 10px;
}

textarea {
  width: 400px;
  padding: 8px;
  resize: none;
}

.output-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.output-section textarea {
  font-family: monospace;
}

.key-box {
  width: 400px;
  padding: 8px 12px;
  background: #f4f4f4;
  border-radius: 6px;
  font-family: monospace;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.times-section {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
  align-items: center;
}

.times-section label {
  font-size: 14px;
}

.times-section input[type="time"] {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  outline: none;
  transition: 0.2s;
  width: 80px;
}

.times-section input[type="time"]:focus {
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.15);
}

.days-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.days-section label {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  background: white;
  border: 1px solid #eee;
  cursor: pointer;
  transition: 0.2s;
  width: 48px;
  gap: 4px;
}

.days-section label:hover {
  border-color: #42b883;
  background: #f1fbf7;
}

.days-section input {
  accent-color: #90ecc3;
}

.times-section input:disabled,
.days-section input:disabled,
.days-section label:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>