import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  AmbientLight,
  PointLight,
  AnimationMixer,
  BufferGeometry,
  PointsMaterial,
  Points,
  Float32BufferAttribute,
  Clock,
  AxesHelper,
  GridHelper,
  Fog,
  ShaderMaterial,
  LoadingManager,
  DirectionalLight,
  UniformsLib,
  UniformsUtils,
  CameraHelper,
  PMREMGenerator,
  TextureLoader
} from 'three'

import { gsap } from 'gsap'
import { reactive, watchEffect, watch } from 'vue'
import { store } from '/store/store'
// import createParticles from '/webgl/particles'

// Remove this if you don't need to load any 3D model
import { RGBMLoader } from 'three/examples/jsm/loaders/RGBMLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import model from '/models/scene.gltf'
import sphere from '/models/sphere.gltf'
import cubeMap from '/hdr/cannon.hdr'
// import Stats from 'stats'
// document.body.appendChild(stats.dom)

export class App {
  static instance;

  constructor(canvas) {
    this.canvas = canvas
    App.instance = this;
    
    this._resizeCb = () => this._onResize()
    // this._mousemoveCb = e => this._onMousemove(e)
  }

  init() {
    this._createScene()
    this._createCamera()
    // this._createPostPro()
    this._createRenderer()
    this._createControls()
    // this._setMaterial()
    this._createProps()
    this._loadModel().then(() => {
      this._addListeners()
      this.renderer.setAnimationLoop(() => {
        // this.delta = this.clock.getDelta()
        // this.time = this.clock.getElapsedTime()
        this._render()       
        this.controls.update()
        // this.mixer.update(this.delta)
        // this._animateParticles(this.time)
      })
    })
  }

  destroy() {
    this.renderer.dispose()
    this._removeListeners()
  }

  _render() {
    this.renderer.render(this.scene, this.camera)
  }

  _createScene() {
    this.scene = new Scene()
  }

  _createProps() {
    const ambient = new AmbientLight(0xffffff, 1)
    const directional = new DirectionalLight(0xffffff, 0.5)
    directional.position.set(-5, 5, 5)
    const axesHelper = new AxesHelper(5)

    directional.castShadow = true
    directional.shadow.mapSize.width = 4096
    directional.shadow.mapSize.height = 4096
    directional.shadow.bias = -0.004

    this.scene.add(axesHelper, ambient )
    this.scene.fog = new Fog(0x120720, 50, 150)
  }

  _createCamera() {
    this.reference = new Vector3(0, 0 , 0)
    this.camera = new PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.001, 1000)
    this.camera.position.set(5, 5, 0)
    // this.camera.lookAt(this.reference)
    // console.log(this.camera.lookAt)
  }

  _setMaterial(model) {
    let generator = new PMREMGenerator(this.renderer)
    const hdr = new RGBELoader().load(cubeMap, (map) => {
      this.envmap = generator.fromEquirectangular(map)
      // this.material.envMap = this.envmap.texture
      // this.material.envMapIntensity = 1.6
      // this.scene.background = map
      model.traverse((elements) => {          
        if (elements.type === 'Mesh') {
          elements.material.envMap = this.envmap.texture
          elements.material.envMapIntensity = 1.6
          console.log(elements)
        }
      })
    })
  }

  _cameraState() {

    watch(
      () => store.cameraState,
      (count, prevCount) => {
        console.log(this.reference)
        if (count === 2 ) {
          gsap.to(this.reference, {x: 0, y: 0, z: 0, duration: 1, ease:'power4.out'})
          gsap.to(this.camera.position, {x: 5, y: 0, z: 0, duration: 1, ease:'power4.out'})
        }
        if (count === 1 ) {
          gsap.to(this.reference, {x: 0, y: 0, z: 7, duration: 1, ease:'power4.out'})
          gsap.to(this.camera.position, {x: 5, y: 0, z: 7, duration: 1, ease:'power4.out'})
        }
        if (count === 3 ) {
          gsap.to(this.reference, {x: 0, y: 0, z: -7, duration: 1, ease:'power4.out'})
          gsap.to(this.camera.position, {x: 5, y: 0, z: -7, duration: 1, ease:'power4.out'})
        }
      }
    )
  }

  _createControls() {
    this.controls = new OrbitControls( this.camera, this.renderer.domElement )
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.085

  }

  _createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      canvas: this.canvas,
      antialias: window.devicePixelRatio === 1
    })

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(2)
    this.renderer.shadowMap.enabled = true
  }

  _createAnimations(model) {
    this.clock = new Clock()
    this.mixer = new AnimationMixer(model.scene)
    console.log(model.animations)
    model.animations.forEach((clip) => {
      this.mixer.clipAction(clip).play()
    })
  }

  _loadModel() {
    this.manager = new LoadingManager()
    this.gltfLoader = new GLTFLoader(this.manager)
    return new Promise(resolve => {
      this.gltfLoader.load(model, gltf => {
        this.model = gltf.scene
        this.children = gltf.scene.children
        this.model.position.set(0,0,0)
        this.model.traverse((elements) => {          
          if (elements.type === 'Mesh') {
            elements.castShadow = true
            elements.receiveShadow = true
            elements.material.metalness = 0.2
            elements.material.roughness = 0.6
          }
        })
        this._setMaterial(this.model)
        this.scene.add(this.model)
        // console.log(this.model)
        
      })
      this.gltfLoader.load(sphere, gltf => {
        this.model2 = gltf.scene
        this.model2.position.set(2,2,3)
        this.model2.scale.set(1.5, 1.5, 1.5)
        this.model2.traverse((elements) => {          
          if (elements.type === 'Mesh') {
            elements.castShadow = true
            elements.receiveShadow = true
            elements.material.metalness = 0.2
            elements.material.roughness = 0.6
          }
        })
        this._setMaterial(this.model2)
        this.scene.add(this.model2)
        // console.log(this.model)        
      })
      this.manager.onLoad = function () {  
        console.log('done')
        resolve()
      }
    })
  }

  _addListeners() {
    window.addEventListener('resize', this._resizeCb, { passive: true })
    // window.addEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeCb, { passive: true })
    window.removeEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _onResize() {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    // this._checkMobile()
  }
}

const getWebgl = () => {
	return App.instance
}

export { getWebgl }