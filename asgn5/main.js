// import './asgn5.css'
// import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
// import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
// import { OBJLoader } from "https://unpkg.com/three@0.126.1/examples/jsm/loaders/OBJLoader.js";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// every three.js project needs a scene, camera, and renderer
const scene = new THREE.Scene();
// https://threejs.org/manual/#en/fog
{
  // https://jaxry.github.io/panorama-to-cubemap/
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    './resources/textures/px.png',
    './resources/textures/nx.png',
    './resources/textures/py.png',
    './resources/textures/ny.png',
    './resources/textures/pz.png',
    './resources/textures/nz.png',
  ]);
  scene.background = texture;
  
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
renderer.setSize(window.innerWidth, window.innerHeight); // full screen!
camera.position.setZ(30);
renderer.render(scene, camera) // draws to screen

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
scene.add(hemisphereLightHelper);

// add grid plane
const gridHelper = new THREE.GridHelper(200, 50); // draws a grid plane 
gridHelper.raycast = () => {}; // make it so the raycast can't select the grid!
scene.add(gridHelper);

// create cube in the middle of teapot
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
// fill an array of 100 stars
Array(100).fill().forEach(addStar); 

// billboard stuff
function makeLabelCanvas(size, name) {
  const borderSize = 2;
  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${size}px bold sans-serif`;
  ctx.font = font;
  // measure how long the name will be
  const doubleBorderSize = borderSize * 2;
  const width = ctx.measureText(name).width + doubleBorderSize;
  const height = size + doubleBorderSize;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
 
  // need to set font again after resizing canvas
  ctx.font = font;
  ctx.textBaseline = 'top';
 
  ctx.fillStyle = 0xd15ee6;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'white';
  ctx.fillText(name, borderSize, borderSize);
 
  return ctx.canvas;
}

function makeBillboard(x, size, name, color) {
  const canvas = makeLabelCanvas(size, name);
  const texture = new THREE.CanvasTexture(canvas);
  // because our canvas is likely not a power of 2
  // in both dimensions set the filtering appropriately.
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
 
  const labelMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color,
    flatShading: true,
  });
 
  const root = new THREE.Object3D();
  root.position.x = x;
 
  const label = new THREE.Sprite(labelMaterial);
  root.add(label);
  label.position.x = 0;
  label.position.y = 18;
  label.position.z = 0;

  // if units are meters then 0.01 here makes size
  // of the label into centimeters.
  const labelBaseScale = 0.05;
  label.scale.x = canvas.width  * labelBaseScale;
  label.scale.y = canvas.height * labelBaseScale;
 
  scene.add(root);
  return root;
}
// https://threejs.org/manual/#en/billboards
makeBillboard(0, 32, 'The Astral Plane.', '#ff0000');

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

// create mouse and raycaster object
const mouse = new THREE.Vector2(-100000, -100000);
const raycaster = new THREE.Raycaster();

// get mouse coords
function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove);

// add a source image to the background! (i dont like how it looks though, esp with moving around)
// const spaceTexture = new THREE.TextureLoader().load('./textures/space-bg.jpg');
// scene.background = spaceTexture;

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.001;
  torus.rotation.y += 0.001;
  torus.rotation.z += 0.001;

  // change color based on time
  const time = performance.now() * 0.001; 
  const hue = (time * 0.1) % 1;
  magicCubeMaterial.color.setHSL(hue, 1, 0.5);

  magicCubeMesh.rotation.x += 0.01;
  magicCubeMesh.rotation.y += 0.01;

  // https://threejs.org/manual/#en/picking
  // update raycaster using mouse coordinates
  raycaster.setFromCamera(mouse, camera);
  // check intersections against all objects 
  const intersects = raycaster.intersectObjects(scene.children, true);
  scene.traverse(child => {
    if (child.isMesh && child.material && child.material.emissive) {
      child.material.emissive.setHex(0x000000);
    }
  });
  // if intersects with something, flash colors!
  if (intersects.length > 0) {
    const picked = intersects[0].object;
    const highlightColor = (time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000;
  
    if (Array.isArray(picked.material)) {
      picked.material.forEach(mat => {
        if (mat.emissive) {
          mat.emissive.setHex(highlightColor);
        }
      });
    } else {
      if (picked.material.emissive) {
        picked.material.emissive.setHex(highlightColor);
      }
    }
  }

  controls.update(); // update screen w user controls!

  renderer.render(scene, camera);
}

animate()