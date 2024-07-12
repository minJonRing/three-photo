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
export default {
    data() {
        return {
            canvas: null,
            camera: null,
            scene: null,
            renderer: null,
            keyState: {}
        }
    },
    mounted() {
        this.init()
        // this.animate()
    },
    methods: {
        init() {
            const canvas = document.querySelector("#container");
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            // 场景
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x1E2630, 0.002);
            // scene.background = new THREE.Color(0x87ceeb)
            // 相机
            const fov = 60;
            const aspect = 2; // the canvas default
            const near = 1;
            const far = 1000;
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            camera.animAngle = 0;
            // camera.position.x = Math.cos(camera.animAngle) * 400;
            // camera.position.y = 180;
            // camera.position.z = Math.sin(camera.animAngle) * 400;
            camera.position.z = 5;
            // camera.position.set(0, 0, 10);
            // camera.up.set(0, 0, 1);
            camera.lookAt(0, 0, 0);
            const controls = new OrbitControls(camera, canvas);
            // controls.enableDamping = true
            // controls.enableZoom = true
            // controls.enablePan = true
            controls.minPolarAngle = Math.PI / 6
            controls.maxPolarAngle = Math.PI / 2.2
            controls.update();
            this.createKey(camera)
            // 光线
            var light = new THREE.DirectionalLight(0xffffff);
            light.position.set(1, 1, 1);
            scene.add(light);
            light = new THREE.DirectionalLight(0x002288);
            light.position.set(-1, -1, -1);
            scene.add(light);
            light = new THREE.AmbientLight(0x222222);
            scene.add(light);
            const pointLight = new THREE.PointLight(0xffffff, 1, 100);
            pointLight.position.set(600, 600, 600);
            scene.add(pointLight);

            // 显示网格
            var gridXZ = new THREE.GridHelper(600, 10);
            scene.add(gridXZ);

            // 坐标轴辅助器
            const axesHelper = new THREE.AxesHelper(2000);
            scene.add(axesHelper);

            // 输出
            const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

            renderer.setClearColor(scene.fog.color);
            // renderer.setPixelRatio(window.devicePixelRatio);
            // renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            // 环境
            var domeGeometry = new THREE.IcosahedronGeometry(700, 1);
            var domeMaterial = new THREE.MeshPhongMaterial({
                color: 0xfb3550,
                flatShading: true,
                side: THREE.BackSide
            });
            var dome = new THREE.Mesh(domeGeometry, domeMaterial);
            scene.add(dome);

            // 地面
            // var planeGeometry = new THREE.PlaneGeometry(600, 600);
            // var planeMaterial = new THREE.MeshPhongMaterial({
            //     color: 0x222A38,
            //     transparent: true,
            //     opacity: 0.8,
            //     shading: THREE.FlatShading,
            //     side: THREE.DoubleSide,
            // });
            // var plane = new THREE.Mesh(planeGeometry, planeMaterial);
            // plane.rotation.x = Math.PI / 2;
            // scene.add(plane);

            // 平面反射地面
            const groundGeometry = new THREE.PlaneGeometry(600, 600);
            const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            // ground.position.y = -1;
            scene.add(ground);
            // 反射器
            const reflector = new Reflector(groundGeometry, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x777777,
                recursion: 1
            });
            reflector.rotation.x = -Math.PI / 2;
            // reflector.position.y = 0;
            scene.add(reflector);

            // 立方体
            // this.createBoxs(scene)
            // 泡泡
            // const bubbles = [];
            // for (let i = 0; i < 20; i++) {
            //     const radius = Math.random() * 5 + 1;
            //     const position = new THREE.Vector3(
            //         (Math.random() - 0.5) * 100,
            //         (Math.random() - 0.5) * 100 + 50,
            //         (Math.random() - 0.5) * 100
            //     );
            //     const bubble = this.createBubble(scene, radius, position);
            //     bubbles.push(bubble);
            //     scene.add(bubble);
            // }
            // 粒子图片
            // const geometry = this.createImg(scene)
            // console.log(geometry)
            // 水水珠
            // const pmremGenerator = new THREE.PMREMGenerator(renderer);
            // pmremGenerator.compileEquirectangularShader();
            // this.createWater(scene, pmremGenerator)
            // 雨滴
            // const rainGeometry = this.createRain(scene)
            // 
            // this.createCity(scene)
            // 
            const resizeRendererToDisplaySize = (renderer) => {
                const canvas = renderer.domElement;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                const needResize = canvas.width !== width || canvas.height !== height;
                if (needResize) {
                    renderer.setSize(width, height, false);
                }

                return needResize;
            }

            const clock = new THREE.Clock();
            const animate = () => {
                if (resizeRendererToDisplaySize(renderer)) {
                    const canvas = renderer.domElement;
                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix();
                }
                // 让泡泡慢慢上升
                // bubbles.forEach(bubble => {
                //     bubble.position.y += 0.1;
                //     if (bubble.position.y > 500) {
                //         bubble.position.y = -5;
                //     }

                // });
                // 例子图片
                // if (geometry.attributes.position) {
                //     const position = geometry.attributes.position.array;
                //     for (let i = 0; i < position.length; i++) {
                //         if (i % 3 === 0) {
                //             position[i] += 0.05;
                //             if (position[i] > 200) {
                //                 position[i] = -100
                //             }
                //         }

                //     }
                //     geometry.attributes.position.needsUpdate = true;
                // }
                // 获取时间增量
                const elapsedTime = clock.getElapsedTime();
                this.updateCamera(camera)
                // // 更新粒子位置
                // const positions = rainGeometry.attributes.position.array;
                // for (let i = 0; i < 1000; i++) {
                // positions[i * 3] = Math.cos(positions[i * 3] + elapsedTime); // Y 轴正弦波
                // positions[i * 3 + 2] = Math.sin(positions[i * 3 + 2] + elapsedTime); // Y 轴正弦波
                // }
                // const positions = rainGeometry.attributes.position.array;
                // const pointIndex = Math.floor(Math.random() * 1000); // 选择要移动的粒子
                // positions[pointIndex * 3 + 1] = Math.sin(elapsedTime) * 20 / 2; // Y 轴正弦波
                // rainGeometry.attributes.position.needsUpdate = true;
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            }

            animate()
        },
        // 创建立方体
        createBoxs(scene) {
            const boxes = []
            var geometry = new THREE.BoxGeometry(10, 10, 10);
            for (var i = 0; i < 100; i++) {
                var material = new THREE.MeshPhongMaterial({
                    color: [0xfb3550, 0xffffff, 0x000000][Math.random() * 3
                        | 0],
                    flatShading: true,
                });
                boxes.push(new THREE.Mesh(geometry, material));
                scene.add(boxes[i]);
            }
            boxes.forEach(box => {
                var t = Math.random() * 0.6 + 0.3;
                const y = (1 + Math.random() * 20 + (Math.random() < 0.1 ? 15 : 0)) / 2
                TweenMax.to(box.scale, t, {
                    x: 1 + Math.random() * 3,
                    y,
                    z: 1 + Math.random() * 3,
                    ease: Power2.easeInOut
                });
                TweenMax.to(box.position, t, {
                    x: -200 + Math.random() * 400,
                    z: -200 + Math.random() * 400,
                    y: y * 10 / 2,
                    ease: Power2.easeInOut
                });
            });
        },
        // 创建泡泡
        createBubble(scene, radius, position) {
            const bubbleGeometry = new THREE.SphereGeometry(radius, 32, 32);
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,
                shininess: 100,
                envMap: scene.background,
                reflectivity: 1.0,
                refractionRatio: 0.98
            });

            // 添加彩虹效果
            // const hsl = new THREE.Color().setHSL(Math.random(), 1.0, 0.5);
            // bubbleMaterial.color.copy(hsl);

            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.copy(position);
            return bubble;
        },
        // 粒子照片
        createImg(scene, imagePath = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/winter.jpg') {
            const image = new THREE.TextureLoader();
            image.setCrossOrigin('Anonymous');
            const groundGeometry = new THREE.PlaneGeometry(200, 100, 400, 200);
            image.load(imagePath, (texture) => {
                const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, side: THREE.DoubleSide });
                const ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.position.y = 50;
                // 
                // const position = groundGeometry.attributes.position.array;
                // for (let i = 0; i < position.length; i++) {
                //     if (i % 3 === 0) {
                //         position[i] += Math.random() * 10;
                //     }
                // }
                // groundGeometry.attributes.position.needsUpdate = true;
                scene.add(ground);
            })
            return groundGeometry
            // const geometry = new THREE.BufferGeometry();
            // const vertices = new Float32Array([
            //     -1.0, -1.0, 1.0, // v0
            //     1.0, -1.0, 1.0, // v1
            //     1.0, 1.0, 1.0, // v2

            //     1.0, 1.0, 1.0, // v3
            //     -1.0, 1.0, 1.0, // v4
            //     -1.0, -1.0, 1.0  // v5
            // ]);
            // geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            // const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
            // const mesh = new THREE.Mesh(geometry, material);
            // scene.add(mesh);
        },
        // 水煮
        createWater(scene, pmremGenerator) {
            let waterDroplet = null
            new THREE.CubeTextureLoader()
                .setPath('https://threejs.org/examples/textures/cube/Bridge2/')
                .load([
                    'posx.jpg', 'negx.jpg',
                    'posy.jpg', 'negy.jpg',
                    'posz.jpg', 'negz.jpg'
                ], function (cubeTexture) {
                    const envMap = pmremGenerator.fromCubemap(cubeTexture).texture;
                    pmremGenerator.dispose();

                    // 创建水珠几何体和材质
                    const geometry = new THREE.SphereGeometry(1, 64, 64);
                    const material = new THREE.MeshPhysicalMaterial({
                        color: 0x00ffff,
                        metalness: 0,
                        roughness: 0,
                        transmission: 1,  // 设置为 1 表示完全透明
                        thickness: 1,
                        envMap: envMap,
                        envMapIntensity: 1,
                        clearcoat: 1,
                        clearcoatRoughness: 0
                    });
                    waterDroplet = new THREE.Mesh(geometry, material);
                    waterDroplet.position.y = 32
                    scene.add(waterDroplet);
                });
            return waterDroplet
        },
        // 雨滴
        createRain(scene) {
            const particleCount = 1000; // 雨滴数量
            const radius = 5; // 圆柱体半径
            const height = 20; // 圆柱体高度
            const positions = new Float32Array(particleCount * 3); // 位置数组
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2; // 角度
                const y = (i / particleCount) * height; // 高度

                positions[i * 3] = radius * Math.cos(angle); // X 坐标
                positions[i * 3 + 1] = y; // Y 坐标
                positions[i * 3 + 2] = radius * Math.sin(angle); // Z 坐标
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            const material = new THREE.PointsMaterial({
                color: 0xaaaaaa,
                size: 0.1,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthTest: false
            });

            const rain = new THREE.Points(geometry, material);
            scene.add(rain);
            return geometry
        },
        createCity(scene) {
            const lineCount = 12; // 线段数量
            const radius = 10; // 圆柱体半径
            const height = 20; // 圆柱体高度
            const lines = [];

            for (let i = 0; i < lineCount; i++) {
                const angle = (i / lineCount) * Math.PI * 2;

                const points = [];
                points.push(new THREE.Vector3(radius * Math.cos(angle), -height / 2, radius * Math.sin(angle)));
                points.push(new THREE.Vector3(radius * Math.cos(angle), height / 2, radius * Math.sin(angle)));

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0xffffff });
                const line = new THREE.Line(geometry, material);

                scene.add(line);
                lines.push(line);
            }
        },
        // 键盘事件
        createKey() {
            window.addEventListener('keydown', (event) => {
                this.keyState[event.key] = true;
                console.log(event.key)
            });
            window.addEventListener('keyup', (event) => {
                this.keyState[event.key] = false;
            });
        },
        // 更新相机位置
        updateCamera(camera) {
            const speed = 0.1;
            if (this.keyState['w']) {
                camera.position.x -= Math.sin(camera.rotation.y) * speed;
                camera.position.z -= Math.cos(camera.rotation.y) * speed;
            }
            if (this.keyState['s']) {
                camera.position.x += Math.sin(camera.rotation.y) * speed;
                camera.position.z += Math.cos(camera.rotation.y) * speed;
            }
            if (this.keyState['a']) {
                camera.rotation.y += speed / 10;
            }
            if (this.keyState['d']) {
                camera.rotation.y -= speed / 10;
            }
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
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.animate);
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