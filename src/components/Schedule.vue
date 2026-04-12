<script setup lang="ts">
import {computed} from 'vue'
import {formatTime} from '@/utils/time'
import {allDays} from '@/constants/schedule'
const props = defineProps<{
  days: number[]
  times: number[]
  modelValue?: boolean[]        // for input mode
  values?: number[]            // for result mode
  readonly?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const displayDays = computed<string[]>(() => {
  return props.days
    .map(i => allDays[i])
    .filter((d): d is string => d !== undefined)
})

const displayTimes = computed<string[]>(() => {
  return props.times.map((t) => formatTime(t))
})

const maxValue = computed(() => {
  if (!props.values || props.values.length === 0) return 0
  return Math.max(...props.values)
})

function getIndex(day: number, time: number, width: number) {
  return day * width + time
}

function toggle(day: number, time: number) {
  if (!props.modelValue || props.readonly) return

  const index = getIndex(day, time, props.times.length)
  const updated = [...props.modelValue]
  updated[index] = !updated[index]

  emit('update:modelValue', updated)
}

function getHeatmapStyle(value: number) {
  if (!value) {
    return { backgroundColor: '#ffffff' }
  }

  // normalize 0 → 1
  const intensity = Math.min((value -1) / maxValue.value, 1)

  const base = { r: 66, g: 184, b: 131 }
  // interpolate toward darker green
  const factor = 1 - intensity * 0.5 // max 50% darker

  return {
    backgroundColor: `rgb(
      ${Math.floor(base.r * factor)},
      ${Math.floor(base.g * factor)},
      ${Math.floor(base.b * factor)}
    )`
  }
}

</script>

<template>
  <div
    class="grid"
    :style="{
        gridTemplateColumns: `60px repeat(${props.days.length}, 80px)`
    }"
  >
    <div></div>

    <div v-for="day in displayDays" :key="day" class="header">
      {{ day }}
    </div>

    <template v-for="(time, tIndex) in displayTimes" :key="time">
      <div class="time-label">{{ time }}</div>

      <div
        v-for="(day, dIndex) in displayDays"
        :key="day + time"
        class="cell"
        :class="{
          active: modelValue && modelValue[getIndex(dIndex, tIndex, displayTimes.length)]
        }"
        :style="values ? getHeatmapStyle(values[getIndex(dIndex, tIndex, displayTimes.length)] ?? 0) : {}"
        @click="toggle(dIndex, tIndex)"
      />
    </template>
  </div>
</template>

<style>

.grid {
  display: grid;
  justify-content: start;  
  align-content: start;
  width: 680px;
}

.header {
  text-align: center;
  font-weight: bold;
}

.time-label {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell {
  height: 24px;
  border: 1px solid #ccc;
  cursor: pointer;
  transition: 0.2s;
  background-color: #ffffff;
}

.cell:hover {
  background-color: #eee;
}

.cell.active {
  background-color: #42b883; /* Vue green */
}
</style>