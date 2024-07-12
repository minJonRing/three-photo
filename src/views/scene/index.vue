<template>
    <div class="home">
        <canvas id="container"></canvas>
    </div>
</template>

<script>
// import { init, animate } from './index'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ImagePlane from '@/assets/textures/plane.jpg'
export default {
    data() {
        return {
            canvas: null,
            // camera: null,
            // scene: null,
            // renderer: null,
            clock: null,
            keyState: {},
            moveDirection: { forward: 0, right: 0 },
            moveObject: null
        }
    },
    mounted() {
        this.createCanvas()
        // 
        this.createScene()
        this.createCamera()
        this.createLight()
        this.createRenderer()
        this.init()
        this.clock = new THREE.Clock()
        // 动画
        this.renderer.setAnimationLoop(this.animate);
    },
    methods: {
        createCanvas() {
            const canvas = document.querySelector("#container");
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.canvas = canvas;
        },
        createScene() {
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x1E2630, 0.002);
            // scene.background = new THREE.Color(0x87ceeb)
            this.scene = scene;

        },
        createCamera() {
            // 相机
            const fov = 45;
            const aspect = window.innerWidth / window.innerHeight; // the canvas default
            const near = 1;
            const far = 100;
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            camera.position.set(0, 10, 3);
            const controls = new OrbitControls(camera, this.canvas);
            // controls.enableDamping = true
            // controls.enableZoom = false
            // controls.enablePan = true
            controls.minPolarAngle = Math.PI / 6
            controls.maxPolarAngle = Math.PI / 2.2
            controls.keys = {
                LEFT: 'ArrowLeft', //left arrow
                UP: 'ArrowUp', // up arrow
                RIGHT: 'ArrowRight', // right arrow
                BOTTOM: 'ArrowDown' // down arrow
            }
            controls.update();
            this.controls = controls;
            this.camera = camera;
        },
        createLight() {
            // 光线
            var light
            // 定向光
            light = new THREE.DirectionalLight(0xffffff);
            light.position.set(1, 1, 1);
            this.scene.add(light);
            // 环境光
            light = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(light);
            // 点光源
            // const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            // pointLight.position.set(10, 10, 10);
            // scene.add(pointLight);
        },
        createRenderer() {
            // 输出
            const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas });
            renderer.setClearColor(this.scene.fog.color);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
            renderer.shadowMap.enabled = true;
            this.renderer = renderer
        },
        init() {
            // 显示网格
            var gridHelper = new THREE.GridHelper(200, 20);
            this.scene.add(gridHelper)
            // 坐标轴辅助器
            const axesHelper = new THREE.AxesHelper(2000);
            this.scene.add(axesHelper);
            // 环境（多边形球体）
            var domeGeometry = new THREE.IcosahedronGeometry(700, 1);
            var domeMaterial = new THREE.MeshPhongMaterial({
                color: 0xfb3550,
                flatShading: true,
                side: THREE.BackSide
            });
            var dome = new THREE.Mesh(domeGeometry, domeMaterial);
            this.scene.add(dome);
            // 地面
            // this.createReflectorPlane()
            // 加载模型
            this.loadGltf('gltf/Xbot.glb').then(gltf => {
                const model = gltf.scene;
                this.scene.add(model);
                model.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true;
                });
                this.moveObject = model
                // 模型骨骼
                const skeleton = new THREE.SkeletonHelper(model);
                skeleton.visible = true;
                this.scene.add(skeleton);
            })
            // 控制镜头移动
            this.createKey()

        },
        loadGltf(url) {
            const loader = new GLTFLoader();
            return new Promise((resolve, reject) => {
                loader.load(
                    url,
                    function (gltf) {
                        resolve(gltf)
                    },
                    function (xhr) {
                        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    },
                    function (error) {
                        console.error('An error happened', error);
                    }
                );
            })
        },
        createReflectorPlane() {
            const geometry = new THREE.PlaneGeometry(100, 100);
            const material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometry, material);
            plane.receiveShadow = true;
            new THREE.TextureLoader().load(ImagePlane, function (texture) {
                // console.log(texture)
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(10, 10);
                plane.material.map = texture;
                plane.material.needsUpdate = true;
            });
            plane.rotation.set(-0.5 * Math.PI, 0, 0);
            this.scene.add(plane);
            // 地面
            // var planeGeometry = new THREE.PlaneGeometry(100, 100);
            // var planeMaterial = new THREE.MeshPhongMaterial({
            //     color: 0x222A38,
            //     transparent: true,
            //     opacity: 1,
            //     shading: THREE.FlatShading,
            //     side: THREE.DoubleSide,
            // });
            // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
            // plane.rotation.x = Math.PI / 2;
            // scene.add(plane);

            // 平面反射地面
            // const groundGeometry = new THREE.PlaneGeometry(600, 600);
            // const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
            // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            // ground.rotation.x = -Math.PI / 2;
            // scene.add(ground);
            // 反射器
            // const reflector = new Reflector(groundGeometry, {
            //     clipBias: 0.003,
            //     textureWidth: window.innerWidth * window.devicePixelRatio,
            //     textureHeight: window.innerHeight * window.devicePixelRatio,
            //     color: 0x777777,
            //     recursion: 1
            // });
            // reflector.rotation.x = -Math.PI / 2;
            // scene.add(reflector);
        },
        createPerson(scene, fn) {
            const baseActions = {
                idle: { weight: 1 },
                walk: { weight: 0 },
                run: { weight: 0 },
                // sneak_pose: { weight: 0 },
                // sad_pose: { weight: 0 },
                // agree: { weight: 0 },
                // headShake: { weight: 0 }
            };
            function activateAction(action) {
                const clip = action.getClip();
                const settings = baseActions[clip.name]
                setWeight(action, settings.weight);
                if (clip.name === 'run') {
                    action.play();
                }

            }
            function setWeight(action, weight) {
                action.enabled = true;
                action.setEffectiveTimeScale(1).setEffectiveWeight(weight);

            }
            this.loadGltf('gltf/Xbot.glb').then(gltf => {
                const model = gltf.scene;
                scene.add(model);
                model.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true;
                });
                // 模型骨骼
                const skeleton = new THREE.SkeletonHelper(model);
                skeleton.visible = true;
                scene.add(skeleton);

                const animations = gltf.animations;
                const mixer = new THREE.AnimationMixer(model);
                const numAnimations = animations.length;
                for (let i = 0; i < numAnimations; ++i) {
                    let clip = animations[i];
                    const name = clip.name;

                    if (baseActions[name]) {
                        const action = mixer.clipAction(clip);
                        if (clip.name === 'run') {
                            action.play();
                        }
                    }

                }
                fn && fn(mixer)
            })
        },
        // 键盘事件
        createKey() {
            window.addEventListener('keydown', (event) => {
                console.log(this.controls)
                this.keyState[event.key] = true;
                switch (event.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        this.moveDirection.forward = 1;
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.moveDirection.forward = -1;
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.moveDirection.right = 1;
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.moveDirection.right = -1;
                        break;
                }
            });
            window.addEventListener('keyup', (event) => {
                this.keyState[event.key] = false;
                switch (event.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                    case 'ArrowDown':
                    case 'KeyS':
                        this.moveDirection.forward = 0;
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                    case 'ArrowRight':
                    case 'KeyD':
                        this.moveDirection.right = 0;
                        break;
                }
                // this.controls.update();
            });
        },
        resizeRendererToDisplaySize(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }

            return needResize;
        },
        animate() {
            if (this.resizeRendererToDisplaySize(this.renderer)) {
                const canvas = this.renderer.domElement;
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
            }
            // 镜头移动

            if (this.moveObject) {
                const direction = new THREE.Vector3();
                // 根据相机方向设置前进方向
                this.camera.getWorldDirection(direction);
                direction.y = 0;
                direction.normalize();
                // 计算右方向
                const right = new THREE.Vector3();
                right.crossVectors(this.camera.up, direction).normalize();

                // 移动人物
                const moveX = this.moveDirection.right * 0.1;
                const moveZ = this.moveDirection.forward * 0.1;
                // 更新人物位置
                this.moveObject.position.addScaledVector(direction, moveZ);
                this.moveObject.position.addScaledVector(right, moveX);
                // 更改相机
                this.camera.position.addScaledVector(direction, moveZ);
                this.camera.position.addScaledVector(right, moveX);
                // 更改相机控制器目标位置
                this.controls.target.addScaledVector(direction, moveZ);
                this.controls.target.addScaledVector(right, moveX);
                // 人物旋转
                // 计算目标方向的四元数
                const targetQuaternion = new THREE.Quaternion();
                targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

                // 更新人物的旋转
                this.moveObject.quaternion.copy(targetQuaternion);
            }
            // 
            this.renderer.render(this.scene, this.camera);
            // requestAnimationFrame(this.animate);
        }
    },
}
</script>

<style lang="scss" scoped>
.home {
    position: relative;
    height: 100%;
    overflow: hidden;

    #container {
        height: 100%;
        width: 100%;
    }
}
</style>