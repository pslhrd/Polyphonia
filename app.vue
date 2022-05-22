<template>
  <main>
    <NuxtPage />
    <WebGL />
  </main>
</template>


<script setup>
import { createApp } from 'vue'
import Resize from './plugins/resize'

const app = createApp({})
app.use(Resize)
</script>
<style lang="scss"></style>