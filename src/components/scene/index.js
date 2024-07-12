import { ref } from 'vue'
const createScene = (THREE) => {
    const scene = new THREE.Scene()
    return { scene }
}

export default createScene;