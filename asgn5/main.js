// import './asgn5.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// every three.js project needs a scene, camera, and renderer
const scene = new THREE.Scene();
// https://threejs.org/manual/#en/fog
{
  const near = 50;
  const far = 60;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
}

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#c'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); //full screen!
camera.position.setZ(30);

renderer.render(scene, camera) //draws to screen

// https://threejs.org/docs/index.html#api/en/geometries/TorusGeometry
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
// const material = new THREE.MeshBasicMaterial( {color:0xFF6347, wireframe: true} );
// const material = new THREE.MeshStandardMaterial( {color:0xFF6347} ); //allows light to bounce off of it
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./resources/textures/donut.jpg');
const texturedMaterial = new THREE.MeshStandardMaterial({ map: texture });

const torus = new THREE.Mesh(geometry, texturedMaterial);
scene.add(torus);

// point light!
const pointLight = new THREE.PointLight(0xff0000, 120); 
pointLight.position.set(0, 4, 0);
scene.add(pointLight);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

// ambient light!
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
scene.add(ambientLight);

// directional light!
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(20, 0, 0);
directionalLight.target.position.set(-5, 0, 0);
const dlightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLight);
scene.add(dlightHelper);

// hemisphere light!
const skyColor = 0xd15ee6;  // light blue
const groundColor = 0x290130; // dark purple
const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 1);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight);
scene.add(hemisphereLightHelper, 5);

// add grid plane
const gridHelper = new THREE.GridHelper(200, 50); // draws a grid plane 
scene.add(gridHelper);

const magicCubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const magicCubeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xffffff) });
const magicCubeMesh = new THREE.Mesh(magicCubeGeometry, magicCubeMaterial);
magicCubeMesh.position.set(0, 0.3, 0);
scene.add(magicCubeMesh);

const controls = new OrbitControls(camera, renderer.domElement); // mouse can click and pan around!

function addStar() {
    
    // random geometry
    const rad = THREE.MathUtils.randFloat(0.05, 1);
    const starGeometries = [
        (rad) => new THREE.CylinderGeometry(rad, rad, rad*3),
        (rad) => new THREE.SphereGeometry(rad),
        (rad) => new THREE.BoxGeometry(rad*2, rad*2, rad*2)
    ];
    const starGeometry = starGeometries[Math.floor(Math.random() * starGeometries.length)](rad);

    // random texture
    const textureLoader = new THREE.TextureLoader();
    const starTextures = [
        textureLoader.load('./resources/textures/star.jpg'),
        textureLoader.load('./resources/textures/star2.jpg'),
        textureLoader.load('./resources/textures/star3.jpg')
    ]
    const starTexture = starTextures[Math.floor(Math.random() * starTextures.length)];
    const starMaterial = new THREE.MeshStandardMaterial({
        map: starTexture
      });
    // const colors = [0xFFFFFF, 0xF8DE7E, 0xFCF4A3];
    // const material = new THREE.MeshBasicMaterial( {color: colors[Math.floor(Math.random() * colors.length)], wireframe: true} );

    const star = new THREE.Mesh(starGeometry, starMaterial);

    // use THREE.js randfloatspread to generate random coordnates!
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}

// fill an array of 200 stars
Array(50).fill().forEach(addStar); 

// https://graphics.stanford.edu/courses/cs148-10-summer/as3/code/as3/teapot.obj
const objLoader = new OBJLoader();
objLoader.load('./resources/models/teapot.obj', (root) => {
    // traverse chilren
    root.traverse((child) => {
        if (child.isMesh) {
          // if multiple materials, update each one
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.wireframe = true);
          } else {
            child.material.wireframe = true;
          }
        }
      });

    root.position.set(0, -1, 0);
    scene.add(root);
});

// add a source image to the background! (i dont like how it looks though, esp with moving around)
// const spaceTexture = new THREE.TextureLoader().load('./textures/space-bg.jpg');
// scene.background = spaceTexture;

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  // change color based on time
  const time = performance.now() * 0.001; 
  const hue = (time * 0.1) % 1;
  magicCubeMaterial.color.setHSL(hue, 1, 0.5);

  magicCubeMesh.rotation.x += 0.01;
  magicCubeMesh.rotation.y += 0.01;

  controls.update(); //update screen w user controls!

  renderer.render(scene, camera);
}

animate()