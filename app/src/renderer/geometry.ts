import {Config} from '../config';
import {AppState} from '../appState';

export namespace Geometry {
    let gl: WebGL2RenderingContext;
    export function InitializeModule(webGLRenderingState: WebGL2RenderingContext) {
        gl = webGLRenderingState;
    }

    export class BufferGeometry {
        attrubuteNames: string[];
        attributes: BufferAttribute[];
        verticesAttribIndex: number;
        vertexCount: number;

        constructor() {
            this.attrubuteNames = new Array();
            this.attributes = new Array();
            this.verticesAttribIndex = -1;
        }

        SetAttribute(attribName: string, attribData: BufferAttribute): number {
            let index : number = this.attrubuteNames.indexOf(attribName);
            
            if (index >= 0) {
                let attrib = this.attributes[index];
                attrib.Bind();
                attrib.SendData(attribData.data);
            } else {
                this.attrubuteNames.push(attribName);
                index = this.attributes.push(attribData);

                if (attribName == 'a_VertexPos') {
                    this.verticesAttribIndex = index;
                    this.vertexCount = attribData.data.length / 3;
                }
            
                attribData.Bind();
                attribData.SendData(attribData.data);
            }

            return index;
        }

        SetVertices(vertices: Float32Array) {
            this.SetAttribute('a_VertexPos', new BufferAttribute(vertices, vertices.length / 3));
        }

        GetVertices(): Float32Array {
            if (this.verticesAttribIndex >= 0) {
                return this.attributes[this.verticesAttribIndex].data;
            }

            return new Float32Array(0);
        }
    }

    export class MaterialData {

    }

    export class BufferAttribute {
        buffer: WebGLBuffer;
        data: Float32Array;
        elementsPerVertex: number;

        constructor(data: Float32Array, count: number) {
            this.buffer = gl.createBuffer();
            this.data = data;
            this.elementsPerVertex = count;
        }

        Bind() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        }

        SendData(data: Float32Array) {
            this.data = data;
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        }
    }

    export class BufferUniform {
        uniforms: Uniform<any>[];

        constructor(uniforms?: Uniform<any>[]) {
            if (uniforms == undefined) {
                this.uniforms = new Array(0);
            } else {
                this.uniforms = uniforms;
            }
        }

        MergeBufferWith(uniforms: BufferUniform) {
            
        }

        CacheLocations(program: WebGLProgram) {
            gl.useProgram(program);
            this.uniforms.forEach(uniform => {
                uniform.SetLocation(program);
                uniform.Send();
            });
        }
    }

    export enum UniformType {
        Int   = 0,
        Float = 1,
        Vector2,
        Vector3,
        Vector4,
        Matrix3,
        Matrix4,
        Texture
    }

    export class Uniform<T> {
        name: string;
        value: T;
        type: UniformType;
        private location: WebGLUniformLocation;
        SendAction: () => void;

        constructor(name: string, type: UniformType, initialValue: T) {
            this.name = name;
            this.type = type;
            this.value = initialValue;
            this.SendAction = this.GetSendAction();
        }

        Set(newValue: T) {
            this.value = newValue;
            this.Send();
        }

        SetLocation(program: WebGLProgram) {
            this.location = gl.getUniformLocation(program, this.name);
            if (this.location < 0) {
                alert("error");
                console.log("ERROR: uniform '" + this.name + "' location couldn't be found");
            }
        }

        Send() {
            this.SendAction();
        }

        GetSendAction(): (() => void) {
            let action: () => void;
            switch (this.type) {
                case UniformType.Matrix4: {
                    action = () => {
                        gl.uniformMatrix4fv(this.location, false, (this.value as unknown) as Float32Array)
                    }
                } break;
        
                case UniformType.Matrix3: {
                    action = () => {
                        gl.uniformMatrix3fv(this.location, false, (this.value as unknown) as Float32Array)
                    }
                } break;
        
                case UniformType.Vector4: {
                    action = () => {
                        gl.uniform4fv(this.location, (this.value as unknown) as Float32Array)
                    }
                } break;
        
                case UniformType.Vector3: {
                    action = () => {
                        gl.uniform3fv(this.location, (this.value as unknown) as Float32Array)
                    }
                } break;
        
                case UniformType.Vector2: {
                    action = () => {

                        gl.uniform2fv(this.location, (this.value as unknown) as Float32Array)
                    }
                } break;
        
                case UniformType.Float: {
                    action = () => {
                        gl.uniform1f(this.location, (this.value as unknown) as number)
                    }
                } break;
                
                case UniformType.Int: {
                    action = () => {
                        gl.uniform1i(this.location, (this.value as unknown) as number)
                    }
                } break;
        
                default: {
                    console.log("UNKNOWN UNIFORM TYPE!")
                    action = () => { console.log("UNKNOWN UNIFORM TYPE!") }
                }
            }

            return action;
        }
    }

    export class SimpleShader {
        vertex: WebGLShader
        fragment: WebGLShader
    }

    export class Material {
        program: WebGLProgram;
        uniforms: BufferUniform;

        constructor(uniforms: BufferUniform, vertexShaderName: string, fragmentShaderName: string) {
            let compiledShader = Material.InitShaders(vertexShaderName, fragmentShaderName)
            this.program = Geometry.Material.CreateProgram(compiledShader.vertex, compiledShader.fragment)
            this.uniforms = uniforms;
            this.uniforms.CacheLocations(this.program);
        }

        SetActive() {
            gl.useProgram(this.program);
        }

        SetUniform(name: string, value: any) {
            let found: boolean = false;
            this.uniforms.uniforms.some((uniform) => {
                if (uniform.name == name) {
                    uniform.Set(value);
                    found = true;
                    return true;
                }

                return false;
            })

            if (!found) {
                console.log("ERROR: uniform '" + name + "' couldn't be found in this material")
            }
        }

        static BuildShader(shaderSource: string, typeOfShader: number): WebGLShader {
            let shader = gl.createShader(typeOfShader)

            gl.shaderSource(shader, shaderSource)
            gl.compileShader(shader)

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader)) // TODO Logger
                return null
            }

            return shader
        }
        
        static InitShaders(vertexShaderName: string, fragmentShaderName: string): any {
            let vertexShaderSource, fragmentShaderSource
            vertexShaderSource = (document.getElementById(vertexShaderName) as HTMLScriptElement).text
            fragmentShaderSource = (document.getElementById(fragmentShaderName) as HTMLScriptElement).text
        
            let shaders = new SimpleShader()
            shaders.vertex = Material.BuildShader(vertexShaderSource, gl.VERTEX_SHADER)
            shaders.fragment = Material.BuildShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
        
            return shaders
        }
        
        static CreateProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
                let program = gl.createProgram()

                gl.attachShader(program, vertexShader)
                gl.attachShader(program, fragmentShader)
                gl.linkProgram(program)

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    // TODO LOGGER
                    console.log("LINKING ERROR!")
                    console.log(gl.getProgramInfoLog(program))
                    gl.deleteProgram(program)

                    return null
                }

                if (Config.DebugMode) {
                    gl.validateProgram(program)

                    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                        // TODO LOGGER
                        console.log("VALIDATION ERROR!")
                        gl.deleteProgram(program)
                        return null
                    }
                }

                return program
            }
    }

    export class MeshBasicMaterial extends Material {
        constructor(uniforms: BufferUniform) {
            // uniforms.MergeBufferWith();
            super(uniforms, "simple-vertex", "simple-fragment");
        }
    }

    export class MeshColorMaterial extends Material {
        constructor(uniforms: BufferUniform) {
            // uniforms.MergeBufferWith();
            super(uniforms, "vertex-color", "fragment-color");
        }
    }

    export class FbmMaterial extends Material {
        constructor(uniforms: BufferUniform) {
            // uniforms.MergeBufferWith();
            super(uniforms, "vertex-color", "fragment-fbm");
        }
    }

    export class Mesh {
        geometry: BufferGeometry;
        material: Material;
        attribLocations: number[];

        constructor(geometry: BufferGeometry, material: Material) {
            this.geometry = geometry;
            this.material = material;
            this.attribLocations = new Array(geometry.attributes.length);
            this.material.SetActive();
            for (let i = 0; i < this.geometry.attrubuteNames.length; i++) {
                const attribName = this.geometry.attrubuteNames[i];
                let location: number = gl.getAttribLocation(material.program, attribName);

                if (location < 0) {
                    console.log("ERROR: '" + attribName + "' attrib location couldn't be found!")
                } else {
                    this.attribLocations[i] = location;
                }
            }
        }

        BindAttributes() {
            this.material.SetActive();
            for (let i = 0; i < this.geometry.attributes.length; i++) {
                const attrib = this.geometry.attributes[i];
                const attribLocation = this.attribLocations[i];

                gl.enableVertexAttribArray(attribLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, attrib.buffer);
                
                gl.vertexAttribPointer(
                    attribLocation,          // location
                    attrib.elementsPerVertex, // size (elements per vertex)
                    gl.FLOAT,                         // type
                    false,                            // normalize
                    0,                                // stride, number of elements per vertex
                    0                                 // offset
                )

                // gl.disableVertexAttribArray(attribLocation); // disable after render?
            }
        }

        Draw() {
            gl.drawArrays(gl.TRIANGLES, 0, this.geometry.vertexCount);
        }
    }

    export class Color {
        r: number;
        g: number;
        b: number;

        constructor(r: number, g: number, b: number) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    export function GetTestMesh(): Mesh {
        let geometry = new BufferGeometry();
        let vertices = new Float32Array([
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
        
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0, -1.0,  1.0
        ]);

        geometry.SetVertices(vertices);
        // geometry.SetAttribute('a_VertexPos', new BufferAttribute(vertices, 3));
        let material = new MeshBasicMaterial(new BufferUniform());
        let mesh = new Mesh( geometry, material );

        return mesh;
    }
}