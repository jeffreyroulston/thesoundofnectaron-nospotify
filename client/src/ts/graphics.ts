import ResourceManager from "./resource-manager";
import * as THREE from 'three';

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

    void main() {
        float aspect = size.x / size.y;
        vec2 aspectCorrectedUV = vUv * vec2(aspect, 1.0);
        vec4 texCol = texture2D(noiseTexture, aspectCorrectedUV * 4.0);
        gl_FragColor = vec4(texCol.xyz, 1.0);
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`

export default class Graphics {

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

    constructor() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.append(this.renderer.domElement);
        this.renderer.domElement.id = "graphics-canvas";
        window.onresize = () => {
            this.frameResized = true;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0, 2);

        this.currentRendererSize = new THREE.Vector2();
        this.lastScreenSize = new THREE.Vector2();

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertShader,
            fragmentShader: fragShader,
            uniforms: {
                noiseTexture: {value: undefined},
                size: {value: new THREE.Vector2()},
                time: {value: 0.0}
            }
        });

        this.clock = new THREE.Clock();

        this.checkResize();
    }

    public onInitResources(resourceManager: ResourceManager): void {
        const image = resourceManager.getResourceByPath(HTMLImageElement, "assets/noise-tex.png");

        const tex = new THREE.Texture(image);
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

        this.material.uniforms.size.value = this.currentRendererSize;
    }

    private render(): void {
        requestAnimationFrame(this.render.bind(this));

        this.checkResize();

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.renderer.render(this.scene, this.camera);
    }
}
