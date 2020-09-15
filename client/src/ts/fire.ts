import * as THREE from 'three';
import { Vector3 } from 'three';

const EPS: number = 0.00001;

function fit01(val: number, min: number, max: number) {
    return (val - min) / (max - min);
}

const fireVert = `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
`

const fireFrag = `
    void main() {
        gl_FragColor = vec4(1.0);
    }
`

export default class Fire {

    // timing
    private clock: THREE.Clock;

    // renderer elements
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.OrthographicCamera;

    // materials
    private material: THREE.ShaderMaterial;

    // meshes
    private maxFlames: number = 1000;
    private spawnRate: number = 10;
    private mesh: THREE.Mesh;
    private geo: THREE.BufferGeometry;
    private buffer: Float32Array;

    // flames
    private deadFlames: FlamePoint[] = [];
    private aliveFlames: FlamePoint[] = [];

    constructor() {

        // timing
        this.clock = new THREE.Clock();

        // renderer elements
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.camera = new THREE.OrthographicCamera(2, -2, 2, 2, 0, 2);

        this.buffer = new Float32Array(this.maxFlames * 6);
        this.geo = new THREE.BufferGeometry();
        this.geo.setAttribute('position', new THREE.Float32BufferAttribute(this.buffer, 0));
        
        this.material = new THREE.ShaderMaterial({
            vertexShader: fireVert,
            fragmentShader: fireFrag,
            uniforms: {

            }
        });

        for (let i = 0; i < this.maxFlames; i++) {
            let flame: FlamePoint = new FlamePoint();

            this.deadFlames.push(flame);
        }

        // mesh and scene
        this.mesh = new THREE.Mesh(this.geo, this.material);
        //this.scene.add(this.mesh);

        this.clock.start();

        this.update();
    }

    public get domElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public update(): void {

        requestAnimationFrame(this.update.bind(this));

        const dt = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        this.updateParticles(elapsed, dt);

        this.updateGeometry();

        this.renderer.render(this.scene, this.camera);
    }

    private updateParticles(elapsed: number, dt: number): void {
        const newDead: {flame: FlamePoint, index: number}[] = [];

        const tempVector: THREE.Vector3 = new Vector3();

        // update all alive flame lifecycles
        this.aliveFlames.forEach((flame, idx) => {
            flame.update(elapsed, dt);

            // if flame is dead mark as such
            if (flame.dead) {
                newDead.push({flame: flame, index: idx});
            }
        });

        // spawn new flame

        const shouldHaveSpawned = Math.floor(this.spawnRate / elapsed);
        const haveAlreadySpawned = Math.floor(this.spawnRate / (elapsed - dt));
        const toSpawn = shouldHaveSpawned - haveAlreadySpawned;

        for(let i = 0; i < toSpawn; i++) {
            let flame: FlamePoint | undefined;

            if (newDead.length > 0) {
                const flameMarker = newDead.pop();
                if (flameMarker !== undefined) {
                    flame = flameMarker.flame;
                }
            }

            else if (this.deadFlames.length > 0) {
                flame = this.deadFlames.pop();
            }

            if (flame !== undefined) {
                let x = Math.random() * 2.0 - 1.0;
                let y = -1.0;
                let z = 0.0;
                tempVector.set(x, y, z);
    
                let life = fit01(Math.random(), 0.5, 1.0);
                let scale = fit01(Math.random(), 0.01, 0.05);
    
                flame.birth(tempVector, life, scale);
                this.aliveFlames.push(flame);
            }
        }

        newDead.forEach((flameMarker) => {
            this.aliveFlames.splice(flameMarker.index, 1);
            this.deadFlames.push(flameMarker.flame);
        });
    }

    private updateGeometry(): void {

    }
}

class FlamePoint {

    private position: Vector3 = new THREE.Vector3();

    private _life: number = 0;
    private _age: number = 0;
    private _scale: number = 0;

    public birth(startingPosition: THREE.Vector3, life: number, scale: number): void {
        this.position.copy(startingPosition);
        this._life = life;
        this._scale = scale;
    }

    public update(elapsed: number, dt: number) {
        this.position.y += 0.01 * dt;

        this._age += dt;
    }

    public get dead(): boolean {
        return this.normalisedAge >= 1.0 - EPS; 
    }

    public get age(): number {
        return this._age;
    }

    public get scale(): number {
        return this._scale * this.normalisedAge;
    }

    public get normalisedAge(): number {
        return Math.min(this._age / this._life, 1.0);
    }
}
