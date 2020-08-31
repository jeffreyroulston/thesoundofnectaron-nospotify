import { Vector3 } from "three";
import { timeHours } from "d3";

export default class Squiggles {

    private squiggles: Set<SquiqqleBase> = new Set();

    private maxVerts: number = 1000;
    private currentVerts: number = 0;
    private internalVertices: Float32Array = new Float32Array(this.maxVerts * 3);

    private maxSquiggles: number = 10;
    
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

            const position = new Vector3(
                Math.random() * 5.0 - 2.5,
                Math.random() * 5.0 - 2.5,
                Math.random() * 5.0 - 2.5
            );

            const squiggle = new RandomSquiggle(Math.ceil(Math.random() * 10 + 10), position);

            this.squiggles.add(squiggle);
        }

        let currentVertex: number = 0;
        
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

                this.internalVertices[currentVertex + 0] = firstPoint.x;
                this.internalVertices[currentVertex + 1] = firstPoint.y;
                this.internalVertices[currentVertex + 2] = 0.0;

                this.internalVertices[currentVertex + 3] = secondPoint.x;
                this.internalVertices[currentVertex + 4] = secondPoint.y;
                this.internalVertices[currentVertex + 5] = 0.0;

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

        let x = Math.random() * 0.2 - 0.1;
        let y = Math.random() * 0.2 - 0.1;
        let z = Math.random() * 0.2 - 0.1;

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
