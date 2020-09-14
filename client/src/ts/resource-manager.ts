import * as THREE from "three";
import * as gltfloader from './GLTFLoader';

console.debug(gltfloader, THREE.GLTFLoader);

export class GLTFAsset {
    public resource: THREE.GLTF;

    constructor(resource: THREE.GLTF) {
        this.resource = resource;
    }
}
export type LoadableResource = HTMLImageElement | GLTFAsset;

export default class ResourceManager {

    private resourceStore: Map<string, LoadableResource> = new Map();
    private gltfLoader: THREE.GLTFLoader = new THREE.GLTFLoader();

    constructor() {}

    public getResourcesOfType<T extends LoadableResource>( t: new ( ...args: any[] ) => T ): T[] {
        return [];
    }

    public getResourceByPath<T extends LoadableResource>( t: new ( ...args: any[] ) => T, path: string ): T | undefined {
        const resource = this.resourceStore.get( path );

        if ( resource instanceof t ) {
            return resource;
        }

        return undefined;
    }
    
    public loadResourceByPath<T extends LoadableResource>( t: new ( ...args: any[] ) => T, path: string, alias?: string ): Promise<any> {

        if (t === HTMLImageElement) {
            // return promise to be resolved when image loads
            return new Promise((resolve, reject) => {

                const image = new Image();
    
                // resolve if loaded and store by path or alias
                image.onload = (_) => {
                    this.resourceStore.set(alias ?? path, image);
                    resolve();
                }
    
                // reject if error
                image.onerror = (e) => {
                    reject(e);
                }

                image.src = path;
            });
        }

        if (t === GLTFAsset)
        {
            return new Promise((resolve, reject) => {
                this.gltfLoader.load(path, (gltf) => {
                    const a = new t(gltf);
                    this.resourceStore.set(alias ?? path, a);
                    resolve(a);
                },
                () => {},
                (err) => {
                    reject(err);
                });
            });
        }

        // we don't have a loader for the resource
        return new Promise( ( _, reject ) => {
            reject();
        } );
    }
}
