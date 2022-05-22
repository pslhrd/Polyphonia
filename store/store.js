import { reactive } from 'vue'

export const store = reactive({
  cameraState: 1,
  isLoading: true,
  clientHeight: null,
  clientWidth: null,
})