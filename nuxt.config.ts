import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  css: [
    '@/assets/fonts/fonts.scss',
    '@/assets/styles/main.scss',
    '@/assets/styles/reset.scss'
  ],
  vite: {
    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr']
  },
})
