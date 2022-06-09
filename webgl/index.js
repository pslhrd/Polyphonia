import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  AmbientLight,
  AnimationMixer,
  Clock,
  Group,
  AxesHelper,
  Fog,
  Vector2,
  Object3D,
  Color,
  LoadingManager,
  DirectionalLight,
  CameraHelper,
  DirectionalLightHelper,
  PMREMGenerator,
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
import model from '/models/v1.gltf'
import scene from '/models/SCENE_01.gltf'
import cubeMap from '/hdr/cannon.hdr'

function lerp (start, end, amt) { return (1 - amt) * start + amt * end }
// import Stats from 'stats'
// document.body.appendChild(stats.dom)

export class App {
  static instance;

  constructor(canvas) {
    this.canvas = canvas
    App.instance = this;

    this.lerp = (start, end, amt) => (1 - amt) * start + amt * end
    
    this._resizeCb = () => this._onResize()
    this._mousemoveCb = e => this._onMousemove(e)
  }

  init() {
    this._createScene()
    this._createCamera()
    this._createRenderer()
    this._createControls()
    // this._generateHDR()
    this._createProps()
    this._loadModel().then(() => {
      this._addListeners()
      console.log(this.reference)
      this.renderer.setAnimationLoop(() => {
        this.delta = this.clock.getDelta()
        this.time = this.clock.getElapsedTime()
        this._render()
        this.reference.set(
          this.lerp(this.reference.x, this.mouseX, 0.05),
          this.lerp(this.reference.y + 0.2, 1 - this.mouseY, 0.05),
          this.reference.y
        )
        this.camera.lookAt(this.reference)
        this.controls.update()
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
    this.clock = new Clock()
    this.meshes = []
  }

  _createProps() {
    const ambient = new AmbientLight(0xffffff, 0.8)
    const directional = new DirectionalLight(0xffffff, 0.5)
    const axesHelper = new AxesHelper(5)
    
    this.mouseX = 0
    this.mouseY = 0

    let d = 30
    console.log(directional)
    directional.castShadow = true
    directional.shadow.mapSize.width = 2048
    directional.shadow.mapSize.height = 2048
    directional.position.set(10,10,10)
    directional.target.position.set(500,500,500)
    directional.shadow.bias = -0.004
    directional.shadow.camera.near = d * 0.01
    directional.shadow.camera.far = d 
    directional.shadow.camera.right = d
    directional.shadow.camera.left = -d
    directional.shadow.camera.top = d
    directional.shadow.camera.bottom = -d

    const helper = new DirectionalLightHelper( directional, 20 )
    const helper2 = new CameraHelper( directional.shadow.camera )

    this.scene.add(axesHelper, ambient, directional)
    this.scene.fog = new Fog(0xD0DCE9, 75, 100)
  }

  _createCamera() {
    // this.reference = new Vector3(0, 0 , 0)
    this.camera = new PerspectiveCamera(75, this.canvas.clientWidth / this.canvas.clientHeight, 0.001, 1000)
    this.camera.position.set(5, 5, 20)
    // this.camera.lookAt(this.reference)
    // console.log(this.camera.lookAt)
  }

  _generateHDR() {
    let generator = new PMREMGenerator(this.renderer)
    const hdr = new RGBELoader().load(cubeMap, (map) => {
      this.envmap = generator.fromEquirectangular(map)
    })
  }

  _setMaterial(model) {
    let generator = new PMREMGenerator(this.renderer)
    const hdr = new RGBELoader().load(cubeMap, (map) => {
      this.envmap = generator.fromEquirectangular(map)
      model.traverse((elements) => {          
        if (elements.type === 'Mesh') {
          elements.material.envMapIntensity = 1.6
          elements.material.envMap = this.envmap.texture
          elements.material.envMapIntensity = elements.userData.envMap
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

  _onMousemove(e) {
    this.mouseX = e.clientX / window.innerWidth * 2 - 1
    this.mouseY = e.clientY / window.innerHeight * 2 - 1
  }
  _createRenderer() {
    const color = new Color(0xD0DCE9)
    this.renderer = new WebGLRenderer({
      alpha: true,
      // background: color,
      canvas: this.canvas,
      antialias: window.devicePixelRatio === 1
    })

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(2)
    this.renderer.shadowMap.enabled = true
    this.renderer.outputEncoding = 3001
  }

  _loadModel() {
    this.manager = new LoadingManager()
    this.gltfLoader = new GLTFLoader(this.manager)
    return new Promise(resolve => {
      // this.gltfLoader.load(model, gltf => {
      //   this.model = gltf.scene
      //   this.children = gltf.scene.children
      //   this.model.position.set(0,0,2)
      //   this.model.traverse((elements) => {          
      //     if (elements.type === 'Mesh') {
      //       elements.castShadow = true
      //       elements.receiveShadow = true
      //       elements.speed = Math.random()
      //       elements.material.roughness = elements.userData.roughness
      //       elements.material.metalness = elements.userData.metalness
      //       console.log(elements.material.roughness)
            
      //     }
      //   })
      //   this._setMaterial(this.model)
      //   this.scene.add(this.model)
        
      // })
      this.gltfLoader.load(scene, gltf => {
        this.sceneGL = gltf.scene
        this.sceneGL.castShadow = true
        this.sceneGL.receiveShadow = true
        this.gltfCamera = gltf.cameras[0]
        this.camera = this.gltfCamera
        this.sceneGL.traverse((element) => {          
          if (element.name === 'Reference') {
            this.reference = new Vector3(element.position.x, element.position.y, element.position.z)
            this.camera.lookAt(this.reference)
          }
          if (element.type === 'Mesh') {
            element.castShadow = true
            element.receiveShadow = true
            // element.material.roughness = 0.4
            // element.material.metalness = 0.6
          }
        })
        // this._setMaterial(this.sceneGL)
        this.sceneGL.position.set(0,0,0)
        this.scene.add(this.sceneGL)
        console.log(this.sceneGL)    
      })
      this.manager.onLoad = function () {  
        console.log('done')
        resolve()
      }
    })
  }
  _addListeners() {
    window.addEventListener('resize', this._resizeCb, { passive: true })
    window.addEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _removeListeners() {
    window.removeEventListener('resize', this._resizeCb, { passive: true })
    window.removeEventListener('mousemove', this._mousemoveCb, { passive: true })
  }

  _onResize() {
    console.log('resize')
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