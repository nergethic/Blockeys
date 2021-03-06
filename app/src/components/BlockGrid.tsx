import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../styles/main.scss';
import { Config } from '../config';
import * as Main from '../index'
import { Blocks } from '../blocks';
import { vec2, vec3, mat4 } from 'gl-matrix';
import * as Utility from '../utility'

let panelWidth = Config.CanvasWidth + 2;
let gridWidth = window.innerWidth - panelWidth;
let blockWidth = 175;
let blockHeight = 88;

class GridBlockContainer {
    name: string;
    gridPosition: vec2;
    block: Blocks.BasicBlock;
    type: Blocks.BlockType;

    constructor(name: string, block: Blocks.BasicBlock, gridPosition: vec2) {
        this.name = name;
        this.block = block;
        this.type = block.blockType;
        this.gridPosition = gridPosition;
    }
}

type GridOptions = {
    show: boolean,
    snap: boolean,
    size: number
}

type ColorRGB = {
    red: number,
    green: number,
    blue: number
}

type ContainerState = {
    w: number,
    h: number,
    grid: GridOptions,
    ctrl: boolean,
    blockContainers: GridBlockContainer[],
    activeBlockIndex: number,
    blockKeys: string[],
    draggedPoint: boolean,
    draggedQuadratic: boolean,
    draggedCubic: boolean,
    closePath: boolean,
    color: ColorRGB
  }


let genBlocks: () => void;
export function GenerateSomeBlocks() {
    genBlocks();
}

export class Container extends React.Component<any, ContainerState> {
    constructor(props: any) {
        super(props);
    }

    gridBlockContainers: GridBlockContainer[] = new Array();

    state: ContainerState = {
        w: window.innerWidth-panelWidth,
        h: window.innerHeight,
        grid: {
            show: true,
            snap: true,
            size: 22
        },
        ctrl: false,
        blockContainers: this.gridBlockContainers,
        activeBlockIndex: 0,
        blockKeys: ["0", "1", "2", "3", "4", "5"],
        draggedPoint: false,
        draggedQuadratic: false,
        draggedCubic: false,
        closePath: false,
        color: {
            red: 100,
            green: 0,
            blue: 25
        }
    };

    handleWindowSize(e: any) {
        panelWidth = Config.CanvasWidth + 2;
        gridWidth = window.innerWidth - panelWidth;

        this.setState({ w: window.innerWidth-panelWidth, h: window.innerHeight})
        this.reset(e);
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleWindowSize.bind(this));

        document.addEventListener("keydown", this.handleKeyDown, false)
        document.addEventListener("keyup", this.handleKeyUp, false)
    }
    
    UNSAFE_componentWillMount() {
        //let additionBlock = Main.CreateBlock(Blocks.BlockType.MathAddition, false);

        //additionBlock.ConnectSocket(additionBlock.outputs.sockets[0], displayInputBlock.inputs.sockets[0]);
        //additionBlock.SetInputData(0, 1.0);
        //additionBlock.SetInputData(1, 5.0);

        //additionBlock.Update();

        let displayInputBlock = Main.CreateBlock(Blocks.BlockType.DisplayInput, false);
        let displayInputBlockGridContainer = new GridBlockContainer("DISPLAY", displayInputBlock, Utility.MakeVec2(500, 300));
        this.gridBlockContainers.push(displayInputBlockGridContainer);

        genBlocks = () => {
            
            let timeBlock = Main.CreateBlock(Blocks.BlockType.Time, true);
            let sinBlock = Main.CreateBlock(Blocks.BlockType.MathSin, false);

            let sinBlockGridContainer = new GridBlockContainer("SIN", sinBlock, Utility.MakeVec2(500, 700));
            
            let timeBlockGridContainer = new GridBlockContainer("TIME", timeBlock, Utility.MakeVec2(100, 700));

            timeBlock.ConnectSocket(timeBlock.outputs.sockets[0], sinBlock.inputs.sockets[0]);

            //let additionBlockGridContainer = new GridBlockContainer(additionBlock, Utility.MakeVec2(100, 300));
        
            //this.gridBlocks.push(additionBlockGridContainer);
            this.gridBlockContainers.push(sinBlockGridContainer);
            this.gridBlockContainers.push(timeBlockGridContainer);
            /*
            
            let sinBlock2 = Main.CreateBlock(Blocks.BlockType.MathSin, false);
            
            
    
            let timeBlockGridContainer = new GridBlockContainer(timeBlock, Utility.MakeVec2(100, 700));
            let sinBlockGridContainer = new GridBlockContainer(sinBlock, Utility.MakeVec2(500, 700));
            let sinBlock2GridContainer = new GridBlockContainer(sinBlock2, Utility.MakeVec2(700, 800));
            this.gridBlockContainers.push(sinBlock2GridContainer);
    
            this.gridBlockContainers.push(timeBlockGridContainer);
            this.gridBlockContainer.push(sinBlockGridContainer);
    
            let meshBlock = Main.CreateBlock(Blocks.BlockType.GenerateMesh, true);
            let meshBlockBlockGridContainer = new GridBlockContainer(meshBlock, Utility.MakeVec2(0, 900));
            this.gridBlockContainers.push(meshBlockBlockGridContainer);

            //let asdads = Main.CreateBlock(Blocks.BlockType.GenerateMesh, true);
            //let meshBlockBlockGridContainer2 = new GridBlockContainer(meshBlock2, Utility.MakeVec2(0, 200));
            //this.gridBlockContainers.push(meshBlockBlockGridContainer2);
            */
        }
    }
    
    UNSAFE_componentWillUnmount() {
        // @ts-ignore
        document.removeEventListener("keydown")
        // @ts-ignore
        document.removeEventListener("keyup")
        // @ts-ignore
        window.removeEventListener("resize", this.handleWindowSize);
    }
    
    positiveNumber(n: any) {
        n = parseInt(n)
        if (isNaN(n) || n < 0) n = 0
        
        return n
    }
    
    setWidth = (e: any) => {
        let v = this.positiveNumber(e.target.value), min = 1
        if (v < min) v = min
        
        this.setState({ w: v })
    };
    
    setHeight = (e: any) => {
        let v = this.positiveNumber(e.target.value), min = 1
        if (v < min) v = min
        
        this.setState({ h: v })
    };

    setGridSize = (e: React.FormEvent<HTMLSelectElement>) => {
        let grid = this.state.grid
        let v = this.positiveNumber(e.currentTarget.value)
        let min = 1
        let max = Math.min(this.state.w, this.state.h)
        
        if (v < min) v = min
        if (v >= max) v = max / 2
        
        grid.size = v
        
        this.setState({ grid })
    };
    
    setGridSnap = (e: React.FormEvent<HTMLInputElement>) => {
        let grid = this.state.grid
        grid.snap = e.currentTarget.checked
        
        this.setState({ grid })
    };
    
    setGridShow = (e: React.FormEvent<HTMLInputElement>) => {
        let grid = this.state.grid
        grid.show = e.currentTarget.checked
        
        this.setState({ grid })
    };

    setClosePath = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({ closePath: e.currentTarget.checked })
    };
    
    getMouseCoords = (e: React.MouseEvent) => {
        const rect = (ReactDOM.findDOMNode(this.refs.svg) as Element).getBoundingClientRect()
        let x = Math.round(e.clientX - rect.x)
        let y = Math.round(e.clientY - rect.y)

        //if (this.state.grid.snap) {
            x = this.state.grid.size * Math.round(x / this.state.grid.size)
            y = this.state.grid.size * Math.round(y / this.state.grid.size)
        //}
        
        return Utility.MakeVec2(x, y)
    };
    
    setBlockType = (e: any) => {
        //const blockContainers = this.state.blockContainers;
        //const activeBlockIndex = this.state.activeBlockIndex;
        //const activeBlock: GridBlockContainer = blockContainers[activeBlockIndex];
    };
    
    setPointXPosition = (e: React.FormEvent<HTMLSelectElement>) => {
        if (this.state.activeBlockIndex < 0)
            return;

        let activeBlockCoords: vec2 = this.state.blockContainers[this.state.activeBlockIndex].gridPosition;
        let value = this.positiveNumber(e.currentTarget.value)
        if (value > this.state.w) {
            value = this.state.w
        }
        activeBlockCoords[0] = value

        this.setPointCoords(activeBlockCoords)
    };

    setPointYPosition = (e: React.FormEvent<HTMLSelectElement>) => {
        if (this.state.activeBlockIndex < 0)
            return;

        let activeBlockCoords: vec2 = this.state.blockContainers[this.state.activeBlockIndex].gridPosition;
        let value = this.positiveNumber(e.currentTarget.value)
        if (value > this.state.h) {
            value = this.state.h
        }
        
        activeBlockCoords[1] = value

        this.setPointCoords(activeBlockCoords)
    };

    updateBlocks() {
        const blockContainers = this.state.blockContainers;
        this.setState({ blockContainers })
    }
    
    setPointCoords = (coords: vec2) => {
        if (this.state.activeBlockIndex < 0)
            return;

        const blockContainers = this.state.blockContainers
        const activeBlock: GridBlockContainer = blockContainers[this.state.activeBlockIndex]
        activeBlock.gridPosition = coords

        this.setState({ blockContainers })
    };
    
    setDraggedPoint = (index: number) => {
        if (this.state.activeBlockIndex < 0)
            return;

        if ( ! this.state.ctrl) {
            this.setState({
                activeBlockIndex: index,
                draggedPoint: true
            })
        }
    };
    
    cancelDragging = (e: any) => {
        this.setState({
            draggedPoint: false,
            draggedQuadratic: false,
            draggedCubic: false
        })
    };
    
    addBlockToGrid = (blockContainer: GridBlockContainer) => {
        //if (this.state.ctrl) {
            //let coords = this.getMouseCoords(e)
            let blockContainers = this.state.blockContainers;
            blockContainers.push(blockContainer);
            //let newBlock = new Blocks.GenerateCubeMeshBlock();
            //let newBlock = new Blocks.MathAdditionBlock();
            //let newBlockData = new GridBlockContainer("ADD", newBlock, coords);
            

            this.setState({
                blockContainers,
                activeBlockIndex: blockContainers.length - 1
            })
        //}
    };
    
    removeActiveBlock = (e: any) => {
        let blockContainers = this.state.blockContainers
        let active = this.state.activeBlockIndex

        //if (blockContainers.length == 1) {
            //alert("HANDLE EMPTY GRID FIRST!"); // TODO
            //return;
        //}
        
        blockContainers.splice(active, 1)

        this.setState({
            blockContainers,
            activeBlockIndex: blockContainers.length - 1
        })
    };
    
    handleMouseMove = (e: any) => {
        if ( ! this.state.ctrl) {
            if (this.state.draggedPoint) {
                this.setPointCoords(this.getMouseCoords(e))
            }
        }
    };
    
    handleKeyDown = (e: any) => {
        if (e.ctrlKey) this.setState({ ctrl: true })
    };
    
    handleKeyUp = (e: any) => {
        if ( ! e.ctrlKey) this.setState({ ctrl: false })
    };
    
    generatePath() {
        let { blockContainers, closePath } = this.state
        let d = ""
        
        if (closePath) d += "Z"
        
        return d
    }

    reset = (e: any) => {
        let newKeyValue: string = new Date().getTime().toFixed();
        let newBlockKeys = new Array(10);
        for (let i = 0; i < 10; i++) {
            newBlockKeys[i] = newKeyValue + 0.1*i;
        }
        this.setState({ blockKeys: newBlockKeys });
    };

    onBlockSocketClick = (e: any) => {
        alert("click")
    }

    render() {
        return (
            <div
                className="ad-Container"
                onMouseUp={ this.cancelDragging }>
                <div className="ad-Container-main">                    
                    <div className="ad-Container-svg">
                        <SVG
                            key={this.state.blockKeys[0]}
                            blockKeys={this.state.blockKeys}
                            ref="svg"
                            path={ this.generatePath() }
                            { ...this.state }
                            // @ts-ignore
                            addBlockToGrid={ this.addBlockToGrid }
                            setDraggedPoint={ this.setDraggedPoint }
                            onBlockSocketClick={this.onBlockSocketClick}
                            handleMouseMove={ this.handleMouseMove }
                            reset={this.reset}
                            />
                    </div>
                </div>

                <div className="ad-Container-controls">
                    <WebGLCanvas 
                    
                    { ...this.state } />
                    <InspectorControls
                        h={this.state.h}
                        key={this.state.blockKeys[2]}
                        blockKey={this.state.blockKeys[2]}
                        { ...this.state }
                        reset={ this.reset }
                        removeActiveBlock={ this.removeActiveBlock }
                        setPointXPosition={ this.setPointXPosition }
                        setPointYPosition={ this.setPointYPosition }
                        updateBlocks={this.updateBlocks}
                        setBlockType={ this.setBlockType }
                        addBlockToGrid={ this.addBlockToGrid }
                        //setWidth={ this.setWidth }
                        //setHeight={ this.setHeight }
                        setGridSize={ this.setGridSize }
                        setGridSnap={ this.setGridSnap }
                        setGridShow={ this.setGridShow }
                        setClosePath={ this.setClosePath } />
                </div>

            </div>
        )
    }
    //<Foot />
}

function Foot(props: any) {
    return (
        <div className="ad-Foot">
            <ul className="ad-Foot-list">
                <li className="ad-Foot-item">
                    <span className="ad-Foot-highlight">SPACEBAR</span> - open block panel
                </li>
                <li className="ad-Foot-item">
                    <span className="ad-Foot-highlight">TEXT</span> - do something awesome today
                </li>
            </ul>
            <div className="ad-Foot-meta">
                <p>BLOCKEYS v1.0.0</p><br />
            </div>
        </div>
    )
}

type SVGProps = {
    blockKeys: string[]
    path: string,
    w : number,
    h: number,
    grid: GridOptions
    blockContainers: GridBlockContainer[],
    activeBlockIndex: number,
    addBlockToGrid: any,
    handleMouseMove: any,
    setDraggedPoint: any
    reset: any,
    onBlockSocketClick: any
}

type SVGState = {
    selectedOutputSocket: Blocks.Socket<any>,
    previouslySelectedSocket: Blocks.Socket<any>,
    selectedOutputSocketBlock: Blocks.BasicBlock
}

class SVG extends React.Component<SVGProps, SVGState> {
    constructor(props: any) {
        super(props);
    }
    //selectedInputSocketIndex: RectSocket;
    
    state: SVGState = {
        selectedOutputSocket: null,
        selectedOutputSocketBlock: null,
        previouslySelectedSocket: null
    }

    onInputSocketMouseDown(e: React.MouseEvent, clickedBlock: Blocks.BasicBlock, socketIndex: number) {
        let inputSocket = clickedBlock.inputs.sockets[socketIndex];

        if (this.state.previouslySelectedSocket == inputSocket) {
            clickedBlock.DisconnectSocket(inputSocket);
        }

        this.setState({previouslySelectedSocket: inputSocket});

        if (this.state.selectedOutputSocket != null && this.state.selectedOutputSocket.myBlock != inputSocket.myBlock && !this.state.selectedOutputSocket.IsConnected() && !inputSocket.IsConnected()) {
            this.state.selectedOutputSocketBlock.ConnectSocket(this.state.selectedOutputSocket, inputSocket)
            this.state.selectedOutputSocketBlock.Update();

            //console.log(this.state.selectedOutputSocketBlock.outputs.sockets[0].IsConnected())
            this.props.reset();
        }
    }

    onOutputSocketMouseDown(e: React.MouseEvent, clickedBlock: Blocks.BasicBlock, socketIndex: number) {
        let socket = clickedBlock.outputs.sockets[socketIndex];

        if (this.state.previouslySelectedSocket == socket) {
            clickedBlock.DisconnectSocket(socket);
        }

        this.setState({
            selectedOutputSocketBlock: clickedBlock,
            previouslySelectedSocket: socket,
            selectedOutputSocket: socket
        })
        //this.selectedOutputSocketBlock = clickedBlock;
        //this.selectedOutputSocket = clickedBlock.inputs.sockets[socketIndex];
    }

    onInputSocketMouseUp(e: MouseEvent, socketIndex: number) {
        alert(socketIndex)
    }

    render() {
        const {
            blockKeys,
            path,
            w,
            h,
            grid,
            blockContainers,
            activeBlockIndex,
            addBlockToGrid,
            onBlockSocketClick,
            handleMouseMove,
            setDraggedPoint,
            reset
        }: SVGProps = this.props as SVGProps

        let SVGblocks = blockContainers.map((block: GridBlockContainer, i: any, a: any) => {
            let pos = block.gridPosition; // todo
            let anchors = []

            let table: JSX.Element[] = new Array();

            if (block.block == null) {
                console.log("[SVG]: SVGblocks error!")
                return;
            }

            // generate inputs
            for (let i = 0; i < block.block.inputs.sockets.length; i++) {
                let elem = <RectSocket
                    index={i}
                    x={ pos[0] }
                    y={ pos[1] + 20*i }
                    onClick={(e: React.MouseEvent) => this.onInputSocketMouseDown(e, block.block, i)}
                />;

                table.push(elem);
            }

            // generate outputs TODO this is ugly and ineficcient
            for (let i = 0; i < block.block.outputs.sockets.length; i++) {
                table.push(<RectSocket 
                    index={i}
                    x={ pos[0] + 160 } // TODO: 300 to block length
                    y={ pos[1] + 20*i }
                    onClick={(e: React.MouseEvent) => this.onOutputSocketMouseDown(e, block.block, i)}
                />);

                // find and draw connections
                for (let i = 0; i < block.block.outputs.sockets.length; i++) {
                    const mySocket = block.block.outputs.sockets[i];
                    if (mySocket.IsConnected()) {
                        blockContainers.forEach((b: GridBlockContainer) => {
                            // TODO? if (b == block) continue;
                            for (let socketIndex = 0; socketIndex < b.block.inputs.sockets.length; socketIndex++) { // TODO: cache this
                                const socket = b.block.inputs.sockets[socketIndex];
                                if (socket.IsConnected()) {
                                    if (socket.connectedSocket == mySocket) {
                                        table.push(<g className="ad-Anchor">
                                            <line
                                                className="ad-Anchor-line"
                                                x1={ pos[0] + 175 }
                                                y1={ pos[1] + 20*i }
                                                x2={ b.gridPosition[0]}
                                                y2={ b.gridPosition[1] + socketIndex*20} />
                                                </g>);
                                    }
                                }
                            }
                        });
                    }
                }                
            }

            return (
                <g className={
                    "ad-PointGroup" +
                    (i === 0 ? "  ad-PointGroup--first" : "") +
                    (activeBlockIndex === i ? "  is-active" : "")
                }>
                    <Rect
                        index={ i }
                        x={ pos[0] }
                        y={ pos[1] }
                        reset={reset}
                        setDraggedPoint={ setDraggedPoint } />
                    <text className="noselect" x={ pos[0]+30 } y={ pos[1]+55 } fill="white">{block.name}</text>

                    {table}
                </g>
            )
        })

        return (
            // grid
            <svg
                key={blockKeys[5]}
                className="ad-SVG"
                width={ w }
                height={ h }
                onMouseMove={ (e) => handleMouseMove(e) }>
                <Grid
                    key={blockKeys[6]}
                    w={ w }
                    h={ h }
                    grid={ grid }/>
                <path
                    className="ad-Path"
                    d={ path } />
                <g className="ad-Points">
                    { SVGblocks }
                </g>
            </svg>
        )
    }
}

function Cubic(props: any) {
    return (
        <g className="ad-Anchor">
            <line
                className="ad-Anchor-line"
                x1={ props.p1x }
                y1={ props.p1y }
                x2={ props.x1 }
                y2={ props.y1 } />
            <line
                className="ad-Anchor-line"
                x1={ props.p2x }
                y1={ props.p2y }
                x2={ props.x2 }
                y2={ props.y2 } />
            <circle
                className="ad-Anchor-point"
                onMouseDown={ (e) => props.setDraggedCubic(props.index, 0) }
                cx={ props.x1 }
                cy={ props.y1 }
                r={ 6 } />
            <circle
                className="ad-Anchor-point"
                onMouseDown={ (e) => props.setDraggedCubic(props.index, 1) }
                cx={ props.x2 }
                cy={ props.y2 }
                r={ 6 } />
        </g>
    )
}

function Quadratic(props: any) {
    return (
        <g className="ad-Anchor">
            <line
                className="ad-Anchor-line"
                x1={ props.p1x }
                y1={ props.p1y }
                x2={ props.x }
                y2={ props.y } />
            <line
                className="ad-Anchor-line"
                x1={ props.x }
                y1={ props.y }
                x2={ props.p2x }
                y2={ props.p2y } />
            <circle
                className="ad-Anchor-point"
                onMouseDown={ (e) => props.setDraggedQuadratic(props.index) }
                cx={ props.x }
                cy={ props.y }
                r={ 6 } />
        </g>
    )
}

function Point(props: any) {
    return (
        <circle
            className="ad-Point"
            onMouseDown={ (e) => props.setDraggedPoint(props.index) }
            cx={ props.x }
            cy={ props.y }
            r={ 8 } />
    )
}

function Rect(props: any) {
    let styles = {
        fill: "rgb(33, 33, 36)",
        transform: "translate3d(0,0,0)"
    };

    return (
        <rect
            className="ad-Rect"
            onMouseDown={ (e) => {
                props.setDraggedPoint(props.index);
                props.reset();
            } }
            x={ props.x }
            y={ props.y }
            width={ blockWidth }
            height={ blockHeight }
            rx={ 0 }
            style={styles}
        />
    )
}

class RectSocket extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let socketStyles = {
            fill: "rgb(103, 103, 106)"
        };

        return (
            <rect
                className="ad-block-socket"
                x={ this.props.x }
                y={ this.props.y }
                width={ 15 }
                height={ 15 }
                rx={ 0 }
                style={socketStyles}
                onMouseDown={(e: any) => this.props.onClick(e, this.props.index)}
            />
        );
    }
}
            
function Grid(props: any) {
    const { show, snap, size } = props.grid
    
    let grid = []
    
    for (let i = 1 ; i < (props.w / size) ; i++) {
        grid.push(
            <line
                x1={ i * size }
                y1={ 0 }
                x2={ i * size }
                y2={ props.h } />
        )
    }

    for (let i = 1 ; i < (props.h / size) ; i++) {
        grid.push(
            <line
                x1={ 0 }
                y1={ i * size }
                x2={ props.w }
                y2={ i * size } />
        )
    }
    
    return (
        <g className={
            "ad-Grid" +
            ( ! show ? "  is-hidden" : "")
        }>
            { grid }
        </g>
    )
}

function WebGLCanvas(props: any) {
    return (
        <div id="webgl-canvas-container">
        </div>
    )
}

type VolatileTextProps = {
    name: string,
    block: GridBlockContainer,
    dataToDisplay: () => number
}

const InitialVolatileTextState = {
    val: "0",
    updateTextIntervalID: -1
}

type VolatileTextState = typeof InitialVolatileTextState

class VolatileText extends React.Component<VolatileTextProps, VolatileTextState> {
    public readonly state = InitialVolatileTextState; 
    constructor(props: VolatileTextProps) {
        super(props);
    }

    componentDidMount() {
        let updateTextIntervalID = setInterval(() => {
            this.setState({ val: this.props.dataToDisplay().toFixed(1)} as VolatileTextState)
        }, 20)

        this.setState({updateTextIntervalID: updateTextIntervalID})
    }

    componentWillUnmount() {
        clearInterval(this.state.updateTextIntervalID);
    }

    render() {
        return (
            <div className="ad-Control">
        <label className="ad-Control-label">
        { this.props.name }
        </label>
        <h1 className="ad-Text">{this.state.val}</h1>
        </div>
            
        );
    }
}

/*
<Control
                    name="X"
                    type="range"
                    min={ -4 }
                    max={ 4 }
                    step={ 0.1 }
                    value={ mat4.getTranslation(Utility.MakeVec3(0,0,0), activeBlockCasted.modelMatrix)[0] }
                    onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                        let currentTranslation = Utility.MakeVec3(0,0,0);
                        currentTranslation = mat4.getTranslation(currentTranslation, activeBlockCasted.modelMatrix)
                        let newMatrix = mat4.create();
                        newMatrix = mat4.translate(newMatrix, newMatrix, Utility.MakeVec3(parseFloat(e.currentTarget.value), currentTranslation[1], currentTranslation[2]));
                        activeBlockCasted.modelMatrix = newMatrix;
                        props.updateBlocks();
                    } } />
*/

class GenerateMeshInspector extends React.Component<any, any> {
    public readonly state = {
        positionInputValues: Utility.MakeVec3(0, 0, 0),
    };

    elementNames: string[];
    positionSliderMax: number;

    constructor(props: any) {
        super(props);

        this.elementNames = new Array(3);
        this.elementNames[0] = "X";
        this.elementNames[1] = "Y";
        this.elementNames[2] = "Z";

        this.positionSliderMax = 4;
    }

    UpdateState() {
        this.setState({
            positionInputValues: [
                this.GetPositionInputValue(0),
                this.GetPositionInputValue(1),
                this.GetPositionInputValue(2)
            ]
        })
    }
    
    GetPositionInputValue = (positionCoord: number): number => {
        if (positionCoord < 0 || positionCoord >= 3) {
            alert("positionCoord should be equal to (0 - x), (1 - y) or (2 - z), current value: " + positionCoord);
            return 0;
        }

        return mat4.getTranslation(Utility.MakeVec3(0,0,0), this.props.activeBlockCasted.modelMatrix)[positionCoord]
    };

    onPositionChange = (e: React.FormEvent<HTMLInputElement>, positionCoord: number) => {
        let position = Utility.MakeVec3(0,0,0);
        position = mat4.getTranslation(position, this.props.activeBlockCasted.modelMatrix)
        let newMatrix = mat4.create();
        let parsedValue = parseFloat(e.currentTarget.value);

        if (positionCoord < 0 || positionCoord >= 3) {
            alert("positionCoord should be equal to (0 - x), (1 - y) or (2 - z), current value: " + positionCoord);
            return;
        }

        position[positionCoord] = parsedValue;

        newMatrix = mat4.translate(newMatrix, newMatrix, position);
        this.props.activeBlockCasted.modelMatrix = newMatrix;
        this.UpdateState();
    }

    onPositionXChange = (e: React.FormEvent<HTMLInputElement>) => this.onPositionChange(e, 0);
    onPositionYChange = (e: React.FormEvent<HTMLInputElement>) => this.onPositionChange(e, 1);
    onPositionZChange = (e: React.FormEvent<HTMLInputElement>) => this.onPositionChange(e, 2);
    
    render() {
        let positionSliderControls: JSX.Element[] = new Array(3);
        for (let i = 0; i < 3; i++) {
            positionSliderControls[i] = 
            <RangeControl
                name={this.elementNames[i]}
                min={-this.positionSliderMax}
                max={this.positionSliderMax}
                step={0.1}
                inputValue={ this.state.positionInputValues[i].toFixed(2) }
                onChange={ (e: any) => this.onPositionChange(e, i) }
            />
        }

        return(
            <div>
                <div className="ad-Controls-container">
                    {positionSliderControls}
                </div>
                <div className="ad-Controls-container">
                <VolatileText
                        name="Red"
                        block={this.props.activeBlockCasted}
                        dataToDisplay={(): number => this.props.activeBlockCasted.GetInputData(1)} />
                <VolatileText
                        name="Green"
                        block={this.props.activeBlockCasted}
                        dataToDisplay={(): number => this.props.activeBlockCasted.GetInputData(2)} />
                <VolatileText
                        name="Blue"
                        block={this.props.activeBlockCasted}
                        dataToDisplay={(): number => this.props.activeBlockCasted.GetInputData(3)} />
                </div>
            </div>
        );
    }
}

function AddBlockButtons(props: any) {
    let addNewBlock = (e: React.MouseEvent, name: string): void => {
        let newBlock: Blocks.BasicBlock;
        let newBlockGridContainer: GridBlockContainer;
        let position = Utility.MakeVec2(gridWidth/2.0 - blockWidth/2.0, props.h/2 - blockHeight/2.0);

        switch (name) {
            case "ADD": {
                newBlock = Main.CreateBlock(Blocks.BlockType.MathAddition, false);
            } break;

            case "SUB": {
                newBlock = Main.CreateBlock(Blocks.BlockType.MathSubstraction, false);
            } break;

            case "MUL": {
                newBlock = Main.CreateBlock(Blocks.BlockType.MathMultiply, false);
            } break;

            case "DIV": {
                newBlock = Main.CreateBlock(Blocks.BlockType.MathDivide, false);
            } break;

            case "CUBE": {
                newBlock = Main.CreateBlock(Blocks.BlockType.GenerateCubeMesh, true);
            } break;

            case "TIME": {
                newBlock = Main.CreateBlock(Blocks.BlockType.Time, true);
            } break;

            case "SIN": {
                newBlock = Main.CreateBlock(Blocks.BlockType.MathSin, false);
            } break;

            case "CLAMP01": {
                newBlock = Main.CreateBlock(Blocks.BlockType.MathClamp, false);
            } break;

            case "OUTPUT": {
                newBlock = Main.CreateBlock(Blocks.BlockType.OutputNumber, false);
            } break;

            default: alert("[addNewBlock]: name not handled in switch")
        }

        newBlockGridContainer = new GridBlockContainer(name, newBlock, position);
        props.addBlockToGrid(newBlockGridContainer);

        props.reset(e)
    };

    return(
        <div>
    <h2 className="ad-Controls-title">
                Add Block
            </h2>

            <div className="ad-Controls-container">
                <Control
                    type="button"
                    action="reset"
                    value="ADD"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "ADD") } />
                <Control
                    type="button"
                    action="reset"
                    value="SUB"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "SUB") } />
                <Control
                    type="button"
                    action="reset"
                    value="MUL"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "MUL") } />
                <Control
                    type="button"
                    action="reset"
                    value="DIV"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "DIV") } />
                <Control
                    type="button"
                    action="reset"
                    value="TIME"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "TIME") } />
                <Control
                    type="button"
                    action="reset"
                    value="SIN"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "SIN") } />
                <Control
                    type="button"
                    action="reset"
                    value="COS"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="TAN"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="COT"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="POW"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="SQRT"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
            </div>
            <div className="ad-Controls-container">
                <Control
                    type="button"
                    action="reset"
                    value="CLAMP01"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "CLAMP01") } />
                <Control
                    type="button"
                    action="reset"
                    value="CUBE"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "CUBE") } />
                <Control
                    type="button"
                    action="reset"
                    value="LOOP"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="SAMPE"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="C#"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="SHADER"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="MAT"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
                <Control
                    type="button"
                    action="reset"
                    value="OUTPUT"
                    onClick={ (e: React.MouseEvent) => addNewBlock(e, "OUTPUT") } />
            </div>
        </div>
    )
}

function InspectorControls(props: any) {
    if (props.activeBlockIndex >= props.blockContainers.length) {
        alert("ERROR: invalid activeBlockIndex: " + props.activeBlockIndex)
        console.log("ERROR: invalid activeBlockIndex: " + props.activeBlockIndex);
        return;
    }

    let styles = {
        height: ((props.h - Config.CanvasHeight) + 'px'),
    };

    if (props.activeBlockIndex < 0) {
        return (
            <div className="ad-Controls" style={styles}>
                <AddBlockButtons {...props}/>
            </div>
        );
    }

    let params: JSX.Element[] = new Array();
    const activeBlock: GridBlockContainer = props.blockContainers[props.activeBlockIndex]
    const step = props.grid.snap ? props.grid.size : 1

    switch (activeBlock.type) {
        case Blocks.BlockType.Basic: {
        
        } break;

        case Blocks.BlockType.MathClamp: {
            params.push(
                <div className="ad-Controls-container">
                <VolatileText
                    name="INPUT"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetInputData(0)}
                     />
                <VolatileText
                    name="OUTPUT"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetOutputData(0)}
                    />
                </div>
            )
        } break;

        case Blocks.BlockType.DisplayInput: {
            params.push(
                <VolatileText
                    name="INPUT"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetInputData(0)}/>
            );
        } break;

        /*
        onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        let value = e.currentTarget.value;
                        let numberValue = parseInt(value);
                        if (!isNaN(numberValue)) {
                            activeBlock.block.SetInputData(0, numberValue);
                            activeBlock.block.Update();
                        }
                    } }

onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        let value = e.currentTarget.value;
                        let numberValue = parseInt(value);
                        if (!isNaN(numberValue)) {
                            activeBlock.block.SetInputData(1, parseInt(value));
                            activeBlock.block.Update();
                        }
                    } }
        
        */

        case Blocks.BlockType.MathAddition:
        case Blocks.BlockType.MathSubstraction:
        case Blocks.BlockType.MathMultiply:
        case Blocks.BlockType.MathDivide: {
            params.push(
                <div className="ad-Controls-container">
                <VolatileText
                    name="INPUT 0"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetInputData(0)}
                     />
                <VolatileText
                    name="INPUT 1"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetInputData(1)}
                     />
                <VolatileText
                    name="OUTPUT"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetOutputData(0)}
                    />
                </div>
            )
        } break;

        case Blocks.BlockType.Time: {
            params.push(
                <VolatileText
                    name="TIME OUT"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetOutputData(0)}/>
            );
        } break;

        case Blocks.BlockType.MathSin: {
            params.push(
                <div>
                <VolatileText
                    name="IN"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetInputData(0)} />

                <VolatileText
                    name="OUT"
                    block={activeBlock}
                    dataToDisplay={(): number => activeBlock.block.GetOutputData(0)} />
                </div>
            );
        } break;

        case Blocks.BlockType.OutputNumber: {
            params.push(
                <div>
                    <Control
                        name="Out"
                        type="text"
                        value={props.color.blue}
                        onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                            props.color.blue = e.currentTarget.value;
                            let value = e.currentTarget.value;
                            let numberValue = parseInt(value);
                            if (!isNaN(numberValue)) {
                                activeBlock.block.SetInputData(0, numberValue);
                                activeBlock.block.Update();
                            }
                        } }
                    />
                </div>
            );
        } break;

        case Blocks.BlockType.GenerateCubeMesh: {
            let activeBlockCasted = activeBlock.block as Blocks.GenerateCubeMeshBlock;
            params.push(
                <GenerateMeshInspector
                    //@ts-ignore
                    {...props}
                    activeBlockCasted={activeBlockCasted}
                    updateBlocks={props.updateBlocks} />
            );
        } break;

        default: alert("[InspectorControls]: unhandled block type");
    }
        
    return (
        <div className="ad-Controls" style={styles}>
            <h3 className="ad-Controls-title">
                Parameters
            </h3>

            { params }

            <h3 className="ad-Controls-title">
                Common
            </h3>
            
            <div className="ad-Controls-container">
                <Control
                    name="Grid size"
                    type="text"
                    value={ props.grid.size }
                    onChange={ (e: React.FormEvent<HTMLInputElement>) => props.setGridSize(e) } />
                <Control
                    name="Snap grid"
                    type="checkbox"
                    checked={ props.grid.snap }
                    onChange={ (e: React.FormEvent<HTMLInputElement>) => props.setGridSnap(e) } />
                <Control
                    name="Show grid"
                    type="checkbox"
                    checked={ props.grid.show }
                    onChange={ (e: React.FormEvent<HTMLInputElement>) => props.setGridShow(e) } />
            </div>
                    
            <h3 className="ad-Controls-title">
                Selected point
            </h3>
            
            {/*( // TODO: check out u can do { false && (<div>to skip this JSX stuff</div>) }
                <div className="ad-Controls-container">
                    <Control
                        name="Point type"
                        type="choices"
                        id="pointType"
                        choices={[
                            // TODO: make checked something real
                            { name: "A", value: 0, checked: true}, // (!activeBlock.q && !activeBlock.c && !activeBlock.a)
                            { name: "B", value: 1, checked: false }, // !!activeBlock.q
                            { name: "C", value: 2, checked: false }, // !!activeBlock.c
                            { name: "D", value: 3, checked: false }  // !!activeBlock.a
                        ]}
                        onChange={ (e: any) => props.setBlockType(e) } />
                </div>
                    )*/
                    
                    /*
                    <div className="ad-Controls-container">
                <Control
                    name="Point X position"
                    type="range"
                    min={ 0 }
                    max={ props.w }
                    step={ step }
                    value={ activeBlock.gridPosition[0] }
                    onChange={ (e: any) => props.setPointXPosition(e) } />
            </div>
            <div className="ad-Controls-container">
                <Control
                    name="Point Y position"
                    type="range"
                    min={ 0 }
                    max={ props.h }
                    step={ step }
                    value={ activeBlock.gridPosition[1] }
                    onChange={ (e: any) => props.setPointYPosition(e) } />
            </div>
            */
                    }

            <AddBlockButtons
                {...props}
                />
            
            {(
                <div className="ad-Controls-container">
                    <Control
                        type="button"
                        action="delete"
                        value="Remove selected"
                        onClick={ (e: any) => props.removeActiveBlock(e) } />
                </div>
            )}
        </div>
    )
}

function RangeControl(props: any) {
    const {
        name,
        inputValue,
        min,
        max,
        onChange,
        step,
        ..._props
    } = props
    
    return(
        <Control
            name={name}
            type="range"
            min={min }
            max={ max }
            step={ step }
            value={ inputValue }
            onChange={(e: any) => onChange(e)} />
    );
}

function Control(props: any) {
    const {
        name,
        type,
        ..._props
    } = props

    let control: JSX.Element
    let label: JSX.Element

    switch (type) {
        case "range": control = <Range { ..._props } />
        break
        case "text": control = <Text { ..._props } />
        break
        case "checkbox": control = <Checkbox { ..._props } />
        break
        case "button": control = <Button { ..._props } />
        break
        case "choices": control = <Choices { ..._props } />
        break
    }

    if (name) {
        label = (
            <label className="ad-Control-label">
                { name }
            </label>
        )
    }

    return (
        <div className="ad-Control">
            { label }
            { control }
        </div>
    )
}

function Choices(props: any) {
    let choices = props.choices.map((c: any, i: any) => {
        return (
            <label className="ad-Choice">
                <input
                    className="ad-Choice-input"
                    type="radio"
                    value={ c.value }
                    checked={ c.checked }
                    name={ props.id }
                    onChange={ props.onChange } />
                <div className="ad-Choice-fake">
                    { c.name }
                </div>
            </label>
        )
    })
    
    return (
        <div className="ad-Choices">
            { choices }
        </div>
    )
}

function Button(props: any) {
    return (
        <button
            className={
                "ad-Button" +
                (props.action ? "  ad-Button--" + props.action : "")
            }
            type="button"
            onClick={ props.onClick }>
            { props.value }
        </button>
    )
}

function Checkbox(props: any) {
    return (
        <label className="ad-Checkbox">
            <input
                className="ad-Checkbox-input"
                type="checkbox"
                onChange={ props.onChange }
                checked={ props.checked } />
            <div className="ad-Checkbox-fake" />
        </label>
    )
}

function Text(props: any) {
    return (
        <input
            className="ad-Text"
            type="text"
            value={ props.value }
            onChange={ props.onChange }
            />
    )
}

function Range(props: any) {    
    return (
        <div className="ad-Range">
            <input
                className="ad-Range-input"
                type="range"
                min={ props.min }
                max={ props.max }
                step={ props.step }
                value={ props.value }
                onChange={ props.onChange } />
            <input
                className="ad-Range-text  ad-Text"
                type="text"
                value={ props.value }
                onChange={ props.onChange } />
        </div>
    )
}