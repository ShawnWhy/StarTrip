import * as THREE from "three";
//import the GLTFLoader
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object

//impport a simple car model
//build it with generic forms
//add light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(5, 5, 5);
scene.add(light); 
//import a model from src/models/globe and made them into const


// const geometry = new THREE.BoxGeometry(1, 1, 1);
// //change to material that can accept light
// const material = new THREE.MeshStandardMaterial({ color: "blue" });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
// console.log("Mesh added");

const globeLoader = new GLTFLoader();
const treeLoader = new GLTFLoader();
let globe;
let treeTemplate;
let hasSpawnedTree = false;

const upAxis = new THREE.Vector3(0, 1, 0);

const getFirstMeshWithGeometry = (root) => {
  let meshWithGeometry = null;
  root.traverse((child) => {
    if (meshWithGeometry || !child.isMesh || !child.geometry?.attributes?.position) {
      return;
    }
    meshWithGeometry = child;
  });
  return meshWithGeometry;
};

const spawnTreeOnGlobeVertex = () => {
  if (hasSpawnedTree || !globe || !treeTemplate) {
    console.log("Cannot spawn tree: globe or tree template not ready.");
    return;
  }

  const globeMesh = getFirstMeshWithGeometry(globe);
  if (!globeMesh) {
    return;
  }

  const positionAttribute = globeMesh.geometry.attributes.position;
  const normalAttribute = globeMesh.geometry.attributes.normal;
  if (!positionAttribute) {
    return;
  }

  const randomVertexIndex = Math.floor(Math.random() * positionAttribute.count);
  const localVertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, randomVertexIndex);
  const localNormal = normalAttribute
    ? new THREE.Vector3().fromBufferAttribute(normalAttribute, randomVertexIndex).normalize()
    : localVertex.clone().normalize();

  globe.updateMatrixWorld(true);

  const worldVertex = localVertex.applyMatrix4(globeMesh.matrixWorld);
  const worldNormal = localNormal.transformDirection(globeMesh.matrixWorld).normalize();

  const tree = treeTemplate.clone(true);
  tree.position.copy(worldVertex);
  tree.position.addScaledVector(worldNormal, 0.03);
  tree.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(upAxis, worldNormal));
  tree.scale.setScalar(0.001);
  scene.add(tree);

  gsap.to(tree.scale, {
    duration: 0.7,
    x: 1,
    y: 1,
    z: 1,
    ease: "back.out(2.5)",
  });

  hasSpawnedTree = true;
};

globeLoader.load("./models/globe.glb", (gltf) => {
  console.log("Globe loading...");
  globe = gltf.scene;
  scene.add(globe);
  console.log("Globe loaded");
  console.log(globe);
  console.log(globe.position)
  //get the size of the globe
  const globeBox = new THREE.Box3().setFromObject(globe);
  const globeSize = new THREE.Vector3();
  globeBox.getSize(globeSize);
  console.log("Globe size:", globeSize);
  globe.position.y = -5;
});
//push globe to the bottom

//same for tree
treeLoader.load("./models/tree-1.glb", (gltf) => {
  treeTemplate = gltf.scene;
  console.log("Tree template loaded");
  console.log(treeTemplate);

});

window.addEventListener("wheel", () => {
  spawnTreeOnGlobeVertex();
}, { passive: true });
// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// RendererM
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Clock
const clock = new THREE.Clock();

// GSAP


// Animations
const tick = () => {
  // Clock
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  // One rotation per second
  // mesh.rotation.y = elapsedTime;

  // mesh.position.y = Math.sin(elapsedTime);
  // mesh.position.x = Math.cos(elapsedTime);

  // Updating camera will yield visually the same result, but it's because the camera is looking at the object
  // camera.position.y = Math.sin(elapsedTime);
  // camera.position.x = Math.cos(elapsedTime);
  // camera.lookAt(mesh.position);

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
