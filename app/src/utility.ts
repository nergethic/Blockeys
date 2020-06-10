import * as glm from 'gl-matrix';

export function MakeVec3(x: number, y: number, z: number) {
    let v = glm.vec3.create();
    glm.vec3.set(v, x, y, z);
    return v;
}
  
export function MakeVec2(x: number, y: number) {
    let v = glm.vec2.create();
    glm.vec2.set(v, x, y);
    return v;
}