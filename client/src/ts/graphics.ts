import ResourceManager, { GLTFAsset } from "./resource-manager";
import * as THREE from 'three';
import {COLOURS} from "./data";
import Squiggles from "./squiggles";
import { BufferAttribute, Scene } from "three";

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

const waterVertShader = `

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`

const waterFragShader = `

    #define WATER_COL vec3(0.0, 0.4453, 0.7305)
    #define WATER2_COL vec3(0.0, 0.4180, 0.6758)
    #define FOAM_COL vec3(0.8125, 0.9609, 0.9648)
    #define FOG_COL vec3(0.6406, 0.9453, 0.9336)
    #define SKY_COL vec3(0.0, 0.8203, 1.0)


    varying vec2 vUv;

    uniform float time;
    uniform vec2 size;

    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
     }
     vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
     }
     vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
     }
     vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
     }
     float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;
  
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
  
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  
        i = mod289(i);
        vec4 p = permute( permute( permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
  
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
  
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
  
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
  
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
  
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
  
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
     }

    vec2 hash2( vec2 p )
    {

        // procedural white noise	
        return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
    }

    vec3 voronoi( in vec2 x )
    {
        vec2 n = floor(x);
        vec2 f = fract(x);

        //----------------------------------
        // first pass: regular voronoi
        //----------------------------------
        vec2 mg, mr;

        float noise = snoise(vec3(x * 2.0, time)) * 0.5;

        float md = 8.0;
        for( int j=-1; j<=1; j++ )
        for( int i=-1; i<=1; i++ )
        {
            vec2 g = vec2(float(i),float(j));
            vec2 o = hash2( n + g );
            o = 0.5 + 0.5*sin(6.2831 * o + noise + time);
            vec2 r = g + o - f;
            float d = dot(r,r);

            if( d<md )
            {
                md = d;
                mr = r;
                mg = g;
            }
        }

        //----------------------------------
        // second pass: distance to borders
        //----------------------------------
        md = 8.0;
        for( int j=-2; j<=2; j++ )
        for( int i=-2; i<=2; i++ )
        {
            vec2 g = mg + vec2(float(i),float(j));
            vec2 o = hash2( n + g );
            o = 0.5 + 0.5*sin(6.2831 * o + noise + time);
            vec2 r = g + o - f;

            if( dot(mr-r,mr-r)>0.00001 )
            md = min( md, dot( 0.5*(mr+r), normalize(r-mr) ) );
        }

        return vec3( md, mr );
    }



    void main() {
        vec2 samplePoint = vUv * size * 0.01;
        vec3 c = voronoi( samplePoint + vec2(0.0, time) );
        float border = smoothstep( 0.03, 0.04, c.x);
        vec3 color = mix(FOAM_COL, WATER_COL, border);
        gl_FragColor = vec4(color, 1.0);
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

    // water

    private waterMesh: THREE.Mesh;
    private waterMaterial: THREE.ShaderMaterial;
    private waterScene: Scene;

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

        window.addEventListener('resize', () => {
            this.frameResized = true;
        });

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

        // water

        const waterGeo = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
        this.waterMaterial = new THREE.ShaderMaterial({
            vertexShader: waterVertShader,
            fragmentShader: waterFragShader,
            side: THREE.DoubleSide,
            uniforms: {
                time: {value: 0.0},
                size: {value: new THREE.Vector2(1.0, 1.0)}
            }
        });

        this.waterMesh = new THREE.Mesh(waterGeo, this.waterMaterial);
        this.waterScene = new THREE.Scene();
        this.waterScene.add(this.waterMesh);
        
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
        this.squiggleRenderer.setClearColor(0x000000, 1);

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

        const gltf = resourceManager.getResourceByPath(GLTFAsset, "assets/water_plane.gltf");
        gltf?.resource.scene.traverse((o => {
            if (o instanceof THREE.Mesh) {
                this.waterMesh.geometry = o.geometry;
            }
        }))
        
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
        this.waterMaterial.uniforms.size.value.copy(this.currentRendererSize);

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
        this.waterMaterial.uniforms.time.value = time;
        this.material.uniforms.lerp.value = this.currentLerp;

        this.renderer.render(this.scene, this.camera);
        this.squiggleRenderer.render(this.waterScene, this.camera);
    }
}
