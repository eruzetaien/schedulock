<script setup lang="ts">
const props = defineProps<{
  isVisible?: boolean
}>()
</script>

<template>
  <img v-if="isVisible" src="/thinking.png" class="thinking-img" alt="No output yet" draggable="false"/>
</template>

<style>

.thinking-img{
  display: none;
  user-select: none;
}

@keyframes float {
  0% {
    transform: scaleX(-1) translateY(0px);
  }
  50% {
    transform: scaleX(-1) translateY(-16px);
  }
  100% {
    transform: scaleX(-1) translateY(0px);
  }
}

/* desktop */
@media (min-width: 1280px) {
  .thinking-img{
    width: 320px;
    transform: scaleX(-1);
    display: inline-block;
    animation: float 2s ease-in-out infinite;
  }
}
</style>