<template>
    <div class="home">
        <canvas id="container"></canvas>
    </div>
</template>

<script>
// import { init, animate } from './index'
import * as THREE from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import ImageWaternormals from '@/assets/textures/waternormals.jpg'


export default {
    data() {
        return {
            canvas: null,
            // camera: null,
            // scene: null,
            // renderer: null,
            clock: null,
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
            camera.position.set(10, 10, 10);
            camera.updateProjectionMatrix();
            const controls = new MapControls(camera, this.canvas);
            controls.minPolarAngle = Math.PI / 6
            controls.maxPolarAngle = Math.PI / 2.5
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
            // light = new THREE.AmbientLight(0xffffff, 1);
            // this.scene.add(light);
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
            // 地面
            this.createReflectorPlane()
            // 海水
            // this.createWater()
            // 建筑
            const boxGrid = this.createBoxs(2000, 100, 100, 0.5);
            this.scene.add(boxGrid);

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
            // sky
            const sky = new Sky();
            sky.scale.setScalar(10000);
            this.scene.add(sky);

            const skyUniforms = sky.material.uniforms;

            skyUniforms['turbidity'].value = 0;
            skyUniforms['rayleigh'].value = 1;
            skyUniforms['mieCoefficient'].value = 0.0002;
            skyUniforms['mieDirectionalG'].value = 0.8;

            const parameters = {
                elevation: 3,
                azimuth: 180
            };

            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            const sceneEnv = new THREE.Scene();

            let renderTarget;
            const sun = new THREE.Vector3();
            const updateSun = () => {

                const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
                const theta = THREE.MathUtils.degToRad(parameters.azimuth);
                sun.setFromSphericalCoords(1, phi, theta);

                sky.material.uniforms['sunPosition'].value.copy(sun);

                if (renderTarget !== undefined) renderTarget.dispose();

                sceneEnv.add(sky);
                renderTarget = pmremGenerator.fromScene(sceneEnv);
                this.scene.add(sky);
                this.scene.environment = renderTarget.texture;

            }

            updateSun();
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
        // 创建立方体
        createBoxs(numBoxes, width, height, boxSize) {
            // const boxes = []
            // const bh = Math.floor(Math.random() * 100)
            // var geometry = new THREE.BoxGeometry(10, bh, 10);
            // for (var i = 0; i < 100; i++) {
            //     var material = new THREE.MeshPhongMaterial({
            //         color: 0x999999,
            //         transparent: false,
            //         opacity: 1,
            //         shading: THREE.FlatShading,
            //         side: THREE.DoubleSide,
            //     });
            //     const box = new THREE.Mesh(geometry, material)
            //     box.position.sub(new THREE.Vector3(Math.floor(Math.random() * 10) + i * 10, - bh / 2, Math.floor(Math.random() * 10) + i * 10))
            //     boxes.push(box);
            //     this.scene.add(boxes[i]);
            // }
            const group = new THREE.Group();
            const positions = [];

            function isOverlapping(x, y) {
                for (let pos of positions) {
                    const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                    if (distance < boxSize) {
                        return true;
                    }
                }
                return false;
            }

            for (let i = 0; i < numBoxes; i++) {
                const bh = boxSize * Math.floor(Math.random() * 5) + boxSize
                const geometry = new THREE.BoxGeometry(boxSize, bh, boxSize);
                const material = new THREE.MeshPhongMaterial({
                    color: 0x999999,
                    transparent: true,
                    opacity: 0.8,
                    shading: THREE.FlatShading,
                    side: THREE.DoubleSide,
                })
                const box = new THREE.Mesh(geometry, material);

                let x, z;
                do {
                    x = Math.random() * width - width / 2;
                    z = Math.random() * height - height / 2;
                } while (isOverlapping(x, z));

                positions.push({ x, z });
                box.position.set(x, bh / 2, z);
                group.add(box);
            }
            return group;
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