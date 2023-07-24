<template>
  <!-- 导航栏 -->
  <navbar>
    <template v-slot:right>
      <div class="right-container">
        <button class="back" @click="routerBack">{{$t('back')}}</button>
      </div>
    </template>
  </navbar>
  <div 
    class="canvas_box"
    v-loading="loading"
    element-loading-text="Loading..."
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(122, 122, 122, 0.8)"
  >
    <!-- 侧边栏 -->
    <div class="canvas_left_aside" :style="iconFlag === true ? 'margin-left: -0px;' : 'margin-left: -220px;'">
      <!-- 侧边栏编辑颜色 -->
      <el-aside class="aside_box">
        <div class="aside_box_warpper">
          <el-scrollbar id="scrollbar_box_div" wrap-class="scrollbar-wrapper">
            <div :style="{height: (information.Meshes.length + 1) * 40 + 'px'}">
              <ul id="collapse_list">
                <li @click="showModelInformation()">
                  <span>{{ $t('models') }}</span>
                </li>
                <li v-for="(item, index) in information.Meshes" :key="index" :class="itemActive === index ? 'active' : ''" @click="editDiv($event, item, index)">
                  <el-color-picker v-model="item.Color" show-alpha @change="changeColor(item)" />
                  <span>{{ item.label }}</span>
                </li>
              </ul>
            </div>
          </el-scrollbar>
        </div>
      </el-aside>
      <!-- 弹出缩回图标 -->
      <i :class="iconFlag?'el-icon-caret-left icon_open':'el-icon-caret-right icon_close'" @click="EventOpen()" />
    </div>

    <div class="canvas_main">
      <!-- 单个 -->
      <div class="canvas_tag" v-show="showOne" @click.stop="onCanvasTagMouseClick($event)">
        <el-form v-if="!showSwitch" v-model="objChildren" size="small">
          <el-form-item
            class="diag-item"
            prop="label"
            :label="$t('label')"
            width="180"
          >
            {{ objChildren.label }}
          </el-form-item>
          <el-form-item
            class="diag-item"
            prop="name"
            :label="$t('names')"
            width="180"
          >
            <el-input v-model="objChildren.MeshName" :placeholder="$t('namesPlace')" />
          </el-form-item>
          <el-form-item
            class="diag-item"
            prop="Describe"
            :label="$t('describe')"
            width="180"
          >
            <el-input v-model="objChildren.Describe" type="textarea" :placeholder="$t('describePlace')" />
          </el-form-item>
          <el-form-item
            class="diag-item"
            prop="size"
            :label="$t('size')"
            width="180"
          >
            <el-input v-model="objChildren.Size" :placeholder="$t('sizePlace')" />
          </el-form-item>
          <el-form-item class="diag-item" :label="$t('label')">
            <el-select v-model="objChildren.Tags" clearable multiple filterable allow-create default-first-option :placeholder="$t('labelPlace')" />
          </el-form-item>
          <el-form-item class="diag-item" :label="$t('colorAlpha')">
            <el-color-picker v-model="objChildren.Color" show-alpha @change="changeColor(objChildren)" />
          </el-form-item>
          <el-form-item>
            <el-button style="float:right; margin-top: 10px" type="primary" size="small" @click.stop="changeShow($event)"> {{ $t('confirm') }} </el-button>
          </el-form-item>
        </el-form>


        <el-form v-else size="small">
          <el-form-item
            prop="light"
            :label="$t('light')"
            width="180"
          >
            <el-input v-model="information.light" type="number" :placeholder="$t('lightPlace')" />
          </el-form-item>
          <el-form-item
            prop="show"
            :label="$t('descFlag')"
            width="180"
          >
            <el-switch
              v-model="information.show"
            />
          </el-form-item>
          <el-form-item
            prop="name"
            :label="$t('names')"
            width="180"
          >
            <el-input v-model="information.name" :placeholder="$t('namesPlace')" />
          </el-form-item>
          <el-form-item
            prop="Describe"
            :label="$t('describe')"
            width="180"
          >
            <el-input v-model="information.Describe" type="textarea" :placeholder="$t('describePlace')" />
          </el-form-item>
          <el-form-item>
            <el-button style="float:right; margin-top: 10px" type="primary" size="small" @click.stop="changeShow($event)"> {{ $t('confirm') }}} </el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- <div class="loading_box" v-show="loading">
        <i class="el-icon-loading" />
        <p>加载中...</p>
      </div> -->
      <canvas class="canvas" />
      <!-- <div class="canvas_button">
        <el-button type="primary" size="small">{{ $t('save') }}</el-button>
      </div> -->
    </div>
  </div>
</template>
<script>
import navbar from '../components/nav/navbar.vue'
import { getOrder } from '@/api/orders.js'
import * as Three from 'three'
import * as global from '@/utils/global.js'
import OrbitControls from 'three-orbitcontrols'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import TWEEN from 'tween.js'
import { getToken } from '@/utils/auth.js'

let loadingSvg = `
  <path class="path" d="
    M 30 15
    L 28 17
    M 25.61 25.61
    A 15 15, 0, 0, 1, 15 30
    A 15 15, 0, 1, 1, 27.99 7.5
    L 15 15
  " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
`

const informationObj = {
  name: '',
  light: 1,
  show: false,
  Describe: '',
  flag: false,
  Meshes: []
}
let scene = null,
    object = null,
    camera = null,
    mouse = null,
    renderer = null,
    raycaster = null,
    parent = null,
    center = null,
    controls = null,
    ambientLight = null,
    directionalLight = null,
    pointLight = null,
    intersectObj = null

export default {
  name: 'model',
  components: {
    navbar
  },
  data() {
    return {
      svg: loadingSvg,
      headers: {},
      order: null,
      id: null,
      // 用来判断是第一次进行保存还是进行编辑 true表示新增编辑
      flag: null,
      objChildren: {
        label: '',
        MeshName: '',
        Size: '',
        Tags: []
      },
      loading: true,
      // 进度百分比
      percentage: 0,
      // 模型详情
      modelDetail: null,
      // 点击显示弹框进行编辑，控制弹框的显示和隐藏
      showOne: false,
      // 排除div 点击
      divShow: false,
      // 显示模型总览还是显示子模型编辑 true为模型总览
      showSwitch: null,
      // 订单的modelTag 需要JSON解析
      information: Object.assign({}, informationObj),
      texture: '',
      modelObj: '',
      // camera: null,
      // scene: null,
      // mouse: null,
      // renderer: null,
      // raycaster: null,
      // 模型
      // object: null,
      // 模型父组件
      // parent: null,
      // 模型中心
      // center: null,
      // 控制器
      // controls: null,
      // 材质基本信息
      texturePro: {},
      // ambientLight: null,
      // directionalLight: null,
      // pointLight: null,
      // 点击获取到的模型
      // intersectObj: null,
      url: global.modelUrl,
      iconFlag: true,
      itemActive: 0,
      styleObject: {
        height: 0
      }
    }
  },
  created() {
    this.id = this.$route.query.id
    this.initOrder()
  },
  unmounted() {
    // const canvas1 = document.getElementsByClassName('canvas')[0]
    // canvas1.removeEventListener('click', this.onDocumentMouseClick, false)
    window.removeEventListener('resize', this.onWindowResize, false)
  },
  watch: {
    modelDetail() {
      this.$nextTick(() => {
        this.init()
        this.loadModel()
        this.animate()
      })
    },
    'information.light'(newValue) {
      if (ambientLight != null) {
        ambientLight.intensity = newValue
      }
    }
  },
  methods: {
    getToken() {
      const token = getToken()
      if (token && token !== 'Bearer null' && token!== 'Beare undefined') {
        this.headers['authorization'] = getToken()
      }
    },
    // 初始化订单信息
    initOrder() {
      getOrder(this.id)
        .then(res => {
          if (res.code === 20000) {
            this.order = res.data
            this.getModel()
          } else {
            this.$message({
              message: this.$t('initOrderFail'),
              type: 'error',
              duration: 1500
            })
            this.$router.back(-1)
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.$router.back(-1)
        })
    },
    // 初始化订单后初始化模型数据
    getModel() {
      let modelDetail = JSON.parse(this.order.modelData)
      this.modelDetail = modelDetail
      if (this.order.modelTag) {
        this.information = JSON.parse(this.order.modelTag)
      } else {
        this.information = Object.assign({}, informationObj)
      }
      if (this.information != null && this.information !== undefined) {
        if (!this.information.flag) {
          this.flag = true
          this.information = Object.assign({}, informationObj)
        } else {
          this.flag = false
        }
      } else {
        this.information = Object.assign({}, informationObj)
        this.flag = true
      }
    },
    init() {
      this.initScene()
      this.initCamera()
      this.initRenderer()
      this.initLight()
      this.initControls()
      this.initModel()
      this.initTexturePro()
    },
    animate() {
      requestAnimationFrame(this.animate)
      controls.update()
      directionalLight.position.copy(camera.position)
      TWEEN.update()
      renderer.render(scene, camera)
    },
    LoadTexturePro(t, child) {
      if (t.disable) {
        return
      }

      if (t.emissive == '0x') {
        t.emissive = '0xffffff'
      }

      function getColor(s) {
        var c = 0x0
        try {
          if (s == '0x') {
            c = new Number('0x0')
          } else {
            c = new Number(s)
          }
        } catch (e) {
          console.log(e)
        }

        return c
        // return parseInt(s,16);
      }

      var pro = {
        color: t.color,
        specular: getColor(t.specular),
        shininess: getColor(t.shininess),
        emissive: getColor(t.emissive),
        emissiveIntensity: t.emissiveIntensity,
        bumpScale: t.bumpScale,
        normalScale: t.normalScale,
        displacementScale: t.displacementScale,
        displacementBias: t.displacementBias,
        transparent: t.transparent,
        opacity: t.opacity,
        castShadow: t.castShadow,
        receiveShadow: t.receiveShadow,
        combine: t.combine,
        reflectivity: t.reflectivity,
        clearCoat: t.clearCoat,
        clearCoatRoughness: t.clearCoatRoughness,

        refractionRatio: t.refractionRatio,
        roughness: t.roughness,
        metalness: t.metalness,
        envMapIntensity: t.envMapIntensity,
        side: t.side,
        aoMapIntensity: t.aoMapIntensity,
        // side:t.side,
        wireframe: t.wireframe,
        wireframeLinewidth: t.wireframeLinewidth,
        wireframeLinecap: t.wireframeLinecap,
        wireframeLinejoin: t.wireframeLinejoin
      }
      var m
      switch (t.type) {
        case 'MeshPhongMaterial':
          m = new Three.MeshPhongMaterial(pro)
          break
        case 'MeshPhysicalMaterial':
          m = new Three.MeshPhysicalMaterial(pro)
          break
        case 'MeshLambertMaterial':
          m = new Three.MeshLambertMaterial(pro)
          break
        default :
          m = new Three.MeshPhongMaterial(pro)
          break
      }

      child.material = m
      child.material.skinning = true
      child.castShadow = t.castShadow
      child.receiveShadow = t.receiveShadow
    },
    loadModel() {
      parent.remove(object)
      this.percentage = 0
      // 相机的位置设为初始化的位置
      this.initCamera()
      this.initControls()
      var _this = this
      function loadObjModel() {
        if (_this.flag == true) {
          _this.information.label = object.name
          _this.information.Meshes = []
          for (var i = 0; i < object.children.length; i++) {
            // const mesh = new meshObj()
            var meshObj = {
              label: '',
              MeshName: '',
              Size: '',
              Tags: [],
              Color: ''
            }
            meshObj.label = object.children[i].name
            let material = object.children[i].material.length ? object.children[i].material[0] : object.children[i].material
            meshObj.Color = 'rgba(' + material.color.r * 255 + ',' +
              material.color.g * 255 + ',' +
              material.color.b * 255 + ',' +
              material.opacity + ')'
            _this.information.Meshes.push(meshObj)
          }
        }
        object.traverse(function(child) {
          if (_this.texture != null && _this.texture != '') {
            _this.texturePro.map = _this.texture
          }
          if (child.isMesh) {
            var c = _this.getMeshByName(child.name)
            if (c.Color && c.Color != null && c.Color != '') {
              var rgba = _this.getRgba(c.Color)
              if (rgba.length != 0) {
                _this.texturePro.color = new Three.Color(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255)
                _this.texturePro.opacity = rgba[3]
              } else {
                _this.texturePro.color = child.material.color
                _this.texturePro.opacity = child.material.opacity
              }
            } else {
              _this.texturePro.color = child.material.color
              _this.texturePro.opacity = child.material.opacity
            }
            var g = child.geometry
            if (child.geometry.isBufferGeometry) {
              g = new Three.Geometry()
              g.fromBufferGeometry(child.geometry)
            }

            g.mergeVertices()
            g.computeFlatVertexNormals()
            g.computeVertexNormals()
          }

          _this.LoadTexturePro(_this.texturePro, child)
        })
        parent.add(object)
      }

      var manager = new Three.LoadingManager(loadObjModel)
      manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total)
      }
      if (this.modelDetail.mapName.length != 0) {
        var textureLoader = new Three.TextureLoader(manager)
        // 腾讯云
        // _this.texture = textureLoader.load(this.url + this.modelDetail[0].mapData[0]) globalURL
        // let url = `${global.network.baseURL}${global.network.getFile('common')}${_this.modelDetail.mapName[0]}`,
        let url = `${global.network.globalURL}${global.network.getFile('common')}${_this.modelDetail.mapName[0]}`,
          xhr = new XMLHttpRequest()
        xhr.open('get', url, true)
        xhr.setRequestHeader('authorization', getToken())
        xhr.responseType = 'blob'
        xhr.onload = function () {
          _this.texture = textureLoader.load(this.response)
        }
        xhr.send()
      }
      function onProgress(xhr) {
        if (xhr.lengthComputable) {
          const percentComplete = xhr.loaded / xhr.total * 100
          _this.percentage = Math.round(percentComplete, 2)
          if (_this.percentage === 100) {
            // document.getElementById('canvas_center').style.display = 'none'
          }
        } else {
          //
        }
      }
      function onError(xhr) {
        console.log(xhr)
        // alert(' failed! because of error ' + xhr.target.status + ', ' + xhr.target.statusText)
        console.log('a error happen')
      }
      var loader = new FBXLoader(manager)
      // loader.load(`${global.network.baseURL}${global.network.getFile('model')}${_this.modelDetail.modelName}`, function(obj) {
      //   console.log(obj)
      //   object = obj
      //   _this.loading = false
      //   _this.setMesh()
      // }, onProgress, onError)
      
      console.log(`${global.network.globalURL}${global.network.getFiles('model')}${_this.modelDetail.modelName}`)
      loader.load(`${global.network.globalURL}${global.network.getFiles('model')}${_this.modelDetail.modelName}`, function(obj) {
        console.log(obj)
        object = obj
        _this.loading = false
        _this.setMesh()
      }, onProgress, onError)
    },
    // 初始化场景
    initScene() {
      scene = new Three.Scene()
      mouse = new Three.Vector2()
    },
    // 初始化相机
    initCamera() {
      var canvas = document.getElementsByClassName('canvas')[0]
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      camera = new Three.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100000000)
      camera.position.z = 2000
      camera.lookAt(new Three.Vector3(0, 0, 0))
    },
    // 初始化渲染器
    initRenderer() {
      const canvas1 = document.getElementsByClassName('canvas')[0]
      renderer = new Three.WebGLRenderer({
        canvas: canvas1,
        antialias: true,
        autoClear: true,
        logarithmicDepthBuffer: true
      })
      const gl = canvas1.getContext('webgl2')
      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.BACK)
      renderer.physicallyCorrectLights = true
      renderer.shadowMapEnabled = true
      renderer.shadowMap.type = 2
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(canvas1.clientWidth, canvas1.clientHeight)
      // canvas1.addEventListener('click', this.onDocumentMouseClick, false)
      window.addEventListener('resize', this.onWindowResize, false)
    },
    // 初始化灯光
    initLight() {
      if (this.flag) {
        ambientLight = new Three.AmbientLight(0xAFAFAF, 1)
      } else {
        ambientLight = new Three.AmbientLight(0xAFAFAF, this.information.light)
      }
      ambientLight.name = 'AmbientLight '
      scene.add(ambientLight)
      directionalLight = new Three.DirectionalLight(0xffffff, 2)
      directionalLight.name = '_bindCamera'
      directionalLight.position.set(0, 10000, 0)
      directionalLight.lookAt(new Three.Vector3(0, 0, 0))
      scene.add(directionalLight)
    },
    // 初始化控制器
    initControls() {
      controls = new OrbitControls(camera, renderer.domElement)
      // 使动画循环使用时阻尼或自转 意思是否有惯性
      controls.enableDamping = true
      // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
      controls.dampingFactor = 0.25
      // 是否可以缩放
      controls.enableZoom = true
      // 是否自动旋转
      controls.autoRotate = false
      // // 设置相机距离原点的最远距离
      // controls.minDistance = 200
      // // 设置相机距离原点的最远距离
      // controls.maxDistance = 300
      // 是否开启右键拖拽
      controls.enablePan = true
    },
    initModel() {
      // 如果模型列表中只显示只有一个。上个模型和下个模型隐藏
      parent = new Three.Group()
      scene.add(parent)
    },
    initTexturePro() {
      // 是否废掉
      this.texturePro.disable = false
      this.texturePro.polygonOffset = true
      this.texturePro.polygonOffsetFactor = 0.75
      this.texturePro.polygonOffsetUnits = 4.0
      this.texturePro.new = 'new'
      this.texturePro.old = 'old'

      this.texturePro.type = 'MeshPhongMaterial'
      this.texturePro.map = {}// 基本贴图
      this.texturePro.depthTest = false
      this.texturePro.depthWrite = false
      this.texturePro.aoMap = {}
      this.texturePro.aoMapIntensity = 1// ao强度

      this.texturePro.specular = '0x111111'// 镜面颜色
      this.texturePro.specularMap = {}
      this.texturePro.shininess = 30// 镜面反射强度

      this.texturePro.emissive = '0xffffff'// 高光颜色
      this.texturePro.emissiveMap = {}// 高光贴图
      this.texturePro.emissiveIntensity = 0// 高光轻度

      this.texturePro.bumpMap = {}// 凹凸贴图
      this.texturePro.bumpScale = 1// 凹凸高度/深度

      this.texturePro.normalMap = {}// 法向贴图
      this.texturePro.normalScale = new Three.Vector2(1, 1)// 法向深度

      this.texturePro.displacementMap = {}// 位移贴图
      this.texturePro.displacementScale = 1// 位移值
      this.texturePro.displacementBias = 0// 位移偏差

      this.texturePro.alphaMap = {}// 透明贴图

      this.texturePro.transparent = true// 是否透明
      this.texturePro.opacity = 1// 透明度

      // 灯光贴图
      this.texturePro.lightMap = {}
      this.texturePro.lightMapIntensity = 1// 灯光贴图强度强度

      this.texturePro.castShadow = false
      this.texturePro.receiveShadow = false

      this.texturePro.envMap = {}// 环境贴图
      this.texturePro.envMapShowType = 1
      this.texturePro.envMapOn = false
      this.texturePro.envMapOn2 = false

      this.texturePro.combine = Three.MultiplyOperation// 组合
      // Options are MultiplyOperation (default), MixOperation, AddOperation. If mix is chosen, the reflectivity is used to blend between the two colors.
      this.texturePro.envMapTypeSet = 0// 反射
      this.texturePro.reflectivity = 1// 反射率
      this.texturePro.refractionRatio = 0.98// 折射率

      this.texturePro.side = Three.FrontSide// 渲染面
      this.texturePro.wireframe = false
      this.texturePro.wireframeLinewidth = 1
      this.texturePro.wireframeLinecap = 'round1'// butt", d"round" and "square
      this.texturePro.wireframeLinejoin = 'round2'// d round", "bevel" and "miter"
      this.texturePro.mapping = Three.EquirectangularReflectionMapping
      this.texturePro.magFilter = Three.LinearFilter
      this.texturePro.minFilter = Three.LinearFilter
    },
    // ============  事件类  ============
    onDocumentMouseClick(event) {
      const mainCanvas = document.getElementsByClassName('canvas')[0]
      mouse.x = ((event.clientX - mainCanvas.getBoundingClientRect().left) / mainCanvas.offsetWidth) * 2 - 1// 标准设备横坐标
      mouse.y = -((event.clientY - mainCanvas.getBoundingClientRect().top) / mainCanvas.offsetHeight) * 2 + 1// 标准设备纵坐标
      var vector = new Three.Vector3(mouse.x, mouse.y, 0.5).unproject(camera)
      raycaster = new Three.Raycaster(camera.position, vector.sub(camera.position).normalize())
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      // 如果获取到点击对象
      if (intersects.length > 0) {
        this.showSwitch = false
        intersectObj = intersects[0].object
        this.showOne = true
        this.objChildren = this.getMeshByName(intersectObj.name)
      } else if (this.divShow) {
        this.showOne = true
      } else {
        this.showOne = false
      }
    },
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    // 点击返回按钮
    routerBack() {
      this.$router.back(-1)
    },
    // ================= 工具类 =================
    getMeshByName(label) {
      for (var i = 0; i < this.information.Meshes.length; i++) {
        this.itemActive = i
        if (label == this.information.Meshes[i].label) {
          return this.information.Meshes[i]
        }
      }
    },
    getRgba(rgba) {
      return rgba.match(/(\d(\.\d+)?)+/g)
    },
    setMesh() {
      const _this = this
      // 将模型设置于中心位置
      const box = new Three.Box3().setFromObject(object)
      center = box.getCenter()
      object.position.x = 0 - center.x
      object.position.y = 0 - center.y
      object.position.z = 0 - center.z
      var c = camera
      var min = c.min ? c.min : 4
      var max = c.max ? c.max : 4

      var tsize = box.getSize()
      var val = tsize.y

      if (val < tsize.x) {
        val = tsize.x
      }
      if (val < tsize.z) {
        val = tsize.z
      }

      var x = camera.position.x
      var y = camera.position.y
      var z = val / (2 * Math.tan(camera.fov * Math.PI / 360)) * 2
      var v = new Three.Vector3(x, y, z)

      controls.minDistance = v.z / min
      camera.min = min
      controls.maxDistance = v.z * max
      camera.max = max
      c.position.x = v.x
      c.position.y = v.y
      var valMax = Math.max(Math.max(tsize.y, tsize.x), tsize.z)
      if (valMax < v.z) { c.position.z = v.z } else { c.position.z = valMax }
    },
    changeAnnoattion(position) {
      var _this = this
      var tween1 = new TWEEN.Tween(camera.position).to({
        x: position.x,
        y: position.y,
        z: position.z
      }, 1000).onUpdate(function() {
        // camera.lookAt(new Three.Vector3(0, 0, 0))
      }).onComplete(function() {}).start()
    },
    // ================= 事件类 =================
    //点击模型总览弹出框
    showModelInformation(e) {
      e.stopPropagation()
      this.divShow = true
      this.showSwitch = true
    },
    // 点击侧边栏中的一项
    editDiv(e, item, index) {
      e.stopPropagation()
      e.preventDefault()
      this.itemActive = index
      this.showSwitch = false
      this.divShow = true
      this.objChildren = item
      if (object != null) {
        for (var i = 0; i < object.children.length; i++) {
          if (object.children[i].name == item.label) {
            intersectObj = object.children[i]
            intersectObj.geometry.computeBoundingBox()
          }
        }
      }
    },
    // 侧边栏项改变颜色
    changeColor(item) {
      var rgb = this.getRgba(item.Color)
      intersectObj = object.getObjectByName(item.label)
      intersectObj.material.color.r = rgb[0] / 255
      intersectObj.material.color.g = rgb[1] / 255
      intersectObj.material.color.b = rgb[2] / 255
      intersectObj.material.opacity = rgb[3]
      for (var i = 0; i < object.children.length; i++) {
        if (object.children[i].material.opacity < 1) {
          object.children[i].material.transparent = true
          object.children[i].material.depthWrite = false
        } else {
          object.children[i].material.transparent = false
          object.children[i].material.depthWrite = true
        }
      }
       var centroid = new Three.Vector3()
      centroid.addVectors(intersectObj.geometry.boundingBox.min, intersectObj.geometry.boundingBox.max)
      centroid.multiplyScalar(0.5)

      centroid.applyMatrix4(intersectObj.matrixWorld)

      this.changeAnnoattion(centroid)
    },
    changeShow(e) {
      e.preventDefault()
      this.showSwitch = null
      this.divShow = false
      this.showOne = false
    },
    // 点击侧边栏隐藏显示
    EventOpen() {
      this.iconFlag = !this.iconFlag
    },
    // 弹出框点击事件
    onCanvasTagMouseClick(e) {
      e.stopPropagation()
      e.preventDefault()
      
      this.showOne = true
      this.divShow = true
    }
  }
}
</script>
<style lang="scss" >

</style>
<style lang="scss" scoped>
#app {
  padding: 0;
}
#scrollbar_box_div {
  height:100%;
  overflow-x:hidden;
}
.el-scrollbar__wrap{
  overflow-x:hidden !important
}
.canvas_box{
  // padding-top: 60px;
  border: 1px solid #bdbdbd;
  overflow: hidden;
  display:flex;
  // height:100%
  height: calc(100% - 60px);

}
.canvas_left_aside{
  flex:0 0 auto;
  position: relative;
}
.canvas_left_aside,.el-aside{
  width:220px;
  // height:calc(100vh - 86px);
  height: 100%;
  background: #3c3c3c;
  color: #e8e8e8;
}
.canvas_left_aside .el-icon-caret-left.icon_open,.canvas_left_aside .el-icon-caret-right.icon_close{
  font-size: 20px;
  // 111
  height: 40px;
  width: 20px;
  position: absolute;
  right: -20px;
  z-index: 999;
  border: 1px solid #716d6d;
  top: 50%;
  color: #fff;
  padding: 10px 0px 10px 0;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border-left:transparent
}
.icon_open {
  
  background: no-repeat url("../assets/images/left.png") center;
  background-color: #3c3c3c;
}
.icon_close {
  background: no-repeat url("../assets/images/right.png") center;
  background-color: #3c3c3c;
}
.aside_box{
  width:220px !important;
}
.aside_box_warpper{
  height:100%
}
.canvas_main{
  flex:1 1 auto;
  width:100%;
  overflow: hidden;
  // height:calc(100vh - 86px);
  height: 100%;
  position:relative;
  display:block;
  margin: 0;
}
.canvas_tag{
  background: #3c3c3c5c;
  position: absolute;
  z-index: 1;
  width: 220px;
  padding: 10px;
  border: 1px solid #777171;
  border-radius: 10px;
  right:0;
  top:60px;
  color:#fff;
}
.list_box{
  padding:10px;

}
#collapse_list{
  list-style: none;
  padding:0
}
#collapse_list li{
  padding:0 10px;
  font-size:14px;
  line-height: 40px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
#collapse_list li:hover{
  color:#ffd401
}
#collapse_list li.active,#collapse_list li:active{
  color: #ffd401;
  border-left: 2px solid #ffd401;
}
#collapse_list .el-collapse-item__content{
  padding-bottom:0px;
}

#collapse_list .el-collapse-item__content .el-form> .el-form-item--small.el-form-item,
.canvas_tag .el-form> .el-form-item--small.el-form-item {
  margin-bottom:0
}
.el-collapse-item__header{
  padding-left:10px;
}
.canvas_tag .el-form .el-form-item--small.el-form-item >.el-form-item__label{
  color:#ffba3c;
}
.canvas_tag .el-form .el-form-item--small.el-form-item .el-form-item__content .el-input.el-input--small >.el-input__inner,
.canvas_tag .el-form .el-form-item--small.el-form-item .el-form-item__content .el-textarea.el-input--small > .el-textarea__inner{
  background: transparent;
  border:1px solid #ffba3c;
  color: #fff;
}

.canvas{
  display: block;
  outline: none;
}
.canvas_button{
  position:absolute; right:10px; top:10px; z-index:1001;width:60px
}
#canvas_center{
  position: absolute;z-index: 1000;top:50%;left:50%;
}
.diag-item {
  margin-bottom: 10px!important;
}


// =====================================================================
.right-container {
  display: flex;
  height: 100%;
  align-items: center;
  button.back {
    padding: 0 15px;
    height: 30px;
    line-height: 25px;
    background-color: transparent;
    border: 2px solid #fff;
    border-radius: 4px;
    color: #fff;
    margin-right: 1.25rem;
    cursor: pointer;
  }
  button:active {
    transform: translateY(1px);
  }
}
.app-main{
  min-height: 100vh;
  height: 100Vh;
}
.el-select__input{
  color:#fff
}
@media screen and (width: 1920px) {
  .canvas{
    min-height: 650px;
  }
}
.loading_box{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-25px,-50%);
  color: #409eff;

}
.loading_box .el-icon-loading{
  font-size: 50px;
}
</style>
