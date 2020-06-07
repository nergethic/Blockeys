//import './main.scss';
import {Geometry} from './renderer/geometry'
import { AppState } from './appState';
import * as glm from 'gl-matrix';

export namespace Blocks {
    type SocketType = Socket<number | string | boolean>;

    class Socket<SocketType> {
        name: string;
        myBlock: BasicBlock;
        connectedSocket: Socket<SocketType>;
        data: SocketType;

        constructor(name: string, defaultData: SocketType) {
            this.name = name;
            this.data = defaultData;
        }

        IsConnected(): boolean {
            if (this.connectedSocket == null)
                return false;

            return true;
        }
    }

    class SocketGroup {
        sockets: Socket<any>[];

        constructor(sockets?: Socket<any>[]) {
            this.sockets = sockets;

            if (sockets == null) {
                this.sockets = new Array(0);
            }
        }
        
        InitializeSockets(myBlock: BasicBlock) {
            this.sockets.forEach(socket => {
                socket.myBlock = myBlock;
            });
        }
    }

    export class BasicBlock {
        inputs: SocketGroup;
        outputs: SocketGroup;

        constructor(inputs: SocketGroup, outputs: SocketGroup) {
            this.inputs = inputs;
            this.outputs = outputs;

            if (inputs == null) {
                this.inputs = new SocketGroup();
            }

            if (outputs == null) {
                this.outputs = new SocketGroup();
            }

            this.inputs.InitializeSockets(this);
            this.outputs.InitializeSockets(this);
        }

        ConnectSocket<T>(mySocket: Socket<T>, otherSocket: Socket<T>): void {
            if (mySocket.myBlock == null) {
                console.log("ERROR: mySocket wasn't initialized properly, 'myBlock' is null!")
            }
            if (otherSocket.myBlock == null) {
                console.log("ERROR: otherSocket wasn't initialized properly, 'myBlock' is null!")
            }

            mySocket.connectedSocket = otherSocket;
            otherSocket.connectedSocket = mySocket;

            this.TriggerOutputsUpdate();
        }

        Update(): void {
            this.TriggerOutputsUpdate();
        }

        UpdateInputData(): void {
            this.ValidateInputData();
            this.Update();
        }

        ValidateInputData(): boolean {
            return true; // TODO
        }

        TriggerOutputsUpdate(): void {
            this.outputs.sockets.forEach(myOutputSocket => {
                if (myOutputSocket.IsConnected()) {
                    let connectedInputSocket = myOutputSocket.connectedSocket;
                    connectedInputSocket.data = myOutputSocket.data;
                    connectedInputSocket.myBlock.UpdateInputData(); // TODO: this can fire update multiple times for 1 block
                }
            });
        }

        GetInputData<T>(index: number): T {
            if (this.inputs.sockets == null) {
                console.log("ERROR: input sockets are null and GetInputData was called!")
            } else if (index > this.inputs.sockets.length-1 || index < 0) {
                console.log("ERROR: invalid socket index in GetInputData: " + index)
            }

            let socket: Socket<T> = this.inputs.sockets[index];
            if (socket.IsConnected()) {
                return socket.connectedSocket.data;
            }

            return socket.data;
        }

        GetOutputData<T>(index: number): T {
            if (this.outputs.sockets == null) {
                console.log("ERROR: output sockets are null and GetOutputData was called!")
            } else if (index > this.outputs.sockets.length-1 || index < 0) {
                console.log("ERROR: invalid socket index in GetOutputData: " + index)
            }

            return this.outputs.sockets[index].data;
        }

        SetInputData<T>(index: number, value: T): void  {
            if (this.inputs.sockets == null) {
                console.log("ERROR: input sockets are null and SetInputData was called!")
            } else if (index > this.inputs.sockets.length-1 || index < 0) {
                console.log("ERROR: invalid socket index in SetInputData: " + index)
            }
            
            this.inputs.sockets[index].data = value;
        }

        SetOutputData<T>(index: number, value: T): void  {
            if (this.outputs.sockets == null) {
                console.log("ERROR: output sockets are null and SetOutputData was called!")
            } else if (index > this.outputs.sockets.length-1 || index < 0) {
                console.log("ERROR: invalid socket index in SetOutputData: " + index)
            }

            let socket: Socket<T> = this.outputs.sockets[index];
            socket.data = value;
        }
    }

    export class MathAdditionBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<number>("number1", 0.0),
                new Socket<number>("number2", 0.0)
            ]);
            let outputs = new SocketGroup([
                new Socket<string>("result", "d")
            ]);
            super(inputs, outputs);
        }

        Update() {
            let result = this.GetInputData<number>(0) + this.GetInputData<number>(1);
            this.SetOutputData<number>(0, result);

            super.Update();
        }
    }

    export class GenerateMeshBlock extends BasicBlock {
        mesh: Geometry.Mesh;
        vertices: Float32Array;
        indices: Uint16Array;
        normals: Float32Array;
        colors: Float32Array;
        modelMatrix: glm.mat4;
        tint: Float32Array;

        constructor() {
            let inputs  = new SocketGroup([
                new Socket<boolean>("trigger", false)
            ]);
            let outputs = new SocketGroup([
                new Socket<Geometry.Mesh>("result", null)
            ]);
            super(inputs, outputs);

            this.vertices = new Float32Array([
                // Front face
              -1.0, -1.0,  1.0,
              1.0, -1.0,  1.0,
              1.0,  1.0,  1.0,
             -1.0,  1.0,  1.0,
             
             // Back face
             -1.0, -1.0, -1.0,
             -1.0,  1.0, -1.0,
              1.0,  1.0, -1.0,
              1.0, -1.0, -1.0,
             
             // Top face
             -1.0,  1.0, -1.0,
             -1.0,  1.0,  1.0,
              1.0,  1.0,  1.0,
              1.0,  1.0, -1.0,
             
             // Bottom face
             -1.0, -1.0, -1.0,
              1.0, -1.0, -1.0,
              1.0, -1.0,  1.0,
             -1.0, -1.0,  1.0,
             
             // Right face
              1.0, -1.0, -1.0,
              1.0,  1.0, -1.0,
              1.0,  1.0,  1.0,
              1.0, -1.0,  1.0,
             
             // Left face
             -1.0, -1.0, -1.0,
             -1.0, -1.0,  1.0,
             -1.0,  1.0,  1.0,
             -1.0,  1.0, -1.0]);

             this.indices = new Uint16Array([
                0,  1,  2,      0,  2,  3,    // front
                4,  5,  6,      4,  6,  7,    // back
                8,  9,  10,     8,  10, 11,   // top
                12, 13, 14,     12, 14, 15,   // bottom
                16, 17, 18,     16, 18, 19,   // right
                20, 21, 22,     20, 22, 23   // left
              ]);

              this.normals = new Float32Array([
                // Front
                0.0,  0.0,  1.0,
                0.0,  0.0,  1.0,
                0.0,  0.0,  1.0,
                0.0,  0.0,  1.0,
            
               // Back
                0.0,  0.0, -1.0,
                0.0,  0.0, -1.0,
                0.0,  0.0, -1.0,
                0.0,  0.0, -1.0,
            
               // Top
                0.0,  1.0,  0.0,
                0.0,  1.0,  0.0,
                0.0,  1.0,  0.0,
                0.0,  1.0,  0.0,
            
               // Bottom
                0.0, -1.0,  0.0,
                0.0, -1.0,  0.0,
                0.0, -1.0,  0.0,
                0.0, -1.0,  0.0,
            
               // Right
                1.0,  0.0,  0.0,
                1.0,  0.0,  0.0,
                1.0,  0.0,  0.0,
                1.0,  0.0,  0.0,
            
               // Left
               -1.0,  0.0,  0.0,
               -1.0,  0.0,  0.0,
               -1.0,  0.0,  0.0,
               -1.0,  0.0,  0.0
              ]);

              this.colors = new Float32Array([
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                1.0, 0.0, 0.0, 1.0]);

                let geometry = new Geometry.BufferGeometry();
                geometry.SetVertices(this.vertices);
                geometry.SetIndices(this.indices);

                let normalAttribBuffer = new Geometry.BufferAttribute(this.normals, 3);
                let colorAttribBuffer = new Geometry.BufferAttribute(this.colors, 4);

                geometry.SetAttribute('a_Color', colorAttribBuffer);
                geometry.SetAttribute('a_Normal', normalAttribBuffer);

                // material
                this.modelMatrix = glm.mat4.create();
                let modelUniform = new Geometry.Uniform<glm.mat4>("iModel", Geometry.UniformType.Matrix4, this.modelMatrix);

                this.tint = new Float32Array([0.2, 0.5, 0.0]);
                let tintColorUniform = new Geometry.Uniform<Float32Array>("iTintColor", Geometry.UniformType.Vector3, this.tint);

                let material = new Geometry.Material("vertex-normal", "fragment-normal", new Geometry.BufferUniform([
                    modelUniform, tintColorUniform, AppState.viewUniform, AppState.projectionUniform,
                    AppState.timeUniform, AppState.resolutionUniform,
                    AppState.lightPositionUniform, AppState.cameraPositionUniform]));

                this.mesh = new Geometry.Mesh(geometry, material);
        }

        Update() {
            let trigger = this.GetInputData<boolean>(0);
            if (trigger) {
                this.SetInputData<boolean>(0, false);

                // this.geometry = new Geometry.BufferGeometry();
            }

            super.Update();
        }
    }

    export class RenderingBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<Geometry.Mesh>("mesh1", null),
                new Socket<Geometry.Mesh>("mesh2", null),
                new Socket<Geometry.Mesh>("mesh3", null)
            ]);
            let outputs = new SocketGroup();
            super(inputs, outputs);
        }

        Update() {
            for (let i = 0; i < this.inputs.sockets.length; i++) {
                const socket = this.inputs.sockets[i];
                if (socket.IsConnected()) {
                    const block = socket.connectedSocket.myBlock as GenerateMeshBlock;
                    const mesh = this.GetInputData<Geometry.Mesh>(i);
                    mesh.material.SetUniform("iModel", block.modelMatrix)
                    mesh.material.SetUniform("iTintColor", block.tint)

                    mesh.material.SetUniform("iLightPosition", AppState.lightPosition)
                    mesh.material.SetUniform("iViewPosition", AppState.cameraPosition)
                    mesh.material.SetUniform("iView", AppState.viewMatrix)
                    mesh.material.SetUniform("iProjection", AppState.projectionMatrix)
                    mesh.material.SetUniform("iTime", AppState.time)
                    mesh.material.SetUniform("iResolution", AppState.resolution)
    
                    mesh.BindAttributes();
                    mesh.DrawIndexed();
                }
            }

            super.Update();
        }
    }

    export function BlockTest() {
        let block1 = new MathAdditionBlock();

        let block2Inputs = new SocketGroup([new Socket<number>("display", 0.0)])
        let block2 = new BasicBlock(block2Inputs, null);

        block1.ConnectSocket<number>(block1.outputs.sockets[0], block2.inputs.sockets[0]);

        block1.SetInputData<number>(0, 1.0);
        block1.SetInputData<number>(1, 2.5);

        block1.Update();

        console.log(block2.GetInputData<number>(0));
    }

    class Const<T> {
        value: T
    
        Set(newValue: T) {
            this.value = newValue;
            //if (this.value.type == 'd') {
    
            //} 
        }
    }
}