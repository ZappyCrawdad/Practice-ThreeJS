// src/models/personaje.js
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * Carga el modelo FBX del personaje y lo añade a la escena.
 * @param {THREE.Scene} scene - Escena principal donde añadir el modelo.
 * @param {Function} onLoad - Callback opcional para cuando el modelo esté listo.
 */

export function loadFBXPersonaje(scene, onLoad = () => {}) {
    const loader = new FBXLoader();

    //! Se carga el modelo base
    loader.load('/models/character-1/X Bot.fbx', (fbx) => {
        fbx.scale.set(0.025, 0.025, 0.025);
        //fbx.updateMatrixWorld(true);
        fbx.position.set(0, 0.5, 0);
        scene.add(fbx);

        const animationPaths = {
            idle:'/models/character-1/animations/Standing Idle.fbx',
            walk: '/models/character-1/animations/Dwarf Walk.fbx'
        };
        
        const animations = {};
        let loadedCount = 0;
        const totalToLoad = Object.keys(animationPaths).length;

        for (const [name, path] of Object.entries(animationPaths)) {
            loader.load(path, (animFBX) => {
                console.log(`✅ Animación ${name}:`, animFBX.animations[0].name);
                animations[name] = animFBX.animations[0]; //Tomamos la primera animación.
                animations[name].name = name; // ← le pones el nombre esperado: 'idle' o 'walk'
                loadedCount++;

                if (loadedCount === totalToLoad) {
                    const clips = Object.values(animations);
                    onLoad(fbx, clips);
                    //Pasamos el personaje + animaciones.
                }
            }, undefined, (err) => {
                console.error(`❌ Error al cargar animación ${name}:`, err);
            });
        }
    },
    undefined, 
    (error) => {
        console.error('❌ Error al cargar personaje FBX:', error);
});
}
