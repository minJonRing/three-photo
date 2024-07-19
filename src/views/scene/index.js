import * as THREE from 'three';

class PointerLockControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.isLocked = false;

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);
        this.camera.position.set(0, 2, 10)
        this.yawObject = new THREE.Object3D();
        // this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.PI_2 = Math.PI / 2;

        this.init();
    }

    init() {
        window.addEventListener('mousedown', () => {
            this.isLocked = true
        });
        document.addEventListener('mousemove', (event) => {
            if (this.isLocked) {
                this.onMouseMove(event);
            }
        });
        window.addEventListener('mouseup', () => {
            this.isLocked = false
        });
    }

    onMouseMove(event) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.yawObject.rotation.y -= movementX * 0.002;
        this.pitchObject.rotation.x -= movementY * 0.002;

        this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
    }

    getObject() {
        return this.yawObject;
    }

    update(delta) {
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

        this.yawObject.translateX(this.velocity.x * delta);
        this.yawObject.translateZ(this.velocity.z * delta);
    }
}

export { PointerLockControls };
