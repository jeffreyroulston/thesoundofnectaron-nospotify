import {
	AnimationClip,
	Camera,
	Group,
	Loader,
	LoadingManager
} from 'three';


declare module 'three' {
    
    export interface GLTF {
        animations: AnimationClip[];
        scene: Group;
        scenes: Group[];
        cameras: Camera[];
        asset: {
            copyright?: string;
            generator?: string;
            version?: string;
            minVersion?: string;
            extensions?: any;
            extras?: any;
        };
        parser: GLTFParser;
        userData: any;
    }
    
    export class GLTFLoader extends Loader {
    
        constructor( manager?: LoadingManager );
    
        load( url: string, onLoad: ( gltf: GLTF ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
    
        parse( data: ArrayBuffer | string, path: string, onLoad: ( gltf: GLTF ) => void, onError?: ( event: ErrorEvent ) => void ) : void;
    
    }
    
    export class GLTFParser {
    
        json: any;
    
        getDependency: ( type: string, index: number ) => Promise<any>;
        getDependencies: ( type: string ) => Promise<any[]>;
    
    }
}
