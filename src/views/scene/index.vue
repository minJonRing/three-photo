<template>
    <div class="home">
        <div id="blocker">
            <div id="instructions">
                <p style="font-size:36px">
                    Click to play
                </p>
                <p>
                    Move: WASD<br />
                    Jump: SPACE<br />
                    Look: MOUSE
                </p>
            </div>
        </div>
        <canvas id="container"></canvas>
    </div>
</template>

<script>
// import { init, animate } from './index'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
// import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import CameraControls from 'camera-controls';
// import { PointerLockControls } from './index.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import ImagePlane from '@/assets/textures/plane.jpg'
import ImageWaternormals from '@/assets/textures/waternormals.jpg'

import Image1 from '@/assets/textures/1.jpg'
import Image2 from '@/assets/textures/2.jpg'
import Image3 from '@/assets/textures/3.jpg'

CameraControls.install({ THREE: THREE });
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
            moveObject: null,
            // 
            collision: false,
            isMouseDown: false,
            previousMousePosition: { x: 0, y: 0 },
            zoomSpeed: 1.0,
            panSpeed: 0.5,
            minPolarAngle: -Math.PI / 10, // 最小垂直旋转角度，30度
            maxPolarAngle: Math.PI / 10, // 最大垂直旋转角度，90度
            boundaries: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
            params: {

                firstPerson: false, // 是否第一人称

                displayCollider: false, // 是否显示碰撞体

                displayBVH: false, // 是否显示BVH

                visualizeDepth: 10, // BVH深度

                gravity: - 30, // 重力

                playerSpeed: 10, // 玩家速度

                physicsSteps: 5, // 物理模拟的步数

            },
            playerVelocity: new THREE.Vector3(),
            tempVector: new THREE.Vector3(),
            tempVector2: new THREE.Vector3(),
            upVector: new THREE.Vector3(0, 1, 0),
            moveKey: {
                KeyW: false, KeyS: false, KeyD: false, KeyA: false
            }
        }
    },
    mounted() {
        document.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, { passive: false });
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

        const v = new THREE.Vector3()
        console.log(v)
        v.set(0, 0, - 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), 1.303107188989011)
        console.log(v)
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
            scene.fog = new THREE.FogExp2(0xffffff, 0.002);
            this.scene = scene;

        },
        createCamera() {
            // 相机
            const fov = 45;
            const aspect = window.innerWidth / window.innerHeight; // the canvas default
            const near = 1;
            const far = 3000;
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            // camera.position.set(0, 2, 10);
            camera.position.set(10, 10, - 10);
            // camera.far = 100;
            camera.updateProjectionMatrix();
            const controls = new OrbitControls(camera, this.canvas);
            // controls.minPolarAngle = Math.PI / 6
            // controls.maxPolarAngle = Math.PI / 2.2
            controls.update();
            this.controls = controls;
            // const firstPersonControls = new FirstPersonControls(camera, this.canvas);
            // firstPersonControls.activeLook = true
            // firstPersonControls.constrainVertical = true
            // firstPersonControls.heightMax = 0.001
            // firstPersonControls.movementSpeed = 0.05
            // firstPersonControls.lookSpeed = 0.0005
            // firstPersonControls.minPolarAngle = Math.PI / 6
            // firstPersonControls.maxPolarAngle = Math.PI / 2.2
            // this.firstPersonControls = firstPersonControls;
            // this.cameraControls = new CameraControls(camera, this.canvas)
            // const controls = new PointerLockControls(camera, this.canvas);
            // controls.upload()
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
            light = new THREE.AmbientLight(0xffffff, 1);
            this.scene.add(light);
            // 点光源
            // const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            // pointLight.position.set(10, 10, 10);
            // this.scene.add(pointLight);
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
            // var gridHelper = new THREE.GridHelper(100, 20);
            // this.scene.add(gridHelper)
            // 坐标轴辅助器
            const axesHelper = new THREE.AxesHelper(200);
            this.scene.add(axesHelper);
            // 环境（多边形球体）
            // var domeGeometry = new THREE.IcosahedronGeometry(700, 1);
            // var domeMaterial = new THREE.MeshPhongMaterial({
            //     color: 0xfb3550,
            //     flatShading: true,
            //     side: THREE.BackSide
            // });
            // var dome = new THREE.Mesh(domeGeometry, domeMaterial);
            // this.scene.add(dome);
            // 地面
            this.createReflectorPlane()
            // 海水
            this.createWater()
            // 图片
            this.createImage()
            // 人物
            const player = new THREE.Mesh(
                new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
                new THREE.MeshStandardMaterial()
            );
            // 几何体沿着Y轴负方向平移了0.5个单位，使得玩家模型的底部与网格的原点对齐。
            player.geometry.translate(0, 1, 0);

            // 包含了玩家的胶囊碰撞器的信息，其中radius表示碰撞器的半径，segment表示碰撞器的线段，用于进行碰撞检测。
            player.capsuleInfo = {
                radius: 0.5,
                segment: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3(0, - 1.0, 0.0))
            };

            player.castShadow = true;
            player.receiveShadow = true;
            player.material.shadowSide = 2;
            this.player = player
            this.scene.add(player);
            // 控制镜头移动
            this.createKey()
            // this.createMouse()
            // dat.gui
            const gui = new GUI();
            gui.add(this.params, 'firstPerson').onChange(v => {
                if (!v) {
                    // 如果firstPerson的值为false，则调整相机的位置，使其处于一种远距离的观察模式，相机位置会根据控制器的目标进行调整。
                    this.camera
                        .position
                        .sub(this.controls.target)
                        .normalize()
                        .multiplyScalar(10)
                        .add(this.controls.target);

                }

            });

            this.loadFbx('fbx/fz-1.fbx').then(obj => {
                // const model = obj.scene;
                console.log(obj)
                // obj.scale.sub(new THREE.Vector3(0.01, 0.01, 0.01))
                // obj.children.map(m => {
                //     if (Array.isArray(m.material)) {
                //         m.material.map(i => {
                //             i.color.set(0xffffff);
                //         })
                //     } else {
                //         m.material.color.set(0xffffff);
                //     }

                // })
                this.scene.add(obj);

                // const skeleton = new THREE.SkeletonHelper(model);
                // skeleton.visible = true;
                // this.scene.add(skeleton);
            })

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
        loadFbx(url) {
            const loader = new FBXLoader();
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
            // const geometry = new THREE.PlaneGeometry(100, 100);
            // const material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            // const plane = new THREE.Mesh(geometry, material);
            // plane.receiveShadow = true;
            // new THREE.TextureLoader().load(ImagePlane, function (texture) {
            //     // console.log(texture)
            //     texture.wrapS = THREE.RepeatWrapping;
            //     texture.wrapT = THREE.RepeatWrapping;
            //     texture.repeat.set(10, 10);
            //     plane.material.map = texture;
            //     plane.material.needsUpdate = true;
            // });
            // plane.rotation.set(-0.5 * Math.PI, 0, 0);
            // this.scene.add(plane);
            // 地面
            const planeGeometry = new THREE.PlaneGeometry(100, 100);
            const planeMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: false,
                opacity: 1,
                shading: THREE.FlatShading,
                side: THREE.DoubleSide,
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = Math.PI / 2;
            this.scene.add(plane);

            // 平面反射地面
            // const groundGeometry = new THREE.PlaneGeometry(600, 600);
            // const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
            // const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            // ground.rotation.x = -Math.PI / 2;
            // this.scene.add(ground);
            // // 反射器
            // const reflector = new Reflector(groundGeometry, {
            //     clipBias: 0.003,
            //     textureWidth: window.innerWidth * window.devicePixelRatio,
            //     textureHeight: window.innerHeight * window.devicePixelRatio,
            //     color: 0x777777,
            //     recursion: 1
            // });
            // reflector.rotation.x = -Math.PI / 2;
            // this.scene.add(reflector);
        },
        createWater() {
            const sun = new THREE.Vector3();

            const waterGeometry = new THREE.PlaneGeometry(1000, 1000);
            this.water = new Water(waterGeometry, {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load(ImageWaternormals, function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            });
            this.water.rotation.x = -Math.PI / 2;
            this.water.position.y = -0.05;
            this.scene.add(this.water);
            // sky
            const sky = new Sky();
            sky.scale.setScalar(10000);
            this.scene.add(sky);

            const skyUniforms = sky.material.uniforms;

            skyUniforms['turbidity'].value = 10;
            skyUniforms['rayleigh'].value = 2;
            skyUniforms['mieCoefficient'].value = 0.0002;
            skyUniforms['mieDirectionalG'].value = 0.8;

            const parameters = {
                elevation: 3,
                azimuth: 180
            };

            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            const sceneEnv = new THREE.Scene();

            let renderTarget;
            const updateSun = () => {

                const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
                const theta = THREE.MathUtils.degToRad(parameters.azimuth);
                sun.setFromSphericalCoords(1, phi, theta);

                sky.material.uniforms['sunPosition'].value.copy(sun);
                this.water.material.uniforms['sunDirection'].value.copy(sun).normalize();

                if (renderTarget !== undefined) renderTarget.dispose();

                sceneEnv.add(sky);
                renderTarget = pmremGenerator.fromScene(sceneEnv);
                this.scene.add(sky);
                this.scene.environment = renderTarget.texture;

            }

            updateSun();
        },
        createImage() {
            const paths = [Image1, Image2, Image3]
            for (let i in paths) {
                const gx = Math.floor(i * 3)
                const url = paths[i]
                const group = new THREE.Group();
                group.position.x = gx
                group.position.y = 1.5
                // 地板
                const planeGeometry = new THREE.BoxGeometry(2, 3, 0.05);
                const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
                const cube = new THREE.Mesh(planeGeometry, planeMaterial);
                group.add(cube);
                // 图片
                const image = new THREE.TextureLoader();
                image.setCrossOrigin('Anonymous');
                image.load(url, (texture) => {
                    const { source: { data: { width, height } } } = texture;
                    const w = 1.5;
                    const h = 1.5 / width * height;
                    const imageGeometry = new THREE.PlaneGeometry(w, h, 1, 1);
                    const imageMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, side: THREE.DoubleSide });
                    const img = new THREE.Mesh(imageGeometry, imageMaterial);
                    img.position.z = 0.03
                    group.add(img);
                })
                this.scene.add(group);
            }

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
        // 鼠标事件
        createMouse() {

            const onMouseDown = (event) => {
                this.isMouseDown = true;
                this.previousMousePosition.x = event.clientX;
                this.previousMousePosition.y = event.clientY;
            }
            const onMouseMove = (event) => {
                if (this.isMouseDown) {
                    const deltaMove = {
                        x: event.clientX - this.previousMousePosition.x,
                        y: event.clientY - this.previousMousePosition.y
                    };

                    const rotationSpeed = 0.002;
                    this.camera.rotation.y -= deltaMove.x * rotationSpeed;
                    this.camera.rotation.x -= deltaMove.y * rotationSpeed;
                    // this.camera.rotation.x = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.camera.rotation.x));
                    this.previousMousePosition.x = event.clientX;
                    this.previousMousePosition.y = event.clientY;
                }
            }
            const onMouseUp = () => {
                this.isMouseDown = false;
                console.log(this.camera)
            }
            const onMouseWheel = (event) => {
                const zoomFactor = 1 + (event.deltaY * 0.001 * this.zoomSpeed);
                this.camera.position.multiplyScalar(zoomFactor);
            }
            window.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            // window.addEventListener('wheel', onMouseWheel);
        },
        // 键盘事件
        createKey() {
            window.addEventListener('keydown', (event) => {
                // this.keyState[event.key] = true;
                this.moveKey[event.code] = true
                // switch (event.code) {
                //     case 'ArrowUp':
                //     case 'KeyW':
                //         this.moveDirection.forward = 1;
                //         break;
                //     case 'ArrowDown':
                //     case 'KeyS':
                //         this.moveDirection.forward = -1;
                //         break;
                //     case 'ArrowLeft':
                //     case 'KeyA':
                //         this.moveDirection.right = 1;
                //         break;
                //     case 'ArrowRight':
                //     case 'KeyD':
                //         this.moveDirection.right = -1;
                //         break;
                // }
            });
            window.addEventListener('keyup', (event) => {
                // this.keyState[event.key] = false;
                this.moveKey[event.code] = false
                // switch (event.code) {
                //     case 'ArrowUp':
                //     case 'KeyW':
                //     case 'ArrowDown':
                //     case 'KeyS':
                //         this.moveDirection.forward = 0;
                //         break;
                //     case 'ArrowLeft':
                //     case 'KeyA':
                //     case 'ArrowRight':
                //     case 'KeyD':
                //         this.moveDirection.right = 0;
                //         break;
                // }
            });
        },
        updatePlayer(delta) {
            // 根据玩家是否在地面上，调整玩家的垂直速度。
            // 根据物理规则，玩家在地面上时，垂直速度受重力影响；不在地面上时，垂直速度会逐渐增加。
            // if (playerIsOnGround) {
            // if (true) {
            //     this.playerVelocity.y = delta * this.params.gravity;
            // } else {
            //     this.playerVelocity.y += delta * this.params.gravity;
            // }

            // 根据玩家的速度和时间间隔，更新玩家的位置。
            this.player.position.addScaledVector(this.playerVelocity, delta);

            // move the player
            // 获取相机控制器的方位角，用于确定玩家的移动方向。
            const angle = this.controls.getAzimuthalAngle();

            // 如果向前按键被按下，则根据相机的方向计算出玩家的移动方向，并根据移动速度和时间间隔更新玩家的位置。
            const { KeyW, KeyS, KeyA, KeyD } = this.moveKey;
            if (KeyW) {
                this.tempVector.set(0, 0, - 1).applyAxisAngle(this.upVector, angle);
                console.log(this.tempVector)
                this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta);

            }

            if (KeyS) {
                this.tempVector.set(0, 0, 1).applyAxisAngle(this.upVector, angle);
                this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta);

            }

            if (KeyA) {

                this.tempVector.set(- 1, 0, 0).applyAxisAngle(this.upVector, angle);
                this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta);

            }

            if (KeyD) {
                this.tempVector.set(1, 0, 0).applyAxisAngle(this.upVector, angle);
                this.player.position.addScaledVector(this.tempVector, this.params.playerSpeed * delta);

            }

            this.player.updateMatrixWorld();

            // adjust the camera
            this.camera.position.sub(this.controls.target);
            this.controls.target.copy(this.player.position);
            this.camera.position.add(this.player.position);

            // if the player has fallen too far below the level reset their position to the start
            // if (player.position.y < - 15) {
            //     reset();
            // }

        },

        checkCameraBoundaries() {
            const { minX, maxX, minZ, maxZ } = this.boundaries;
            const cameraPos = this.camera.position;
            if (cameraPos.x < minX) cameraPos.x = minX;
            if (cameraPos.x > maxX) cameraPos.x = maxX;
            if (cameraPos.z < minZ) cameraPos.z = minZ;
            if (cameraPos.z > maxZ) cameraPos.z = maxZ;
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
            // 更新水面
            if (this.water) {
                this.water.material.uniforms['time'].value += 1.0 / 600.0;
            }
            // this.checkCameraBoundaries()
            // const elapsedTime = this.clock.getElapsedTime();
            // this.firstPersonControls.update(elapsedTime);
            const delta = this.clock.getDelta();
            // this.cameraControls.update(delta)
            this.updatePlayer(delta)
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

    #blocker {
        position: absolute;
        display: none;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }

    #instructions {
        width: 100%;
        height: 100%;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        text-align: center;
        font-size: 14px;
        cursor: pointer;
    }
}
</style>