<template>
  <section class="cta">
    <div @click="setState(1)">State 1</div>
    <div @click="setState(2)">State 2</div>
    <div @click="setState(3)">State 3</div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from '/store/store'
console.log(store.cameraState)

const setState = (number) => {
  store.cameraState = number
}
</script>

<style lang="scss">
  .cta {
    position: absolute;
    z-index: 10;
    bottom: 0;
    width: 100%;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Helvetica;
    font-size: 15px;
    
    div {
      padding: 10px;
    }

    &:hover {
      cursor: pointer;
    }

  }
</style>