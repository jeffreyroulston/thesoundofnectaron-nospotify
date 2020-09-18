import { partition, scaleBand } from 'd3';
import * as THREE from 'three';
import SimplexNoise from "simplex-noise";
import ResourceManager from './resource-manager';

const EPS: number = 0.00001;

const simplex = new SimplexNoise();

function fit01(val: number, min: number, max: number) {
    return (val - min) / (max - min) + min;
}

const fireVert = `

    attribute float age;

    varying vec2 vUv;
    varying float vAge;

    void main() {
        vUv = uv;
        vAge = age;
        gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
    }
`

const fireFrag = `

    const float spriteDim = 5.0;

    uniform sampler2D flameTexture;

    varying vec2 vUv;
    varying float vAge;

    #define TINT vec3(186.0 / 255.0, 64.0 / 255.0, 0.0 / 255.0)

    void main() {
        float index = floor(vAge * spriteDim * spriteDim);
        float x = mod(index, spriteDim) / spriteDim;
        float y = 1.0 - floor(index / spriteDim) / spriteDim;
        vec2 spriteUvs = vUv * (1.0 / spriteDim) + vec2(x, y);
        vec4 texCol = texture2D(flameTexture, spriteUvs);
        vec3 color = mix(texCol.rgb, texCol.rgb * TINT, vAge);
        gl_FragColor = vec4(color, texCol.a);
        //gl_FragColor = vec4(index / spriteDim / spriteDim, 0.0, 0.0, 1.0);
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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
    
    // resizing
    private lastScreenSize: THREE.Vector2;
    private currentRendererSize: THREE.Vector2;
    private frameResized: boolean = true;

    // meshes
    private maxFlames: number = 1000;
    private spawnRate: number = 1000;
    private mesh: THREE.Mesh;
    private geo: THREE.BufferGeometry;
    private buffer: Float32Array;
    private ageBuffer: Float32Array;

    // flames
    private flames: FlamePoint[] = [];
    private currentAspect: number = 1.0;
    private currentSpeed: number = 1.0;

    // utilities
    private tempVector: THREE.Vector3 = new THREE.Vector3();
    private tempMatrix: THREE.Matrix3 = new THREE.Matrix3();

    // runspeed
    private shouldRun = false;

    constructor() {

        // timing
        this.clock = new THREE.Clock();

        // renderer elements
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.camera.position.z = 0;

        this.buffer = new Float32Array(this.maxFlames * 18.0);
        this.ageBuffer = new Float32Array(this.maxFlames * 6.0);
        this.geo = new THREE.BufferGeometry();
            
        const uvsBuffer = new Float32Array(this.maxFlames * 12.0);
        for (let i = 0; i < this.maxFlames; i++) {
            uvsBuffer[i * 12 + 0] = 0.0;
            uvsBuffer[i * 12 + 1] = 0.0;

            uvsBuffer[i * 12 + 2] = 0.0;
            uvsBuffer[i * 12 + 3] = 1.0;

            uvsBuffer[i * 12 + 4] = 1.0;
            uvsBuffer[i * 12 + 5] = 1.0;

            uvsBuffer[i * 12 + 6] = 0.0;
            uvsBuffer[i * 12 + 7] = 0.0;

            uvsBuffer[i * 12 + 8] = 1.0;
            uvsBuffer[i * 12 + 9] = 1.0;

            uvsBuffer[i * 12 + 10] = 1.0;
            uvsBuffer[i * 12 + 11] = 0.0;
        }

        this.geo.setAttribute('position', new THREE.Float32BufferAttribute(this.buffer, 3));
        this.geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvsBuffer, 2));
        this.geo.setAttribute('age', new THREE.Float32BufferAttribute(this.ageBuffer, 1));
        
        this.material = new THREE.ShaderMaterial({
            vertexShader: fireVert,
            fragmentShader: fireFrag,
            uniforms: {
                flameTexture: {value: undefined}
            },
            side: THREE.DoubleSide,
            transparent: true,
            // blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        for (let i = 0; i < this.maxFlames; i++) {
            let flame: FlamePoint = new FlamePoint();
            this.flames.push(flame);
        }

        // mesh and scene
        this.mesh = new THREE.Mesh(this.geo, this.material);
        this.mesh.frustumCulled = false;
        this.scene.add(this.mesh);

        this.clock.start();

        this.currentRendererSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.lastScreenSize = new THREE.Vector2();

        window.addEventListener('resize', () => {
            this.frameResized = true;
        });

        this.resize(window.innerWidth, window.innerHeight);

        this.update();
    }

    public get domElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public onInitResources(resourceManager: ResourceManager) {
        const image = resourceManager.getResourceByPath(HTMLImageElement, "assets/spritesheet.png");

        const tex = new THREE.Texture(image);
        tex.format = THREE.RGBAFormat;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;
        tex.needsUpdate = true;

        this.material.uniforms.flameTexture.value = tex;
    }

    public setSpeed(value: number) {
        this.currentSpeed = value;
    }

    public run() {
        this.shouldRun = true;
    }

    public update(): void {

        requestAnimationFrame(this.update.bind(this));

        if (!this.shouldRun) {
            return;
        }

        let dt = this.clock.getDelta();
        dt = Math.min(dt, 0.2);
        const elapsed = this.clock.getElapsedTime();

        this.updateParticles(elapsed, dt);

        this.updateGeometry(elapsed, dt);

        this.checkResize();

        // this.currentSpeed = Math.sin(elapsed * 0.5) + 1.0;

        this.renderer.render(this.scene, this.camera);
    }

    private updateParticles(elapsed: number, dt: number): void {

        // update all alive flame lifecycles
        this.flames.forEach((flame, idx) => {
            flame.update(elapsed, dt);
        });

        // spawn new flame
        const aspectSpawnRate = this.spawnRate * Math.min(1.0, this.currentAspect);
        const shouldHaveSpawned = Math.floor(aspectSpawnRate * elapsed % this.maxFlames);
        const haveAlreadySpawned = Math.floor(aspectSpawnRate * (elapsed - dt) % this.maxFlames);
        const toSpawn = shouldHaveSpawned - haveAlreadySpawned;

        for(let i = 0; i < toSpawn; i++) {
            let flame: FlamePoint | undefined;

            flame = this.flames[i + shouldHaveSpawned]

            if (flame !== undefined) {

                if (!flame.dead) {
                    continue;
                }

                let x = Math.random() * 2.0 - 1.0;
                let y = -1.5;
                let z = 0.0;
                this.tempVector.set(x * this.currentAspect, y, z);
    
                // let life = fit01(Math.random(), 0.5, 1.0);
                // let scale = fit01(Math.random(), 0.01, 0.05);

                let life = Math.random() * 0.5 + 0.5;
                let scale = Math.random() * 0.75 + 0.375;

                let speedChange = 1.0 + simplex.noise2D(x * 2.0, elapsed) * 0.5;
    
                flame.birth(this.tempVector, life, scale, this.currentSpeed * speedChange);
            }
        }
    }

    private checkResize(): void {
        if (!this.frameResized) {
            return;
        }

        this.frameResized = false;

        const currentWidth = this.renderer.domElement.clientWidth;// * window.devicePixelRatio;
        const currentHeight = this.renderer.domElement.clientHeight;// * window.devicePixelRatio;

        if (this.lastScreenSize.x !== currentWidth || this.lastScreenSize.y !== currentHeight) {
            this.resize(currentWidth, currentHeight);
            this.lastScreenSize.set(currentWidth, currentHeight);
        }
    }

    public resize(width: number, height: number): void {
        this.renderer.setSize(width * 0.5, height * 0.5);
        this.renderer.getDrawingBufferSize(this.currentRendererSize);


        // this.material.uniforms.size.value.copy(this.currentRendererSize);
        // this.waterMaterial.uniforms.size.value.copy(this.currentRendererSize);

        this.currentAspect = width / height;
        this.camera.left = -this.currentAspect;
        this.camera.right = this.currentAspect;
        this.camera.updateProjectionMatrix();
    }

    private updateGeometry(elapsed: number, dt: number): void {
        const aliveParticles = this.flames.length;
        const position = this.buffer;
        const ageBuffer = this.ageBuffer;
        let aliveParticlesCount = 0;

        for (let index = 0; index < aliveParticles; index++) {
            const particle = this.flames[index];
            if (particle.dead) {
                continue;
            }

            let randomRotation = (simplex.noise2D(particle.id, elapsed) * 0.5 + 0.5) * 2.0 * Math.PI;
            this.tempMatrix.elements[0] = this.tempMatrix.elements[4] = Math.cos(randomRotation);
            this.tempMatrix.elements[3] = -Math.sin(randomRotation);
            this.tempMatrix.elements[1] = Math.sin(randomRotation);
            this.tempMatrix.elements[8] = 1;

            aliveParticlesCount += 1;
            const positionIndex = aliveParticlesCount * 18;
            const ageIndex = aliveParticlesCount * 6;

            this.tempVector.set(-particle.scale, -particle.scale, 0.0);
            this.tempVector.applyMatrix3(this.tempMatrix);
            position[positionIndex + 0] = particle.position.x + this.tempVector.x;
            position[positionIndex + 1] = particle.position.y + this.tempVector.y;
            position[positionIndex + 2] = 0.0;
            
            this.tempVector.set(-particle.scale, particle.scale, 0.0);
            this.tempVector.applyMatrix3(this.tempMatrix);
            position[positionIndex + 3] = particle.position.x + this.tempVector.x;
            position[positionIndex + 4] = particle.position.y + this.tempVector.y;
            position[positionIndex + 5] = 0.0;

            this.tempVector.set(particle.scale, particle.scale, 0.0);
            this.tempVector.applyMatrix3(this.tempMatrix);
            position[positionIndex + 6] = particle.position.x + this.tempVector.x;
            position[positionIndex + 7] = particle.position.y + this.tempVector.y;
            position[positionIndex + 8] = 0.0;

            this.tempVector.set(-particle.scale, -particle.scale, 0.0);
            this.tempVector.applyMatrix3(this.tempMatrix);
            position[positionIndex + 9] = particle.position.x + this.tempVector.x;
            position[positionIndex + 10] = particle.position.y + this.tempVector.y;
            position[positionIndex + 11] = 0.0;

            this.tempVector.set(particle.scale, particle.scale, 0.0);
            this.tempVector.applyMatrix3(this.tempMatrix);
            position[positionIndex + 12] = particle.position.x + this.tempVector.x;
            position[positionIndex + 13] = particle.position.y + this.tempVector.y;
            position[positionIndex + 14] = 0.0;

            this.tempVector.set(particle.scale, -particle.scale, 0.0);
            this.tempVector.applyMatrix3(this.tempMatrix);
            position[positionIndex + 15] = particle.position.x + this.tempVector.x;
            position[positionIndex + 16] = particle.position.y + this.tempVector.y;
            position[positionIndex + 17] = 0.0;

            ageBuffer[ageIndex + 0] = particle.normalisedAge;
            ageBuffer[ageIndex + 1] = particle.normalisedAge;
            ageBuffer[ageIndex + 2] = particle.normalisedAge;
            ageBuffer[ageIndex + 3] = particle.normalisedAge;
            ageBuffer[ageIndex + 4] = particle.normalisedAge;
            ageBuffer[ageIndex + 5] = particle.normalisedAge;
        }

        if (this.geo.attributes.position instanceof THREE.BufferAttribute) {
            this.geo.attributes.position.copyArray(this.buffer);
            this.geo.attributes.position.needsUpdate = true;
        }   

        if (this.geo.attributes.age instanceof THREE.BufferAttribute) {
            this.geo.attributes.age.copyArray(this.ageBuffer);
            this.geo.attributes.age.needsUpdate = true;
        }

        this.geo.setDrawRange(0, aliveParticlesCount * 6.0);
    }

    public destroy() {
        this.shouldRun = false;
        this.material.dispose();
        this.geo.dispose();
        this.flames = [];
        this.renderer.dispose();
    }
}

class FlamePoint {

    private _position: THREE.Vector3 = new THREE.Vector3();

    static currentID = 0;
    private _id: number = 0;
    private speed: number = 0;
    private _life: number = 0;
    private _age: number = 0;
    private _scale: number = 0;

    constructor() {
        this._id = FlamePoint.currentID++;
    }

    public get id(): number {
        return this._id;
    }

    public birth(startingPosition: THREE.Vector3, life: number, scale: number, speed: number): void {
        this._position.copy(startingPosition);
        this._life = life;
        this._scale = scale;
        this._age = 0;
        this.speed = speed;
    }

    public update(elapsed: number, dt: number) {
        this._age += dt;

        if (!this.dead) {
            this._position.y += this.speed * dt;
            this._position.x += simplex.noise3D(this.position.y * 2.0, this.position.x * 2.0, elapsed) * dt * this.speed * 0.25;
        }
    }

    public get position(): THREE.Vector3 {
        return this._position;
    }

    public get dead(): boolean {
        return this.normalisedAge >= 1.0 - EPS; 
    }

    public get age(): number {
        return this._age;
    }

    public get scale(): number {
        return this._scale * (1.0 - this.normalisedAge);
    }

    public get normalisedAge(): number {
        return Math.min(this._age / this._life, 1.0);
    }
}
