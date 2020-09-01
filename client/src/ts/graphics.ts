import ResourceManager from "./resource-manager";
import * as THREE from 'three';
import {COLOURS} from "./data";
import Squiggles from "./squiggles";
import { BufferAttribute } from "three";

const vertShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`

const fragShader = `
    varying vec2 vUv;

    uniform vec2 size;
    uniform sampler2D noiseTexture;
    uniform float time;
    uniform float pixelRatio;

    uniform float lerp;
    uniform vec3 firstColor;
    uniform vec3 secondColor;

    void main() {



        vec2 aspectCorrectedUV = vUv * size;
        vec4 texCol = texture2D(noiseTexture, aspectCorrectedUV * 0.0005 * pixelRatio);

        float pixelValue = texCol.r * 0.8 + 0.1;

        float pixel = smoothstep(pixelValue - 0.05, pixelValue + 0.05, lerp);
        vec3 interpedColor = mix(firstColor, secondColor, pixel);

        gl_FragColor = vec4(interpedColor, pixel);
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // gl_FragColor = vec4(vec3(pixel), 0.0);
    }
`

enum TransitionState {
    Ready,
    TransitionForward,
    TransitionBack,
}

export default class Graphics {

    private squiggles: Squiggles = new Squiggles();

    // squiggles
    private squiggleMesh: THREE.LineSegments;
    private squiggleGeo: THREE.BufferGeometry;
    private squiggleMaterial: THREE.LineBasicMaterial;
    private squiggleBuffer: THREE.BufferAttribute;

    private squiggleRenderer: THREE.WebGLRenderer;
    private squiggleScene: THREE.Scene;

    // squiggle timing
    private squiggleUpdateInterval: number = 1.0 / 10.0;
    private currentSquiggleTime: number = 0;

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    private material: THREE.ShaderMaterial;

    // resizing
    private lastScreenSize: THREE.Vector2;
    private currentRendererSize: THREE.Vector2;
    private frameResized: boolean = true;

    // timing
    private clock: THREE.Clock;
    private lerpRate: number = 0.0;
    private currentLerp: number = 0.0;

    // colors
    private firstColor: THREE.Color = new THREE.Color(COLOURS.beige);
    private secondColor: THREE.Color = new THREE.Color(COLOURS.beige);

    public transitionedCallback: () => void = () => {};

    private state: TransitionState = TransitionState.Ready;

    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setClearColor( 0x000000, 0 ); // the default
        this.renderer.setClearAlpha(0.0);
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const container = document.getElementById('canvas-container');
        if (container !== null) {
            container.append(this.renderer.domElement);
            this.renderer.domElement.id = "graphics-canvas";
        }

        window.onresize = () => {
            this.frameResized = true;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 2);
        this.camera.position.z = 0;

        this.currentRendererSize = new THREE.Vector2();
        this.lastScreenSize = new THREE.Vector2();

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertShader,
            fragmentShader: fragShader,
            uniforms: {
                noiseTexture: {value: undefined},
                size: {value: new THREE.Vector2()},
                time: {value: 0.0},
                firstColor: {value: this.firstColor},
                secondColor: {value: this.secondColor},
                pixelRatio: {value: 1.0 / devicePixelRatio},
                lerp: {value: 0.0}
            },
            transparent: true
        });
        
        // squiggles
        this.squiggles.update();

        this.squiggleGeo = new THREE.BufferGeometry();
        const defaultArray = new Float32Array(this.squiggles.maxVertices * 3);
        this.squiggleBuffer = new THREE.BufferAttribute(defaultArray, 3);
        this.squiggleGeo.setAttribute('position', this.squiggleBuffer);
        this.squiggleMaterial = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true});
        this.squiggleMesh = new THREE.LineSegments(this.squiggleGeo, this.squiggleMaterial);

        this.squiggleScene = new THREE.Scene();
        this.squiggleScene.add(this.squiggleMesh);

        this.squiggleRenderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.squiggleRenderer.setClearColor(0x000000, 0);

        // UNCOMMENT THESE LINES TO ADD THE SQUIGGLES

        const bgcontainer = document.getElementById('canvas-container-background');
        if (bgcontainer !== null) {
            bgcontainer.append(this.squiggleRenderer.domElement);
            this.squiggleRenderer.domElement.id = "graphics-canvas";
        }

        this.clock = new THREE.Clock();

        this.checkResize();
    }

    public onInitResources(resourceManager: ResourceManager): void {
        const image = resourceManager.getResourceByPath(HTMLImageElement, "assets/noise-tex.png");

        const tex = new THREE.Texture(image);
        tex.format = THREE.RedFormat;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.needsUpdate = true;

        this.material.uniforms.noiseTexture.value = tex;

        const geo = new THREE.PlaneBufferGeometry(2.0, 2.0, 1.0, 1.0);
        const mesh = new THREE.Mesh(geo, this.material);
        
        this.scene.add(mesh);

        this.clock.start();
        this.render();
    }

    public switchColorForward(newColour: THREE.Color, time: number) {
        if (this.state !== TransitionState.Ready) {
            return;
        }
        
        this.state = TransitionState.TransitionForward;

        this.firstColor.copy(this.secondColor);
        this.secondColor.copy(newColour);

        this.lerpRate = 1.0 / time;
        this.currentLerp = 0.0;
    }

    public switchColorBackward() {
        this.currentLerp = 0.0;
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
        this.renderer.setSize(width, height);
        this.renderer.getDrawingBufferSize(this.currentRendererSize);

        this.squiggleRenderer.setSize(width, height);
        // this.squiggleRenderer.getDrawingBufferSize(this.currentRendererSize);

        this.material.uniforms.size.value.copy(this.currentRendererSize);

        const aspect = width / height;
        this.camera.left = -aspect;
        this.camera.right = aspect;
        this.camera.updateProjectionMatrix();
    }

    private render(): void {
        requestAnimationFrame(this.render.bind(this));

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.checkResize();

        this.currentSquiggleTime += Math.min(dt, 1.0 / 30.0);
        if (this.currentSquiggleTime > this.squiggleUpdateInterval) {
            this.currentSquiggleTime -= this.squiggleUpdateInterval;

            this.squiggles.update();

            const verts = this.squiggles.vertices;
            if (this.squiggleGeo.attributes.position instanceof BufferAttribute) {
                for(let i = 0; i < verts.length; i++) {
                    this.squiggleGeo.attributes.position.copyArray(verts);
                    this.squiggleGeo.attributes.position.needsUpdate = true;
                }
            }
    
            this.squiggleGeo.setDrawRange(0, this.squiggles.size);
        }

        if (this.state === TransitionState.TransitionForward) {

            this.currentLerp += this.lerpRate * dt;

            if (this.currentLerp > 1.0) {

                this.state = TransitionState.Ready;
                this.currentLerp = 1.0;

                if (this.transitionedCallback !== undefined) {
                    this.transitionedCallback();
                }
            }
        }        

        this.material.uniforms.time.value = time;
        this.material.uniforms.lerp.value = this.currentLerp;

        this.renderer.render(this.scene, this.camera);
        this.squiggleRenderer.render(this.squiggleScene, this.camera);
    }
}
