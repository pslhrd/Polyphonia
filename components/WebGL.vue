<template>
  <section ref="container" class="webgl">
    <canvas ref="canvas"></canvas>
  </section>
</template>

<script setup>
import { store } from '~~/store/store'
import { ref, onMounted, onUnmounted } from 'vue'
import { App } from '~~/webgl/index'

const container = ref(null)
const canvas = ref(null)

onMounted(() => {
  const app = new App(canvas.value)
  app.init()
})
</script>

<style lang="scss">
  .webgl {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    canvas {
      width: 100%;
      height: 100%;
    }
  }
</style>