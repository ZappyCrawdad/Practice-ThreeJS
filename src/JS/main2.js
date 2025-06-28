import "../../src/style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//X Bot: Character-1
import { loadFBXPersonaje } from '../2nd_Character/character';

//X Bot Character-1 Controls
import { CharacterController } from '../2nd_Character/character-controls';


let personajeController;
const clock = new THREE.Clock(); // al inicio de tu archivo

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  //Guarda el tamaño de laventana para usarlo en la camara y render.
  width: window.innerWidth,
  height: window.innerHeight,
};


//! Loaders  ------- Para cargar Modelos y Texturas.
const textureLoader = new THREE.TextureLoader(); //Cargar imágenes que luego puedes aplicar como texturas.

//*Model Loader
const dracoLoader = new DRACOLoader(); //Cargar modelos comprimidos en formato .glb/.gltf que usen DRACO.
dracoLoader.setDecoderPath("/draco/"); //Ubicación del decodificador.

const loader = new GLTFLoader(); //Carga modelos .glb o .gltf
loader.setDRACOLoader(dracoLoader); //Si el modelo esta comprimido, usa el decodificador.

//? Cambiar entre Dia y Noche.
const textureMap = { //Objeto que almacena rutas apra cambiar el entorno.
  First: {
    day: "/textures/room/day/first_texture_set_day.webp",
    night: "/textures/room/night/first_texture_set_night.webp",
  },
  Second: {
    day: "/textures/room/day/second_texture_set_day.webp",
    night: "/textures/room/night/second_texture_set_night.webp",
  },
  Third: {
    day: "/textures/room/day/third_texture_set_day.webp",
    night: "/textures/room/night/third_texture_set_night.webp",
  },
  Fourth: {
    day: "/textures/room/day/fourth_texture_set_day.webp",
    night: "/textures/room/night/fourth_texture_set_night.webp",
  },
};

const loadedTextures = { //Aquí se guardan las texturas ya cargadas, listas para usarse.
  day: {},
  night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => { //Recorre el textureMap y cargas cada imagen.
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false; //Para voltear el eje Y de las texturas
  dayTexture.colorSpace = THREE.SRGBColorSpace //Para indicar a ThreeJS que la textura que estoy usando es en el espacio de color sRGB.
  loadedTextures.day[key] = dayTexture; //Cada textura se guarda en el objeto loadedTextures.

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false; //Para voltear el eje Y de las texturas
  nightTexture.colorSpace = THREE.SRGBColorSpace //(si cambia los colores)
  loadedTextures.night[key] = nightTexture;
});

loader.load("/models/Room_Portfolio.glb", (glb) => { //Se carga el modelo y se ejecuta la función (glb){...}
  glb.scene.traverse((child) => { //-Recorre todos los objetos dentro del modelo. -Para cada objeto (child):
    if (child.isMesh) { //Verifica si 'child' es un malla (isMesh).

      Object.entries(textureMap).forEach(([key]) => { //Esto recorre cada conjunto de texturas que se definio en textureMap: ('First', 'Second', ...).
        if (child.name.includes(key) && loadedTextures.day[key]) { // Verifica si el nombre del objeto(child.name) incluye 'First', 'Second', etc.
                                                                // Tambien asegura que la textura de día (loadedTextures.day[key]) existe y esta cargada.
            
            //? Se aplica la texura de día o noche.
          const material = new THREE.MeshBasicMaterial({ //Se crea un nuevo material basico (no necesita luces).
            map: loadedTextures.day[key], //Le aplica la textura correspondiente del mapa (loadedTextures.day[key]).
          });
          child.material = material; //Remplaza el matrial original con este nuevo.
        }
      });
    }
  });

  scene.add(glb.scene); //Se agrega el modelo a l aescena

  //? Carga de Personaje
loadFBXPersonaje(scene, (personaje, animations) => {
    personajeController = new CharacterController(personaje, animations, camera, renderer.domElement);
  console.log('✅ Modelo FBX cargado:', personaje.name);
  
});
  //?

});
//! Loaders ------- Fin. 


const scene = new THREE.Scene(); //Se crea la escena.

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);


const camera = new THREE.PerspectiveCamera(
  75, // campo de visión.
  sizes.width / sizes.height, //relación ancho / alto.
  0.1, //plano cercano.
  1000 //plano lejano.
);

camera.position.z = 20; //aleja la camara para ver el cubo.

//Crea un render.
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); //-'WebGLRenderer' tipo de render que convierte a pixeles en el canvas. -'antialias' para suavizar los bordes.
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //'setPixelRatio' mejora la calidad visual en pantallas Retina (limitado a 2 para no abusar de la GPU).
//Crear cubo.
const geometry = new THREE.BoxGeometry(1, 1, 1); //Forma del cubo.
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); //Color sin luces.
const cube = new THREE.Mesh(geometry, material); //Une geometria + material -> objeto que puedes mostrar.
scene.add(cube); //Se agrega a la escena.

//*Controls
const controls = new OrbitControls(camera, renderer.domElement); //Controles para mause: zoom, rotar y mover ('click' derecho).
controls.enableDamping = true; //Suavizado de mivimiento.
controls.dampingFactor = 0.05; //Que tan fuerte es el frenado del movimiento.
controls.update(); //por seguridad.

//? Camara angulo
// Cámara a 10 grados alrededor del eje Y ------------ rotación de la camara
const angle = THREE.MathUtils.degToRad(20);//rota alrededor
const radius = 20;//rota

camera.position.x = Math.sin(angle) * radius;
camera.position.y = Math.cos(angle) * radius;
camera.position.z = 20; // altura (desde donde mira)

controls.target.set(0, 0, 0); // Mira al centro
controls.update(); // aplicar cambio
//?

//! Event Listeners ------- Redimensionar la ventana.
window.addEventListener("resize", () => {
  //* Update Size
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //* Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //* Update Rederer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {}

const render = () => {
  const deltaTime = clock.getDelta(); // tiempo entre frames
  //controls.update(); //Hace que los controles se actualicen.

  if (personajeController) {
    personajeController.update(deltaTime);
  }

  //Animar escena.
  cube.rotation.x += 0.01; //Hace que gire consecutivamente.
  cube.rotation.y += 0.01;

  renderer.render(scene, camera); //Se dibuja la escena con la camara.

  window.requestAnimationFrame(render); //Crea un bucle de animación.
};

render();
