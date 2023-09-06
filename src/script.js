import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

/**
 * Standard
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Debug
const gui = new dat.GUI()

// Scene
const scene = new THREE.Scene()

// Axis Helper
const axisHelper = new THREE.AxesHelper(2);
axisHelper.visible = false
gui.add(axisHelper, 'visible')
scene.add(axisHelper);

/** 
* Loaders
*/
// Loading Manager
const loadingManager = new THREE.LoadingManager(
    () => console.log('loaded'),
    () => console.log('loading'),
    () => console.log('error')
);

// Font Loader
const fontLoader = new FontLoader(loadingManager);

// Texture Loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Load Textures
const matcapMaterial = textureLoader.load('/textures/matcaps/8.png')

// load Material
const material = new THREE.MeshMatcapMaterial({matcap: matcapMaterial})

// Load Fonts
fontLoader.load('/fonts/helvetiker_regular.typeface.json', 
(font) => {
    const textGeometry = new TextGeometry('Hello Three.js', {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 4
    })
    textGeometry.center();
    // textGeometry.computeBoundingBox();
    // textGeometry.translate(
    //     -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
    //     -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
    //     -(textGeometry.boundingBox.max.z - 0.03) * 0.5
    // )

    const textMesh = new THREE.Mesh(textGeometry, material)
    scene.add(textMesh)
})

// Add knot geometries
const knotGeometry = new THREE.TorusGeometry(.3, .2, 20, 45);


// Add randomized knots to scene

for(let i = 0; i <= 300; i++){
    const knotMesh = new THREE.Mesh(knotGeometry, material);
    // position
    knotMesh.position.x = (Math.random() - 0.5) * 15
    knotMesh.position.y = (Math.random() - 0.5) * 15
    knotMesh.position.z = (Math.random() - 0.5) * 15

    // rotation
    knotMesh.rotateX(Math.random() * Math.PI)
    knotMesh.rotateY(Math.random() * Math.PI)

    // scale
    const scale = Math.random()
    knotMesh.scale.set(scale,scale,scale)

    // Animation info
    knotMesh.animationInfo = {
        rotationX: (Math.random() - 0.5) * 10,
        rotationY: (Math.random() - 0.5) * 10,
        movementX: (Math.random() - 0.5) * 0.08, 
        movementY: (Math.random() - 0.5) * 0.08,
        movementZ: (Math.random() - 0.5) * 0.08,
        positionX: knotMesh.position.x,
        positionY: knotMesh.position.y,
        positionZ: knotMesh.position.z
    }

    // add to scene
    scene.add(knotMesh)
}

console.log(scene)


THREE.ColorManagement.enabled = false

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 11
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0;

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // Update Objects
    scene.children.forEach(
        (ele) => {
            if(ele.animationInfo) {
                ele.rotation.x = elapsedTime * ele.animationInfo.rotationX
                ele.rotation.y = elapsedTime * ele.animationInfo.rotationY
                ele.position.x += ele.animationInfo.movementX 
                ele.position.y += ele.animationInfo.movementY 
                ele.position.z += ele.animationInfo.movementZ
                
                
                if(ele.position.x >= 10 || ele.position.x <= - 10){
                    ele.animationInfo.movementX *= -1;
                }
                if(ele.position.y >= 10 || ele.position.y <= - 10){
                    ele.animationInfo.movementY *= -1;
                }
                if(ele.position.z >= 10 || ele.position.z <= - 10){
                    ele.animationInfo.movementZ *= -1;
                }
            }
            
        }
    )

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()