//import './main.scss';
import {Geometry} from './renderer/geometry'
import { AppState } from './appState';
import * as glm from 'gl-matrix';
import * as Utility from './utility';

export namespace Blocks {
    type SocketType = Socket<number | string | boolean | Geometry.Mesh>;

    export enum BlockType {
        Basic,
        MathAddition,
        MathSubstraction,
        MathDivide,
        MathMultiply,
        MathSin,
        GenerateCubeMesh,
        GenerateMesh,
        MeshRendering,
        DisplayInput,
        Time,
        MathClamp
    } 

    export class Socket<SocketType> {
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
        blockType: BlockType;
        inputs: SocketGroup;
        outputs: SocketGroup;
        afterUpdateAction: () => {};
        hasAfterUpdateAction: boolean;

        constructor(type: BlockType, inputs: SocketGroup, outputs: SocketGroup) {
            this.blockType = type;
            this.inputs = inputs;
            this.outputs = outputs;
            this.hasAfterUpdateAction = false;

            if (inputs == null) {
                this.inputs = new SocketGroup();
            }

            if (outputs == null) {
                this.outputs = new SocketGroup();
            }

            this.inputs.InitializeSockets(this);
            this.outputs.InitializeSockets(this);
        }

        Update(): void {
            this.TriggerOutputsUpdate();
            if (this.hasAfterUpdateAction) {
                this.afterUpdateAction();
            }
        }

        ConnectSocket<T>(myOutputSocket: Socket<T>, otherInputSocket: Socket<T>): void {
            if (myOutputSocket.myBlock == null) {
                console.log("ERROR: mySocket wasn't initialized properly, 'myBlock' is null!")
            }
            if (otherInputSocket.myBlock == null) {
                console.log("ERROR: otherSocket wasn't initialized properly, 'myBlock' is null!")
            }
            //if (!this.outputs.sockets.includes(myOutputSocket)) {
                //console.log("ERROR: myOutputSocket error")
            //}

            myOutputSocket.connectedSocket = otherInputSocket;
            otherInputSocket.connectedSocket = myOutputSocket;

            this.TriggerOutputsUpdate();
        }

        DisconnectSocket<T>(mySocket: Socket<T>): void {
            if (!mySocket.IsConnected) {
                return;
            }
            if (mySocket.myBlock == null) {
                console.log("ERROR: mySocket wasn't initialized properly, 'myBlock' is null!")
                return;
            }
            if (mySocket.connectedSocket == null) {
                console.log("ERROR: otherSocket wasn't initialized properly, 'myBlock' is null!")
                return;
            }

            mySocket.connectedSocket.connectedSocket = null;
            mySocket.connectedSocket = null;
        }

        SetAfterUpdateAction(action: () => {}) {
            this.hasAfterUpdateAction = true;
            this.afterUpdateAction = action;
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
                new Socket<number>("result", 0.0)
            ]);
            super(BlockType.MathAddition, inputs, outputs);
        }

        Update() {
            let result = this.GetInputData<number>(0) + this.GetInputData<number>(1);
            this.SetOutputData<number>(0, result);

            super.Update();
        }
    }

    export class MathSubstractionBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<number>("number1", 0.0),
                new Socket<number>("number2", 0.0)
            ]);
            let outputs = new SocketGroup([
                new Socket<number>("result", 0.0)
            ]);
            super(BlockType.MathSubstraction, inputs, outputs);
        }

        Update() {
            let result = this.GetInputData<number>(0) - this.GetInputData<number>(1);
            this.SetOutputData<number>(0, result);

            super.Update();
        }
    }

    export class MathMultiplyBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<number>("number1", 0.0),
                new Socket<number>("number2", 0.0)
            ]);
            let outputs = new SocketGroup([
                new Socket<number>("result", 0.0)
            ]);
            super(BlockType.MathMultiply, inputs, outputs);
        }

        Update() {
            let result = this.GetInputData<number>(0) * this.GetInputData<number>(1);
            this.SetOutputData<number>(0, result);

            super.Update();
        }
    }

    export class MathDivideBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<number>("number1", 0.0),
                new Socket<number>("number2", 0.0)
            ]);
            let outputs = new SocketGroup([
                new Socket<number>("result", 0.0)
            ]);
            super(BlockType.MathAddition, inputs, outputs);
        }

        Update() {
            let number2 = this.GetInputData<number>(1);
            let result = 0;
            if (number2 == 0)
                result = 0;
            else
                result = this.GetInputData<number>(0) / number2;
                
            this.SetOutputData<number>(0, result);

            super.Update();
        }
    }

    export class MathSinBlock extends BasicBlock {
        constructor() {
            let input  = new SocketGroup([
                new Socket<number>("input", 0.0),
            ]);
            let output  = new SocketGroup([
                new Socket<number>("output", 0.0),
            ]);
            super(BlockType.MathSin, input, output);
        }

        Update() {
            this.SetOutputData(0, Math.sin(this.GetInputData(0)));

            super.Update();
        }
    }

    export class MathClampBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<number>("in", 0.0),
            ]);
            let outputs = new SocketGroup([
                new Socket<number>("out", 0.0)
            ]);
            super(BlockType.MathClamp, inputs, outputs);
        }

        Update() {
            let result = this.GetInputData<number>(0);
            if (result < 0.0)
                result = 0.0;
            else if (result > 1.0)
                result = 1.0;

            this.SetOutputData<number>(0, result);

            super.Update();
        }
    }

    export class DisplayInputBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<number>("inputToDisplay", 0.0),
            ]);
            super(BlockType.DisplayInput, inputs, new SocketGroup());
        }

        Update() {
            let result = this.GetInputData<number>(0);
            console.log(result)

            super.Update();
        }
    }

    export class TimeBlock extends BasicBlock {
        constructor() {
            let output  = new SocketGroup([
                new Socket<number>("time", 0.0),
            ]);
            super(BlockType.Time, new SocketGroup(), output);
        }

        Update() {
            this.SetOutputData(0, AppState.time);
            super.Update();
        }
    }

    export class GenerateMeshBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<boolean>("trigger", false),
                new Socket<number>("red", 100),
                new Socket<number>("green", 0),
                new Socket<number>("blue", 25)
            ]);
            let outputs = new SocketGroup([
                new Socket<Geometry.Mesh>("result", null)
            ]);
            super(BlockType.GenerateCubeMesh, inputs, outputs);
        }
    }

    export class GenerateCubeMeshBlock extends BasicBlock {
        mesh: Geometry.Mesh;
        vertices: Float32Array;
        indices: Uint16Array;
        normals: Float32Array;
        colors: Float32Array;
        modelMatrix: glm.mat4;
        tint: Float32Array;

        constructor() {
            let inputs  = new SocketGroup([
                new Socket<boolean>("trigger", false),
                new Socket<number>("red", 100),
                new Socket<number>("green", 0),
                new Socket<number>("blue", 25)
            ]);
            let outputs = new SocketGroup([
                new Socket<Geometry.Mesh>("result", null)
            ]);
            super(BlockType.GenerateCubeMesh, inputs, outputs);

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

                let lightPositionUniform = new Geometry.Uniform<glm.vec3>("iLightPosition", Geometry.UniformType.Vector3, Utility.MakeVec3(0.0, 0.0, 0.0));
                let cameraPositionUniform = new Geometry.Uniform<glm.vec3>("iViewPosition", Geometry.UniformType.Vector3, AppState.cameraPosition);
                let viewUniform = new Geometry.Uniform<glm.mat4>("iView", Geometry.UniformType.Matrix4, AppState.viewMatrix);
                let projectionUniform = new Geometry.Uniform<glm.mat4>("iProjection", Geometry.UniformType.Matrix4, AppState.projectionMatrix);
                let timeUniform = new Geometry.Uniform<number>("iTime", Geometry.UniformType.Float, AppState.time);
                let resolutionUniform = new Geometry.Uniform<glm.vec2>("iResolution", Geometry.UniformType.Vector2, Utility.MakeVec2(AppState.resolution[0], AppState.resolution[1]));

                let material = new Geometry.Material("vertex-normal", "fragment-normal", new Geometry.BufferUniform([
                    modelUniform, tintColorUniform,
                    cameraPositionUniform, viewUniform, projectionUniform, lightPositionUniform,
                    timeUniform, resolutionUniform,]));

                this.mesh = new Geometry.Mesh(geometry, material);

                this.SetOutputData(0, this.mesh);
        }

        Update() {
            //let trigger = this.GetInputData<boolean>(0);
            //if (trigger) {
                //this.SetInputData<boolean>(0, false);

                // this.geometry = new Geometry.BufferGeometry();
            //}
            this.tint[0] = this.GetInputData(1);
            this.tint[1] = this.GetInputData(2);
            this.tint[2] = this.GetInputData(3);

            this.mesh.material.SetActive();

            this.mesh.material.SetUniform("iModel", this.modelMatrix)
            this.mesh.material.SetUniform("iTintColor", this.tint)

            this.mesh.material.SetUniform("iLightPosition", AppState.lightPosition)
            this.mesh.material.SetUniform("iViewPosition", AppState.cameraPosition)
            this.mesh.material.SetUniform("iView", AppState.viewMatrix)
            this.mesh.material.SetUniform("iProjection", AppState.projectionMatrix) // location error

            this.mesh.material.SetUniform("iTime", AppState.time)
            this.mesh.material.SetUniform("iResolution", AppState.resolution)

            this.mesh.BindAttributes();
            this.mesh.DrawIndexed();

            super.Update();
        }
    }

    export class MeshRenderingBlock extends BasicBlock {
        constructor() {
            let inputs  = new SocketGroup([
                new Socket<Geometry.Mesh>("mesh1", null),
                new Socket<Geometry.Mesh>("mesh2", null),
                new Socket<Geometry.Mesh>("mesh3", null)
            ]);
            let outputs = new SocketGroup();
            super(BlockType.MeshRendering, inputs, outputs);
        }

        Update() {
            /*
            for (let i = 0; i < this.inputs.sockets.length; i++) {
                const socket = this.inputs.sockets[i];
                if (socket.IsConnected()) {
                    const block = socket.connectedSocket.myBlock as GenerateCubeMeshBlock;
                    const mesh = this.GetInputData<Geometry.Mesh>(i);
                    //console.log(block);
                    //if (block == null || mesh == null) {
                        //continue;
                    //}
                    mesh.material.SetUniform("iModel", block.modelMatrix)
                    mesh.material.SetUniform("iTintColor", block.tint)
                    // console.log(block.tint)

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
            */
        }
    }

    export function BlockTest() {
        let block1 = new MathAdditionBlock();

        let block2Inputs = new SocketGroup([new Socket<number>("display", 0.0)])
        let block2 = new BasicBlock(BlockType.Basic, block2Inputs, null);

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