import { OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import { getWebgl } from './index'

export default class Camera {
  constructor(opt = {}) {
    const webgl = getWebgl()
    this.scene = webgl.scene.instance
    this.canvas = webgl.canvas
  }
}