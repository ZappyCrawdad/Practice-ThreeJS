import  * as THREE from 'three';

export class CharacterController {
    constructor(personaje, animations, domElement) {// Se recibe el Modelo 3D, las Animaciones y elemento HTML donde va el canvas (no se usa, pero podria usarse para controles en el futuro).
        this.personaje = personaje;
        this.domElment = domElement; 

        //Move
        this.velocity = new THREE.Vector3(); //Punto o dirección en el plano 3D.
        this.direction = new THREE.Vector3(); //Punto o dirección en el plano 3D.
        this.speed = 0.05; //Que tan rapido camina el personaje.
        this.keys = { //Guarda si las teclas están presionadas por defecto.
            w: false, //'true' = comienza a caminar, despues depresionar w, se detiene.
            a: false,
            s: false,
            d: false
        }

        //! Animations ------------------------------------------>--->--->-------------------------------------------------------------
        this.mixer = new THREE.AnimationMixer(personaje); //Controla las animaciones de los personajes ('AnimationMixer': Actúa como un motor que controla y aplica las animaciones a un modelo 3D).
        this.actions = {}; //Guardamos todas las animaciones del personaje.
        this.currentActions = null; //? Cual animación se esta usando ahora.

        this._initAnimations(animations); //Llama a una función que procesa las animaciones.
        this._initListeners(); //Escucha las teclas.
    }

    _initAnimations(animations) { //! Prepara y activa las animaciones ------------------------------------------>--->
    animations.forEach((clip) => { //Se recorre cada animación del modelo una por una.

        clip.tracks = clip.tracks.filter(track => !track.name.toLowerCase().includes('.position')); //* Elimina las pistas de posición para que la animación no mueva la raíz.
        // Usaualmente cada animación tiene pistas(tracks) que indican qué parte del modelo se anima (.postiion, .rotation, .scale, etc.), esto dice: deja todos los tracks, excepto los que contienen .position en el nombre.

        this.actions[clip.name.toLowerCase()] = this.mixer.clipAction(clip); //* Guarda las animaciones.
        // 'clip.name.toLowerCase()': convierte el nombre de la animación en minúsculas, ejem "Idle" -> "ide".
        // 'this.mixer.clipAction(clip)': crea una acción reproducible (puedes hacer: .play(), .faOut(), etc.).
    });
    
    /*
    //* Sig, Se guarda en un diccionario llamado 'this.actions'.
    this.actions["idle"]  // ← acción lista para reproducirse
    this.actions["walk"]
    */

    //* Reproducir la animación "idle" al principio.
    if (this.actions['idle']) { //Si tenemos una animación llamada "idle":
        this.currentActions = this.actions['idle']; //La guardamos como la animación actual (currentActions).
        this.currentActions.play(); //Y la empezamos a reproducir.
    }
    }

    _initListeners() { //! Escucha cuando presionas o sultas teclas ------------------------------------------>--->
        window.addEventListener('keydown', (e) => this._onKeyChange(e, true)); //Escucha cuando presionas el teclado ('keydown') y ejecuta una función.
        window.addEventListener('keyup', (e) => this._onKeyChange(e, false)); //La funcion llama a 'this._onKeyChange(e, false)'.
        //Que es 'e'? Es el evento del teclado, que contiene información como 'e.key' (la tecla presionada).
    }
    
    //Cada vez que presionas o sueltas una tecla, llama a:
    _onKeyChange(event, isPressed) { //! Revisa qué tecla se presionó o soltó ------------------------------------------>--->
        const key = event.key.toLowerCase();
        if (key in this.keys) {
            this.keys[key] = isPressed; //Guarda en this.keys si una tecla (WASD) está presionada.
        }
    }

    _changeAnimations(name) { //! Cambia las animaciones  ------------------------------------------>--->
        if(this.currentActions === this.actions[name]) return;// Si ya estamos usando esta animación, no hagas nada.

        const nextAction = this.actions[name]; //Busca la animación con ese nombre.
        if(!nextAction) return; //Si no existe, no hace nada.

        this.currentActions?.fadeOut(0.3); //La animación actual se desvanezca suavemente durante 0.3s (El '?' se usa para evirtar errores si cuurentActions es null).
        nextAction.reset().fadeIn(0.3).play(); //Esta la animación nueva que: 
        // '.reset'- reinicia desde el principio, '.fadeIn(0.3)'- la hace aparecer suavemente en 0.3s, '.play'- la empieza a reproducir.
        this.currentActions = nextAction; //Esto guarda la nueva animación como la actual.
    }

    update(deltaTime) { //! Se llama para actualizar movimiento y animación  ------------------------------------------>
        if (!this.personaje) return;

        //-[Dirección y rotación]-
        this.direction.set(0, 0, 0); //Siempre adelante, en z local.
        this.rotationSpeed = 2; // radianes por segundo (ajustable)

        //Rotación A y D
        if(this.keys.a) {
            this.personaje.rotation.y += this.rotationSpeed * deltaTime; //(Presionar A): Girar a la izquierda.
        }  //'deltaTime': tiempo entre frames, se ajusta para que todo se mueva idual de rapido sin importar FPS.
        if(this.keys.d) {
            this.personaje.rotation.y -= this.rotationSpeed * deltaTime; //(Presionar D): Girar a la izquierda.
        }

        //! Animación según teclas ------------------------------------------>
        const moving = this.keys.w;
        const goback = this.keys.s;

        //Cambiar animación según
        //Adelante
        if(moving) {
            this._changeAnimations('walk');
         } else if(goback) {
            this._changeAnimations('back');
         } else {
            this._changeAnimations('idle');
        }
        
        //Movimiento hacia adelante o atrás
        let directionMultiplier = 0;
        if(this.keys.w) directionMultiplier = 1;
        if(this.keys.s) directionMultiplier = -1;

        if (directionMultiplier !== 0) {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.personaje.quaternion); //Usa la rotación del personaje 'quaternion' para moverse en la dirección que mira.

        forward.y = 0; // 👈 Forzamos que no se mueva en Y
        forward.normalize(); // importante después de modificar
        forward.multiplyScalar(this.speed * directionMultiplier);

        this.personaje.position.add(forward);
}

        //Actualizar animaciones segun el tiempo que ha pasado.
        this.mixer.update(deltaTime);
    }
}