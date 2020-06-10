import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../styles/main.scss';
import { Config } from '../config';
import * as Main from '../index'
import { Blocks } from '../blocks';
import { vec2, vec3, mat4 } from 'gl-matrix';
import * as Utility from '../utility'

let panelWidth = Config.CanvasWidth + 2;

class GridBlockContainer {
    gridPosition: vec2;
    block: Blocks.BasicBlock;
    type: Blocks.BlockType;

    constructor(block: Blocks.BasicBlock, gridPosition: vec2) {
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
    blocks: GridBlockContainer[],
    activeBlockIndex: number,
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

export class Container extends React.Component {
    gridBlocks: GridBlockContainer[] = new Array();

    state: ContainerState = {
        w: window.innerWidth-panelWidth,
        h: window.innerHeight,
        grid: {
            show: true,
            snap: true,
            size: 22
        },
        ctrl: false,
        blocks: this.gridBlocks,
        activeBlockIndex: 0,
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
    
    UNSAFE_componentWillMount() {
        document.addEventListener("keydown", this.handleKeyDown, false)
        document.addEventListener("keyup", this.handleKeyUp, false)

        let additionBlock = Main.CreateBlock(Blocks.BlockType.MathAddition, false);
            let displayInputBlock = Main.CreateBlock(Blocks.BlockType.DisplayInput, false);
    
            additionBlock.ConnectSocket(additionBlock.outputs.sockets[0], displayInputBlock.inputs.sockets[0]);
            additionBlock.SetInputData(0, 1.0);
            additionBlock.SetInputData(1, 5.0);
    
            additionBlock.Update();
    
            let additionBlockGridContainer = new GridBlockContainer(additionBlock, Utility.MakeVec2(100, 300));
            let displayInputBlockGridContainer = new GridBlockContainer(displayInputBlock, Utility.MakeVec2(500, 300));
            this.gridBlocks.push(additionBlockGridContainer);
            this.gridBlocks.push(displayInputBlockGridContainer);

        genBlocks = () => {
            let timeBlock = Main.CreateBlock(Blocks.BlockType.Time, true);
            let sinBlock = Main.CreateBlock(Blocks.BlockType.MathSin, false);
            let sinBlock2 = Main.CreateBlock(Blocks.BlockType.MathSin, false);
            timeBlock.ConnectSocket(timeBlock.outputs.sockets[0], sinBlock.inputs.sockets[0]);
            sinBlock.ConnectSocket(sinBlock.outputs.sockets[0], sinBlock2.inputs.sockets[0]);
    
            let timeBlockGridContainer = new GridBlockContainer(timeBlock, Utility.MakeVec2(100, 700));
            let sinBlockGridContainer = new GridBlockContainer(sinBlock, Utility.MakeVec2(500, 700));
            let sinBlock2GridContainer = new GridBlockContainer(sinBlock2, Utility.MakeVec2(700, 800));
            this.gridBlocks.push(sinBlock2GridContainer);
    
            this.gridBlocks.push(timeBlockGridContainer);
            this.gridBlocks.push(sinBlockGridContainer);
    
            let meshBlock = Main.CreateBlock(Blocks.BlockType.GenerateMesh, true);
            let meshBlockBlockGridContainer = new GridBlockContainer(meshBlock, Utility.MakeVec2(0, 900));
            this.gridBlocks.push(meshBlockBlockGridContainer);
        }
    }
    
    UNSAFE_componentWillUnmount() {
        // @ts-ignore
        document.removeEventListener("keydown")
        // @ts-ignore
        document.removeEventListener("keyup")
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
        const blocks = this.state.blocks;
        const activeBlockIndex = this.state.activeBlockIndex;
        const activeBlock: GridBlockContainer = blocks[activeBlockIndex];
    };
    
    setPointXPosition = (e: React.FormEvent<HTMLSelectElement>) => {
        let activeBlockCoords: vec2 = this.state.blocks[this.state.activeBlockIndex].gridPosition;
        let value = this.positiveNumber(e.currentTarget.value)
        if (value > this.state.w) {
            value = this.state.w
        }
        activeBlockCoords[0] = value

        this.setPointCoords(activeBlockCoords)
    };

    setPointYPosition = (e: React.FormEvent<HTMLSelectElement>) => {
        let activeBlockCoords: vec2 = this.state.blocks[this.state.activeBlockIndex].gridPosition;
        let value = this.positiveNumber(e.currentTarget.value)
        if (value > this.state.h) {
            value = this.state.h
        }
        
        activeBlockCoords[1] = value

        this.setPointCoords(activeBlockCoords)
    };

    updateBlocks() {
        const blocks = this.state.blocks;
        this.setState({ blocks })
    }
    
    setPointCoords = (coords: vec2) => {
        const blocks = this.state.blocks
        const activeBlock: GridBlockContainer = blocks[this.state.activeBlockIndex]
        activeBlock.gridPosition = coords

        this.setState({ blocks })
    };
    
    setDraggedPoint = (index: number) => {
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
    
    addBlockToGrid = (e: any) => {
        if (this.state.ctrl) {
            let coords = this.getMouseCoords(e)
            let blocks = this.state.blocks

            //let newBlock = new Blocks.GenerateCubeMeshBlock();
            let newBlock = new Blocks.MathAdditionBlock();
            let newBlockData = new GridBlockContainer(newBlock, coords);
            blocks.push(newBlockData)

            this.setState({
                blocks,
                activeBlockIndex: blocks.length - 1
            })
        }
    };
    
    removeActiveBlock = (e: any) => {
        let blocks = this.state.blocks
        let active = this.state.activeBlockIndex

        if (blocks.length == 1) {
            alert("HANDLE EMPTY GRID FIRST!"); // TODO
            return;
        }
        
        blocks.splice(active, 1)

        this.setState({
            blocks,
            activeBlockIndex: blocks.length - 1
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
        let { blocks, closePath } = this.state
        let d = ""
        
        /*
        blocks.forEach((p, i) => {
            if (i === 0) {
                // first point
                d += "M "
            } else if (p.q) {
                // quadratic
                d += `Q ${ p.q.x } ${ p.q.y } `
            } else if (p.c) {
                // cubic
                d += `C ${ p.c[0].x } ${ p.c[0].y } ${ p.c[1].x } ${ p.c[1].y } `
            } else if (p.a) {
                // arc
                d += `A ${ p.a.rx } ${ p.a.ry } ${ p.a.rot } ${ p.a.laf } ${ p.a.sf } `
            } else {
                d += "L "
            }

            d += `${ p.x } ${ p.y } `
        })
        */
        
        if (closePath) d += "Z"
        
        return d
    }

    reset = (e: any) => {
        let w = this.state.w, h = this.state.h
        
        this.setState({
            blocks: [{ x: w / 2, y: h / 2 }],
            activeBlockIndex: 0
        })
    };

    render() {
        return (
            <div
                className="ad-Container"
                onMouseUp={ this.cancelDragging }>
                <div className="ad-Container-main">                    
                    <div className="ad-Container-svg">
                        <SVG
                            ref="svg"
                            path={ this.generatePath() }
                            { ...this.state }
                            // @ts-ignore
                            addBlockToGrid={ this.addBlockToGrid }
                            setDraggedPoint={ this.setDraggedPoint }
                            handleMouseMove={ this.handleMouseMove }
                            />
                    </div>
                </div>

                <div className="ad-Container-controls">
                    <WebGLCanvas 
                    { ...this.state } />
                    <InspectorControls
                        { ...this.state }
                        reset={ this.reset }
                        removeActiveBlock={ this.removeActiveBlock }
                        setPointXPosition={ this.setPointXPosition }
                        setPointYPosition={ this.setPointYPosition }
                        updateBlocks={this.updateBlocks}
                        setBlockType={ this.setBlockType }
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
    path: string,
    w : number,
    h: number,
    grid: GridOptions
    blocks: GridBlockContainer[],
    activeBlockIndex: number,
    addBlockToGrid: any,
    handleMouseMove: any,
    setDraggedPoint: any
}

class SVG extends React.Component {
    render() {
        const {
            path,
            w,
            h,
            grid,
            blocks,
            activeBlockIndex,
            addBlockToGrid,
            handleMouseMove,
            setDraggedPoint,
        }: SVGProps = this.props as SVGProps

        let circles = blocks.map((block: GridBlockContainer, i: any, a: any) => {
            let pos = block.gridPosition; // todo
            let anchors = []

            let table: JSX.Element[] = new Array();

            // generate inputs
            for (let i = 0; i < block.block.inputs.sockets.length; i++) {
                let elem = <RectSocket 
                    x={ pos[0] }
                    y={ pos[1] + 20*i }
                />;

                table.push(elem);
            }

            // generate outputs TODO this is ugly and ineficcient
            for (let i = 0; i < block.block.outputs.sockets.length; i++) {
                table.push(<RectSocket 
                    x={ pos[0] + 205 } // TODO: 300 to block length
                    y={ pos[1] + 20*i }
                />);

                // find and draw connections
                for (let i = 0; i < block.block.outputs.sockets.length; i++) {
                    const mySocket = block.block.outputs.sockets[i];
                    if (mySocket.IsConnected()) {
                        blocks.forEach((b: GridBlockContainer) => {
                            // TODO? if (b == block) continue;
                            for (let socketIndex = 0; socketIndex < b.block.inputs.sockets.length; socketIndex++) { // TODO: cache this
                                const socket = b.block.inputs.sockets[socketIndex];
                                if (socket.IsConnected()) {
                                    if (socket.connectedSocket == mySocket) {
                                        table.push(<g className="ad-Anchor">
                                            <line
                                                className="ad-Anchor-line"
                                                x1={ pos[0] + 205 }
                                                y1={ pos[1] + 20*i }
                                                x2={ b.gridPosition[0]}
                                                y2={ b.gridPosition[1]} />
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
                        setDraggedPoint={ setDraggedPoint } />

                    {table}
                </g>
            )
            
            /*
            if (p.q) {
                anchors.push(
                    <Quadratic
                        index={ i }
                        p1x={ a[i - 1].x }
                        p1y={ a[i - 1].y }
                        p2x={ p.x }
                        p2y={ p.y }
                        x={ p.q.x }
                        y={ p.q.y }
                        setDraggedQuadratic={ setDraggedQuadratic } />
                )
            } else if (p.c) {
                anchors.push(
                    <Cubic
                        index={ i }
                        p1x={ a[i - 1].x }
                        p1y={ a[i - 1].y }
                        p2x={ p.x }
                        p2y={ p.y }
                        x1={ p.c[0].x }
                        y1={ p.c[0].y }
                        x2={ p.c[1].x }
                        y2={ p.c[1].y }
                        setDraggedCubic={ setDraggedCubic } />
                )
            }
            
            return (
                <g className={
                    "ad-PointGroup" +
                    (i === 0 ? "  ad-PointGroup--first" : "") +
                    (activeBlockIndex === i ? "  is-active" : "")
                }>
                    <Point
                        index={ i }
                        x={ p.x }
                        y={ p.y }
                        setDraggedPoint={ setDraggedPoint } />
                    { anchors }
                </g>
            )
            */
        })

        return (
            <svg
                className="ad-SVG"
                width={ w }
                height={ h }
                onClick={ (e) => addBlockToGrid(e) }
                onMouseMove={ (e) => handleMouseMove(e) }>
                <Grid
                    w={ w }
                    h={ h }
                    grid={ grid } />
                <path
                    className="ad-Path"
                    d={ path } />
                <g className="ad-Points">
                    { circles }
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
            onMouseDown={ (e) => props.setDraggedPoint(props.index) }
            x={ props.x }
            y={ props.y }
            width={ 220 }
            height={ 120 }
            rx={ 0 }
            style={styles}
        />
    )
}

function RectSocket(props: any) {
    let socketStyles = {
        fill: "rgb(103, 103, 106)"
    };

    return (
        <rect
            className="ad-block-socket"
            x={ props.x }
            y={ props.y }
            width={ 15 }
            height={ 15 }
            rx={ 0 }
            style={socketStyles}
        />
    )
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
    val: "0"
}

type VolatileTextState = typeof InitialVolatileTextState

class VolatileText extends React.Component<VolatileTextProps, VolatileTextState> {
    public readonly state = InitialVolatileTextState; 
    constructor(props: VolatileTextProps) {
        super(props);

        setInterval(() => {
            this.setState({ val: props.dataToDisplay().toFixed(1)} as VolatileTextState)
        }, 20)
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

function InspectorControls(props: any) {
    if (props.activeBlockIndex < 0 || props.activeBlockIndex >= props.blocks.length) {
        console.log("ERROR: invalid activeBlockIndex: " + props.activeBlockIndex);
        return;
    }

    const activeBlock: GridBlockContainer = props.blocks[props.activeBlockIndex]
    const step = props.grid.snap ? props.grid.size : 1

    let styles = {
        height: ((window.innerHeight - Config.CanvasHeight) + 'px'),
    };

    let params: JSX.Element[] = new Array();

    switch (activeBlock.type) {
        case Blocks.BlockType.Basic: {
        
        } break;

        case Blocks.BlockType.DisplayInput: {
            params.push(
                <Control
                    name="INPUT"
                    type="text"
                    value={ activeBlock.block.GetInputData(0) }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {} } />
            );
        } break;

        case Blocks.BlockType.MathAddition: {
            params.push(
                <div className="ad-Controls-container">
                <Control
                    name="INPUT 0"
                    type="text"
                    value={ activeBlock.block.GetInputData(0) }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        let value = e.currentTarget.value;
                        let numberValue = parseInt(value);
                        if (!isNaN(numberValue)) {
                            activeBlock.block.SetInputData(0, numberValue);
                            activeBlock.block.Update();
                        }
                    } } />
                <Control
                    name="INPUT 1"
                    type="text"
                    value={ activeBlock.block.GetInputData(1) }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        let value = e.currentTarget.value;
                        let numberValue = parseInt(value);
                        if (!isNaN(numberValue)) {
                            activeBlock.block.SetInputData(1, parseInt(value));
                            activeBlock.block.Update();
                        }
                    } } />
                    <Control
                    name="OUTPUT"
                    type="text"
                    value={ activeBlock.block.GetOutputData(0) }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {} } />
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

        case Blocks.BlockType.GenerateMesh: {
            let activeBlockCasted = activeBlock.block as Blocks.GenerateCubeMeshBlock;
            params.push(
                <div className="ad-Controls-container">
                <Control
                    name="Red"
                    type="text"
                    value={ props.color.red }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        props.color.red = e.currentTarget.value
                        let r = props.color.red;
                        let g = props.color.green;
                        let b = props.color.blue;
                        if (r < 0) {
                            r = 0;
                          }
                          if (r > 255) {
                            r = 255;
                          }
                          if (g < 0) {
                            g = 0;
                          }
                          if (g > 255) {
                            g = 255;
                          }
                          if (b < 0) {
                            b = 0;
                          }
                          if (b > 255) {
                            b = 255;
                          }
                          props.color.red = r;
                          activeBlockCasted.tint = new Float32Array([r/255.0, g/255.0, b/255.0]);
                    } } />
                <Control
                    name="Green"
                    type="text"
                    value={ props.color.green }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        props.color.green = e.currentTarget.value
                        let r = props.color.red;
                        let g = props.color.green;
                        let b = props.color.blue;
                        if (r < 0) {
                            r = 0;
                          }
                          if (r > 255) {
                            r = 255;
                          }
                          if (g < 0) {
                            g = 0;
                          }
                          if (g > 255) {
                            g = 255;
                          }
                          if (b < 0) {
                            b = 0;
                          }
                          if (b > 255) {
                            b = 255;
                          }
                          props.color.green = g;
                          activeBlockCasted.tint = new Float32Array([r/255.0, g/255.0, b/255.0]);
                    } } />
                <Control
                    name="Blue"
                    type="text"
                    value={ props.color.blue }
                    onChange={ (e: React.FormEvent<HTMLSelectElement>) => {
                        props.color.blue = e.currentTarget.value
                        let r = props.color.red;
                        let g = props.color.green;
                        let b = props.color.blue;
                        if (r < 0) {
                            r = 0;
                          }
                          if (r > 255) {
                            r = 255;
                          }
                          if (g < 0) {
                            g = 0;
                          }
                          if (g > 255) {
                            g = 255;
                          }
                          if (b < 0) {
                            b = 0;
                          }
                          if (b > 255) {
                            b = 255;
                          }
                          props.color.blue = b;
                          activeBlockCasted.tint = new Float32Array([r/255.0, g/255.0, b/255.0]);
                    } } />

                <div className="ad-Controls-container">
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
                    <Control
                    name="Y"
                    type="range"
                    min={ -4 }
                    max={ 4 }
                    step={ 0.1 }
                    value={ mat4.getTranslation(Utility.MakeVec3(0,0,0), activeBlockCasted.modelMatrix)[1] }
                    onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                        let currentTranslation = Utility.MakeVec3(0,0,0);
                        currentTranslation = mat4.getTranslation(currentTranslation, activeBlockCasted.modelMatrix)
                        let newMatrix = mat4.create();
                        newMatrix = mat4.translate(newMatrix, newMatrix, Utility.MakeVec3(currentTranslation[0], parseFloat(e.currentTarget.value), currentTranslation[2]));
                        activeBlockCasted.modelMatrix = newMatrix;
                        props.updateBlocks();
                    } } />
                    <Control
                    name="Z"
                    type="range"
                    min={ -4 }
                    max={ 4 }
                    step={ 0.1 }
                    value={ mat4.getTranslation(Utility.MakeVec3(0,0,0), activeBlockCasted.modelMatrix)[2] }
                    onChange={ (e: React.FormEvent<HTMLInputElement>) => {
                        let currentTranslation = Utility.MakeVec3(0,0,0);
                        currentTranslation = mat4.getTranslation(currentTranslation, activeBlockCasted.modelMatrix)
                        let newMatrix = mat4.create();
                        newMatrix = mat4.translate(newMatrix, newMatrix, Utility.MakeVec3(currentTranslation[0], currentTranslation[1], parseFloat(e.currentTarget.value)));
                        activeBlockCasted.modelMatrix = newMatrix;
                        props.updateBlocks();
                    } } />
            </div>
            </div>
            );
        }
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
            <div className="ad-Controls-container">
                <Control
                    type="button"
                    action="reset"
                    value="Reset path"
                    onClick={ (e: React.MouseEvent) => props.reset(e) } />
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
                    )*/}

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
            
            {(
                <div className="ad-Controls-container">
                    <Control
                        type="button"
                        action="delete"
                        value="Remove"
                        onClick={ (e: any) => props.removeActiveBlock(e) } />
                </div>
            )}
        </div>
    )
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