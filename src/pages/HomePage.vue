<!-- src/pages/HomePage.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function go(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="container">
    <div class="home">

      <h1>Schedulock</h1>
      <p>Cool group scheduling with encrypted blocks</p>

      <div class="menu">
        <button @click="go('/lock')">
          Lock Schedule
        </button>

        <button @click="go('/unlock')">
          Unlock Schedule
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f9f9f9;
}

.home {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu {
  display: flex;
  gap: 12px;
  justify-content: center;
}

button {
  padding: 10px 16px;
  cursor: pointer;
  border: none;
  background: #42b883;
  color: white;
  border-radius: 6px;
  transition: 0.2s;
}

button:hover {
  background: #369f6e;
}
</style>