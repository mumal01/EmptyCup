let isPaused = false;
let darkMode = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const starsGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starVertices = [];
for (let i = 0; i < starCount; i++) {
  starVertices.push((Math.random() - 0.5) * 1000);
  starVertices.push((Math.random() - 0.5) * 1000);
  starVertices.push((Math.random() - 0.5) * 1000);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const stars = new THREE.Points(starsGeometry, starMaterial);
scene.add(stars);

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const pointLight = new THREE.PointLight(0xffffff, 2.5, 500);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(ambientLight);

camera.position.z = 100;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.color = 'white';
tooltip.style.padding = '4px 8px';
tooltip.style.background = 'rgba(0,0,0,0.7)';
tooltip.style.borderRadius = '4px';
tooltip.style.display = 'none';
tooltip.style.pointerEvents = 'none';
document.body.appendChild(tooltip);

const planetsData = [
  { name: "Mercury", color: 0xaaaaaa, size: 1.2, distance: 10, speed: 0.02 },
  { name: "Venus", color: 0xffcc66, size: 1.5, distance: 14, speed: 0.015 },
  { name: "Earth", color: 0x3399ff, size: 1.6, distance: 18, speed: 0.01 },
  { name: "Mars", color: 0xff3300, size: 1.3, distance: 22, speed: 0.008 },
  { name: "Jupiter", color: 0xff9966, size: 2.4, distance: 27, speed: 0.005 },
  { name: "Saturn", color: 0xffff99, size: 2.2, distance: 32, speed: 0.004 },
  { name: "Uranus", color: 0x66ffff, size: 1.8, distance: 37, speed: 0.003 },
  { name: "Neptune", color: 0x3366ff, size: 1.7, distance: 42, speed: 0.002 }
];

const planets = [];
const pivots = [];

const controls = document.getElementById("controls");

planetsData.forEach((data, index) => {
  const geometry = new THREE.SphereGeometry(data.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.4, metalness: 0.2 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { name: data.name };

  const pivot = new THREE.Object3D();
  mesh.position.x = data.distance;
  pivot.add(mesh);
  scene.add(pivot);

  planets.push({ mesh, speed: data.speed });
  pivots.push(pivot);

  const label = document.createElement("label");
  label.innerText = `${data.name} Speed:`;
  const input = document.createElement("input");
  input.type = "range";
  input.min = 0;
  input.max = 0.05;
  input.step = 0.001;
  input.value = data.speed;
  input.addEventListener("input", (e) => {
    planets[index].speed = parseFloat(e.target.value);
  });
  controls.appendChild(label);
  controls.appendChild(input);
});

const pauseBtn = document.createElement("button");
pauseBtn.id = "pauseBtn";
pauseBtn.innerText = "Pause";
pauseBtn.onclick = () => {
  isPaused = !isPaused;
  pauseBtn.innerText = isPaused ? "Resume" : "Pause";
};
controls.appendChild(pauseBtn);

const themeBtn = document.createElement("button");
themeBtn.id = "themeToggle";
themeBtn.innerText = "Toggle Dark/Light";
themeBtn.onclick = () => {
  darkMode = !darkMode;
  document.body.style.background = darkMode ? "radial-gradient(circle, #000010 0%, #000000 100%)" : "#f0f0f0";
  controls.style.background = darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)";
  controls.style.color = darkMode ? "white" : "black";
};
controls.appendChild(themeBtn);

const zoomInBtn = document.createElement("button");
zoomInBtn.innerText = "+ Zoom In";
zoomInBtn.onclick = () => {
  camera.position.z -= 5;
};
controls.appendChild(zoomInBtn);

const zoomOutBtn = document.createElement("button");
zoomOutBtn.innerText = "- Zoom Out";
zoomOutBtn.onclick = () => {
  camera.position.z += 5;
};
controls.appendChild(zoomOutBtn);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    planets.forEach((planet, i) => {
      pivots[i].rotation.y += planet.speed;
    });
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (intersects.length > 0) {
    tooltip.innerText = intersects[0].object.userData.name;
    tooltip.style.left = `${(mouse.x + 1) * window.innerWidth / 2}px`;
    tooltip.style.top = `${(-mouse.y + 1) * window.innerHeight / 2}px`;
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    const newPos = planet.getWorldPosition(new THREE.Vector3()).clone();
    camera.position.set(newPos.x * 1.2, newPos.y * 1.2, newPos.z * 1.5);
    camera.lookAt(0, 0, 0);
  }
});

window.addEventListener("wheel", (event) => {
  camera.position.z += event.deltaY * 0.05;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
