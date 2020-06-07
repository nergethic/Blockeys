import * as glm from 'gl-matrix';
import {Geometry} from './renderer/geometry';

export namespace AppState {
    export let gl: WebGL2RenderingContext;

    export let cameraPositionUniform: Geometry.Uniform<glm.vec3>
    export let lightPositionUniform: Geometry.Uniform<glm.vec3>;
    export let viewUniform: Geometry.Uniform<glm.mat4>;
    export let projectionUniform: Geometry.Uniform<glm.mat4>;
    export let resolutionUniform: Geometry.Uniform<glm.vec2>;
    export let timeUniform: Geometry.Uniform<number>;

    export let cameraPosition: glm.vec3;
    export let lightPosition: glm.vec3;
    export let viewMatrix: glm.mat4;
    export let projectionMatrix: glm.mat4;
    export let resolution: glm.vec2;
    export let time: number;
}