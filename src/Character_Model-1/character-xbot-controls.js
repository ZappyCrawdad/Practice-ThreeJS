import  * as THREE from 'three';

export class CharacterController {
    constructor(personaje, animations, domElement) {
        this.personaje = personaje;
        this.domElment = domElement;

        //Move
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 0.05;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        }

        //Animations
        this.mixer = new THREE.AnimationMixer(personaje);
        this.actions = {};
        this.currentActions = null;

        this._initAnimations(animations);
        this._initListeners();
    }

    _initAnimations(animations) {
    animations.forEach((clip) => {
        // Elimina las pistas de posición para que la animación no mueva la raíz
        clip.tracks = clip.tracks.filter(track => !track.name.toLowerCase().includes('.position'));

        this.actions[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
    });

    if (this.actions['idle']) {
        this.currentActions = this.actions['idle'];
        this.currentActions.play();
    }
    }

    _initListeners() {
        window.addEventListener('keydown', (e) => this._onKeyChange(e, true));
        window.addEventListener('keyup', (e) => this._onKeyChange(e, false));
    }

    _onKeyChange(event, isPressed) {
        const key = event.key.toLowerCase();
        if (key in this.keys) {
            this.keys[key] = isPressed;
        }
    }

    _changeAnimations(name) {
        if(this.currentActions === this.actions[name]) return;

        const nextAction = this.actions[name];
        if(!nextAction) return;

        this.currentActions?.fadeOut(0.3);
        nextAction.reset().fadeIn(0.3).play();
        this.currentActions = nextAction;
    }

    update(deltaTime) {
        if (!this.personaje) return;

        this.direction.set(0, 0, 0); //Siempre adelante, en z local.

        this.rotationSpeed = 2; // radianes por segundo (ajustable)

        //Rotación A y D
        if(this.keys.a) {
            this.personaje.rotation.y += this.rotationSpeed * deltaTime;
        }
        if(this.keys.d) {
            this.personaje.rotation.y -= this.rotationSpeed * deltaTime;
        }

        if (this.keys.w && this.keys.a) this.direction.z += 1;
        if (this.keys.s && this.keys.d) this.direction.z += 1;

        const moving = this.keys.w || this.keys.s;

        //cambiar animación según movimiento
        if(moving) {
        this._changeAnimations('walk');
         } else {
            this._changeAnimations('idle');
        }

        //Movimiento hacia adelante / atrás
        if (moving) {
        const directionMultiplier = this.keys.w ? 1 : -1;

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.personaje.quaternion);

        forward.y = 0; // 👈 Forzamos que no se mueva en Y
        forward.normalize(); // importante después de modificar
        forward.multiplyScalar(this.speed * directionMultiplier);

        this.personaje.position.add(forward);
}

        //Actualizar animaciones
        this.mixer.update(deltaTime);
    }
}