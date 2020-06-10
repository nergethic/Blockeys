import './styles/main.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/App';

import {Config} from './config';
import {AppState} from './appState';
import {Geometry} from './renderer/geometry';
import * as glm from 'gl-matrix';

import {Blocks} from './blocks'

import * as Utility from './utility'
import * as BlockGrid from './components/BlockGrid'
//import * as index from './index';
//index.default.x

let gl: WebGL2RenderingContext;
let modelMatrix: glm.mat4;
let geometry: Geometry.BufferGeometry;
let material: Geometry.Material;
let mesh: Geometry.Mesh;

let meshBlock: Blocks.GenerateCubeMeshBlock;
let meshRenderingBlock: Blocks.MeshRenderingBlock;

let updateC: (r: number, g: number, b: number) => void;
export function UpdateColor(r: number, g: number, b: number) {
  updateC(r, g, b);
}

let blocksToUpdate: Blocks.BasicBlock[];

export function CreateBlock(type: Blocks.BlockType, updateInTick: boolean): Blocks.BasicBlock {
  let newBlock: Blocks.BasicBlock;
  switch (type) {
    case Blocks.BlockType.DisplayInput: {
        newBlock = new Blocks.DisplayInputBlock()
    } break;

    case Blocks.BlockType.GenerateMesh: {
      newBlock = new Blocks.GenerateCubeMeshBlock()
    } break;

    case Blocks.BlockType.MathAddition: {
      newBlock = new Blocks.MathAdditionBlock()
    } break;

    case Blocks.BlockType.MathSin: {
      newBlock = new Blocks.MathSinBlock()
    } break;

    case Blocks.BlockType.MathSubstraction: {
      //newBlock = new Blocks.math()
    } break;

    case Blocks.BlockType.Time: {
      newBlock = new Blocks.TimeBlock()
    } break;
  }
  
  if (updateInTick) {
    blocksToUpdate.push(newBlock)
  }

  return newBlock;
}

window.onload = () => {
  ReactDOM.render (
    <App color="Blue" />,
      document.getElementById("root")
    )

  blocksToUpdate = new Array();

  generateHTML()
  gl = initWebGL()
  Geometry.InitializeModule(gl)
  InitAppState()

  BlockGrid.GenerateSomeBlocks();

  // mesh setup
  let vertices = new Float32Array([
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

  let indexData = new Uint16Array([
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23   // left
  ])

  let normalData = new Float32Array([
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
  ])

  let colorData = new Float32Array([ // 12
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
/*
    geometry = new Geometry.BufferGeometry();
    geometry.SetVertices(vertices);
    geometry.SetIndices(indexData);
    let normalAttribBuffer = new Geometry.BufferAttribute(normalData, 3);
    let colorAttribBuffer = new Geometry.BufferAttribute(colorData, 4);
  
    geometry.SetAttribute('a_Color', colorAttribBuffer);
    geometry.SetAttribute('a_Normal', normalAttribBuffer);

    modelMatrix = glm.mat4.create();
    let modelUniform = new Geometry.Uniform<glm.mat4>("iModel", Geometry.UniformType.Matrix4, modelMatrix);
    let tintColorUniform = new Geometry.Uniform<Float32Array>("iTintColor", Geometry.UniformType.Vector3, new Float32Array([0.0, 1.0, 1.0]))

    material = new Geometry.Material("vertex-normal", "fragment-normal", new Geometry.BufferUniform([
      modelUniform, tintColorUniform,
      AppState.viewUniform, AppState.projectionUniform,
      AppState.timeUniform, AppState.resolutionUniform,
      AppState.lightPositionUniform, AppState.cameraPositionUniform]));

    mesh = new Geometry.Mesh( geometry, material );

    meshBlock = new Blocks.GenerateCubeMeshBlock();
    meshRenderingBlock = new Blocks.MeshRenderingBlock();
    meshBlock.ConnectSocket(meshBlock.outputs.sockets[0], meshRenderingBlock.inputs.sockets[0]);
*/
    updateC = (r, g, b) => {
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
      meshBlock.tint = new Float32Array([r/255.0, g/255.0, b/255.0]);
    };

  tick()
}

function InitAppState() {
  AppState.time = 0.0;

  // ---------- create a camera matrix
  AppState.viewMatrix = glm.mat4.create();
  AppState.cameraPosition = Utility.MakeVec3(0, 0, 10);
  glm.mat4.lookAt(AppState.viewMatrix, AppState.cameraPosition, Utility.MakeVec3(0, 0, 0), Utility.MakeVec3(0, 1, 0))

  // ---------- create a projection matrix
  AppState.projectionMatrix = glm.mat4.create();
  glm.mat4.perspective(AppState.projectionMatrix, 0.5, Config.CanvasWidth / Config.CanvasHeight, 0.05, 1000)

  let resolution = new Float32Array(2);
  resolution[0] = Config.CanvasWidth;
  resolution[1] = Config.CanvasHeight;
  AppState.resolution = resolution;

  AppState.lightPosition = Utility.MakeVec3(0, 0.6, 2.5);

  AppState.lightPositionUniform = new Geometry.Uniform<glm.vec3>("iLightPosition", Geometry.UniformType.Vector3, Utility.MakeVec3(0.0, 0.0, 0.0));
  AppState.cameraPositionUniform = new Geometry.Uniform<glm.vec3>("iViewPosition", Geometry.UniformType.Vector3, AppState.cameraPosition);
  AppState.viewUniform = new Geometry.Uniform<glm.mat4>("iView", Geometry.UniformType.Matrix4, AppState.viewMatrix);
  AppState.projectionUniform = new Geometry.Uniform<glm.mat4>("iProjection", Geometry.UniformType.Matrix4, AppState.projectionMatrix);

  AppState.timeUniform = new Geometry.Uniform<number>("iTime", Geometry.UniformType.Float, AppState.time);
  AppState.resolutionUniform = new Geometry.Uniform<Float32Array>("iResolution", Geometry.UniformType.Vector2, resolution);
}

class Clock {
	running: boolean = false;
	startTime: number = 0;
  oldTime: number = 0;
	elapsedTime: number = 0;

  start() {
      this.startTime = (performance || Date).now()

      this.oldTime = this.startTime
      this.elapsedTime = 0
      this.running = true
	}

	stop() {
		this.getElapsedTime()
		this.running = false
	}

	getElapsedTime(): number {
		this.getDt()
		return this.elapsedTime
	}

	getDt(): number {
		let diff = 0.0

		if (!this.running) {
			this.start()
		}

        let now = (performance || Date).now()

        let dt = (now - this.oldTime) / 1000.0
        this.oldTime = now

        this.elapsedTime += dt

		return dt
	}
}

let dt = 0.0
let clock = new Clock()

function tick() {
  requestAnimationFrame(tick);

  dt = clock.getDt();
  AppState.time += dt;

  gl.clearColor(0.1, 0.3, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  blocksToUpdate.forEach(block => {
    block.Update();
  });

  //meshBlock.modelMatrix = glm.mat4.rotateY(meshBlock.modelMatrix, meshBlock.modelMatrix, dt*1.0)

  //meshBlock.SetInputData(0, true);
  //meshBlock.Update();

  // Blocks.BlockTest();

  //let scaled = glm.mat4.scale(modelMatrix, modelMatrix, MakeVec3(0.5, 0.5, 0.5))

  //let rotated = glm.mat4.rotateY(scaled, scaled, AppState.time)
  //let translated = glm.mat4.translate(scaled, scaled, MakeVec3(Math.cos(AppState.time), 0, 0))

  /*
  material.SetUniform("iModel", modelMatrix);
  material.SetUniform("iTintColor", new Float32Array([0.2, 0.5, 0.0]));

  material.SetUniform("iLightPosition", MakeVec3(Math.sin(AppState.time), 0, 3));
  material.SetUniform("iViewPosition", AppState.cameraPosition);
  material.SetUniform("iView", AppState.viewMatrix);
  material.SetUniform("iProjection", AppState.projectionMatrix);
  material.SetUniform("iTime", AppState.time);
  material.SetUniform("iResolution", AppState.resolution);

  gl.clearColor(0.1, 0.3, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mesh.BindAttributes();
  mesh.DrawIndexed();
  */

  /*
  let material2 = new Geometry.Material("vertex-normal", "fragment-normal", new Geometry.BufferUniform([
    modelUniform, AppState.viewUniform, AppState.projectionUniform,
    AppState.timeUniform, AppState.resolutionUniform, tintColorUniform,
    AppState.lightPositionUniform, AppState.cameraPositionUniform]));
  let mesh2 = new Geometry.Mesh( geometry, material2 );

  let translated = glm.mat4.translate(scaled, scaled, MakeVec3(3.0 + Math.cos(AppState.time), 0, 0))
  material2.SetUniform("iModel", translated)
  material2.SetUniform("iTintColor", new Float32Array([0.3, 0.2, 0.8]))

  mesh2.BindAttributes();
  mesh2.DrawIndexed();
  */
}

function initWebGL(): WebGL2RenderingContext {
  let renderCanvas: HTMLCanvasElement = document.getElementById(Config.RenderCanvasID) as HTMLCanvasElement
  
  if (renderCanvas == null) {
    // TODO: logger error
    alert("error, canvas is null!")
    return
  }

  AppState.gl = 
    renderCanvas.getContext("webgl",              { antialias: true }) as WebGL2RenderingContext ||
    renderCanvas.getContext("experimental-webgl", { antialias: true }) as WebGL2RenderingContext ||
    renderCanvas.getContext("moz-webgl",          { antialias: true }) as WebGL2RenderingContext ||
    renderCanvas.getContext("webkit-3d",          { antialias: true }) as WebGL2RenderingContext

    if (AppState.gl == null || AppState.gl == undefined) {
      // TODO: logger error
      alert("Unable to initialize WebGL. Your browser may not support it.")
      return
    }

    let extensions = AppState.gl.getSupportedExtensions()
    console.log(extensions) // TODO: turn on some of them

    let gl = AppState.gl;

    gl.enable(gl.SCISSOR_TEST)
    gl.enable(gl.DEPTH_TEST)
    //gl.enable(gl.CULL_FACE)
    //gl.cullFace(gl.BACK)

    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.enable(gl.BLEND)
    
    //gl.disable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW)
    gl.depthFunc(gl.LEQUAL)

    gl.viewport(0, 0, Config.CanvasWidth, Config.CanvasHeight)
    gl.scissor(0, 0, Config.CanvasWidth, Config.CanvasHeight)
    
    gl.clearColor(1, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    return gl
}

function generateHTML() {
  let renderCanvasElem: HTMLCanvasElement = document.createElement<"canvas">("canvas")
  renderCanvasElem.id     = Config.RenderCanvasID
  renderCanvasElem.width  = Config.CanvasWidth
  renderCanvasElem.height = Config.CanvasHeight
  renderCanvasElem.innerHTML = "Your browser doesn't appear to support the TODO add error alert" +
                      "<code>&lt;canvas&gt;</code> element."

  document.getElementById(Config.CanvasContainerID).appendChild(renderCanvasElem)
}

/*
function createTexture() {
  var texture = gl.createTexture();
 
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
*/