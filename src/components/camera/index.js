import { ref } from 'vue'
const createCamera = (THREE) => {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    return { camera }
}

export default createCamera;