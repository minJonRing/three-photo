<template>
  <div class="home">
    <div class="canvas" ref="container"></div>
    <div class="btns">
      <div class="btn a" @click="handleScale">放大指定内容</div>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as TWEEN from '@tweenjs/tween.js'

// @ is an alias to /src
import createCamera from '@/components/camera'
import createScene from '@/components/scene'
import { onMounted, ref } from 'vue'
// assets
export default {
  name: 'Home',
  setup() {
    const address = {
      0: { position: { x: 0, y: 10, z: 30 }, rotation: { x: 0, y: 0, z: 0 } },
      1: { position: { x: 0, y: 5, z: 5 }, rotation: { x: 0, y: 0, z: 0 } },
    }
    const active = ref(0);
    const container = ref()
    const { scene } = createScene(THREE)
    const { camera } = createCamera(THREE)
    camera.position.set(0, 10, 50)
    scene.add(camera)
    scene.background = new THREE.Color(0x87ceeb)
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    //  load model
    let mixer = null
    const gltfLoader = new GLTFLoader()
    gltfLoader.load('/models/ultimate_platformer_pack/scene.gltf', gltf => {
      console.log(gltf)
      mixer = new THREE.AnimationMixer(gltf.scene)
      // // 使用clipAction()方法将索引为0的AnimationClip添加到混合器中
      // // 这个方法会返回一个AnimationAction
      const action = mixer.clipAction(gltf.animations[0])
      // // 使用play()方法调用这个AnimationAction
      action.play()
      scene.add(gltf.scene.children[0])
    })

    // 添加平行光
    const directionalColor = '#fff'
    const directionalLight = new THREE.DirectionalLight(directionalColor)
    directionalLight.position.set(6.357, 10, 10)
    directionalLight.castShadow = true
    directionalLight.intensity = 1
    scene.add(directionalLight)

    // 相机旋转
    const animateCamera = (position, rotation) => {

      //相机 - 位置动画
      const a1 = new TWEEN.Tween(camera.position)
        .to(position, 1800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function (e) {
          TWEEN.remove(this)
        })
      //相机 - 旋转动画
      const a2 = new TWEEN.Tween(camera.rotation)
        .to(rotation, 1800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start()
        .onComplete(function () {
          TWEEN.remove(this)
        })
      function animate() {
        a1.update()
        a2.update()
        requestAnimationFrame(animate)
      }
      animate()
    }

    const init = () => {
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
      container.value.appendChild(renderer.domElement);
    }

    const clock = new THREE.Clock()
    const animate = () => {
      // 浏览器自动渲染下一帧

      // 渲染到页面
      renderer.render(scene, camera);
      // TWEEN.upload()
      // console.log(mixer)
      const time = clock.getDelta()
      if (mixer) {
        mixer.update(time)
      }
      requestAnimationFrame(animate);
    }

    onMounted(() => {
      init()

      animate()
    })

    const handleScale = () => {
      if (active.value) {
        active.value = 0
      } else {
        active.value = 1
      }
      const { position, rotation } = address[active.value]
      animateCamera(position, rotation);
    }
    return {
      container,
      handleScale
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  height: 100%;

  .canvas {
    height: 100%;
  }

  .btns {
    position: absolute;
    top: 0;
    left: 0;

    .btn {
      background-color: #fff;
      padding: 9px;
      font-size: 14px;
    }
  }
}
</style>
