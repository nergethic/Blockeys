//import './main.scss';

export namespace Blocks {
    type SocketType = Socket<number | string>;

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

    export function BlockTest() {
        let block1 = new MathAdditionBlock();
        let block2 = new BasicBlock(new SocketGroup(
            [new Socket<number>("display", 0.0)]
        ), null);

        block1.ConnectSocket<number>(block1.outputs.sockets[0], block2.inputs.sockets[0]);

        block1.SetInputData<number>(0, 1.0);
        block1.SetInputData<number>(1, 2.5);

        block1.Update();

        //console.log(block1.GetOutputData<number>(0));
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