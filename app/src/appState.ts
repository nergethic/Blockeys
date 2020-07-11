import * as glm from 'gl-matrix';
import {Geometry} from './renderer/geometry';

export namespace AppState {
    export let gl: WebGL2RenderingContext;
    export let cameraPosition: glm.vec3;
    export let lightPosition: glm.vec3;
    export let viewMatrix: glm.mat4;
    export let projectionMatrix: glm.mat4;
    export let resolution: glm.vec2;
    export let time: number;
}