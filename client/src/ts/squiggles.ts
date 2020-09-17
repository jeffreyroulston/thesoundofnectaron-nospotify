import { Vector3 } from "three";
import SimplexNoise from "simplex-noise";

const noise = new SimplexNoise();

export default class Squiggles {

    private squiggles: Set<SquiqqleBase> = new Set();

    private maxVerts: number = 1000;
    private currentVerts: number = 0;
    private internalVertices: Float32Array = new Float32Array(this.maxVerts * 3);

    private maxSquiggles: number = 10;
    private noiseAmplitude: number = 0.005;

    constructor() {

    }   

    public get vertices(): Float32Array {
        return this.internalVertices;
    }
    
    public get maxVertices(): number {
        return this.maxVerts;
    }

    public get size(): number {
        return this.currentVerts;
    }

    public update() { 
        
        if (this.squiggles.size < this.maxSquiggles) {            

            let selection = Math.floor(Math.random() * 3.0);

            const position = new Vector3(
                Math.random() * 5.0 - 2.5,
                Math.random() * 5.0 - 2.5,
                Math.random() * 5.0 - 2.5
            );

            let squiggle = undefined;

            if (selection == 0) {
                squiggle = new RandomSquiggle(Math.ceil(Math.random() * 20 + 10), position);
            }

            if (selection == 1) {
                squiggle = new CircleSquiggle(Math.ceil(Math.random() * 20 + 10), position);
            }

            if (selection == 2) {
                squiggle = new TriangleSquiggle(Math.ceil(Math.random() * 20 + 10), position);
            }

            if (squiggle !== undefined) {
                this.squiggles.add(squiggle);
            }
        }

        let currentVertex: number = 0;
    
        const now = Date.now();

        // iterate squiggles
        this.squiggles.forEach((squiggle) => {

            // make sure squiggle is up to date
            squiggle.update();

            const squigglePoints = squiggle.getVertices();
            
            for (let i = 0; i < squigglePoints.length - 1; i++) {

                // bounds checking
                if (currentVertex > this.maxVerts * 3) {
                    continue;
                }

                const firstPoint = squigglePoints[i];
                const secondPoint = squigglePoints[i + 1];


                if (i == 0) {
                    this.internalVertices[currentVertex + 0] = firstPoint.x + noise.noise2D(firstPoint.x + now * 0.33, firstPoint.y + now * 0.62) * this.noiseAmplitude;
                    this.internalVertices[currentVertex + 1] = firstPoint.y + noise.noise2D(firstPoint.x + now * 0.15, firstPoint.y + now * 0.94) * this.noiseAmplitude;
                    this.internalVertices[currentVertex + 2] = 0.0;
    
                    this.internalVertices[currentVertex + 3] = secondPoint.x + noise.noise2D(firstPoint.x + now * 0.82, firstPoint.y + now * 0.43) * this.noiseAmplitude;
                    this.internalVertices[currentVertex + 4] = secondPoint.y + noise.noise2D(firstPoint.x + now * 0.76, firstPoint.y + now * 0.98) * this.noiseAmplitude;
                    this.internalVertices[currentVertex + 5] = 0.0;
                }


                else {
                    this.internalVertices[currentVertex + 0] = this.internalVertices[currentVertex - 3]
                    this.internalVertices[currentVertex + 1] = this.internalVertices[currentVertex - 2]
                    this.internalVertices[currentVertex + 2] = 0.0;
    
                    this.internalVertices[currentVertex + 3] = secondPoint.x + noise.noise2D(firstPoint.x + now * 0.35, firstPoint.y + now * 0.5) * this.noiseAmplitude;
                    this.internalVertices[currentVertex + 4] = secondPoint.y + noise.noise2D(firstPoint.x + now * 0.72, firstPoint.y + now * 0.41) * this.noiseAmplitude;
                    this.internalVertices[currentVertex + 5] = 0.0;
                }

                currentVertex += 6;
            }
        });

        this.currentVerts = currentVertex / 3.0;

        // check if squiggles are finished and mark for removal
        const removals: SquiqqleBase[] = [];
        this.squiggles.forEach((squiggle) => {
            if (squiggle.complete) {
                removals.push(squiggle);
            }
        });

        // remove completed squiggles
        removals.forEach((squiggle) => {
            this.squiggles.delete(squiggle);
        });
    }
}

class SquiqqleBase {

    protected squiggleVertices: THREE.Vector3[] = [];
    protected segments: number;
    protected position: Vector3;

    constructor(segments: number, position: Vector3) {
        this.segments = segments;
        this.position = position;
    }

    public get complete(): boolean {
        return this.segments < this.squiggleVertices.length;
    }

    public getVertices(): ReadonlyArray<THREE.Vector3> {
        return this.squiggleVertices;
    }

    public update() {
        console.warn("Squiggle base subclass hasn't overridden update behaviour");
    }
}

class RandomSquiggle extends SquiqqleBase {
    constructor(segments: number, position: Vector3) {
        super(segments, position);
    }

    public update() {

        const now = Date.now() * 0.001;

        let x = noise.noise2D(this.position.x + now * 0.33, this.position.y + now * 0.71) * 0.1;
        let y = noise.noise2D(this.position.x + now * 0.28, this.position.y + now * 0.47) * 0.1;
        let z = 0.0;

        if (this.squiggleVertices.length > 0) {
            const lastVertex = this.squiggleVertices[this.squiggleVertices.length - 1];
            x += lastVertex.x;
            y += lastVertex.y;
            z += lastVertex.z;
        }

        else 
        {
            x = this.position.x;
            y = this.position.y;
            z = this.position.z;
        }

        this.squiggleVertices.push(new Vector3(x, y, z));
    }
}

class CircleSquiggle extends SquiqqleBase {

    private currentAngle: number;
    private angleIncrement: number;
    private radius: number;

    constructor(segments: number, position: Vector3) {
        super(segments, position);

        
        let direction = Math.round(Math.random()) * 2.0 - 1.0;
        this.angleIncrement = Math.PI * 2.0 / segments * direction;
        this.currentAngle = Math.random() * Math.PI * 2.0;
        this.radius = Math.random() * 0.1;
    }

    public update() {
        if (this.squiggleVertices.length == 0.0) {
            this.squiggleVertices.push(this.position);
        }

        else {
            const lastVertex = this.squiggleVertices[this.squiggleVertices.length - 1];

            this.currentAngle += this.angleIncrement;
            let x = lastVertex.x + Math.sin(this.currentAngle) * this.radius;
            let y = lastVertex.y + Math.cos(this.currentAngle) * this.radius;

            this.squiggleVertices.push(new Vector3(x, y, 0.0));
        }
    }   
}

class TriangleSquiggle extends SquiqqleBase {

    private currentAngle: number;
    private radius: number;

    constructor(segments: number, position: Vector3) {
        super(segments, position);

        let direction = Math.round(Math.random()) * 2.0 - 1.0;
        this.currentAngle = Math.random() * Math.PI * 2.0;
        this.radius = Math.random() * 0.1;
    }

    public update() {
        if (this.squiggleVertices.length == 0.0) {
            this.squiggleVertices.push(this.position);
        }

        else {

            let angle = this.currentAngle;

            if (this.squiggleVertices.length > this.segments / 3.0) {
                angle += Math.PI * 2.0 / 3.0;
            }

            if (this.squiggleVertices.length > this.segments / 3.0 * 2.0) {
                angle += Math.PI * 2.0 / 3.0;
            }

            const lastVertex = this.squiggleVertices[this.squiggleVertices.length - 1];

            let x = lastVertex.x + Math.sin(angle) * this.radius;
            let y = lastVertex.y + Math.cos(angle) * this.radius;

            this.squiggleVertices.push(new Vector3(x, y, 0.0));
        }
    }   
}
