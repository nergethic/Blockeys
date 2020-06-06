import './styles/main.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/App';

import {Config} from './config';
import {AppState} from './appState';
import {Geometry} from './renderer/geometry';
import * as glm from 'gl-matrix';
//import * as index from './index';
//index.default.x

ReactDOM.render (
<App color="Blue" />,
  document.getElementById("root")
)

let gl: WebGL2RenderingContext;

window.onload = () => {
  generateHTML()
  gl = initWebGL()

  Geometry.InitializeModule(gl)

  tick()
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

let time = 0.0
let dt = 0.0
let clock = new Clock()

function MakeVec3(x: number, y: number, z: number) {
  let v = glm.vec3.create();
  glm.vec3.set(v, x, y, z);
  return v;
}

function tick() {
  requestAnimationFrame(tick)

  dt = clock.getDt()
  time += dt;

  // ---------- create a camera matrix
  let view = glm.mat4.create();
  let cameraPosition = MakeVec3(0, 0, 10);
  glm.mat4.lookAt(view, cameraPosition, MakeVec3(0, 0, 0), MakeVec3(0, 1, 0))

  // ---------- create a projection matrix
  let projection = glm.mat4.create();
  glm.mat4.perspective(projection, 0.5, Config.CanvasWidth / Config.CanvasHeight, 0.05, 1000)

  let model = glm.mat4.create();

  let geometry = new Geometry.BufferGeometry();
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

    geometry.SetVertices(vertices);
    geometry.SetIndices(indexData);
    let normalAttribBuffer = new Geometry.BufferAttribute(normalData, 3);
  let colorAttribBuffer = new Geometry.BufferAttribute(colorData, 4);
  
  geometry.SetAttribute('a_Color', colorAttribBuffer);
  geometry.SetAttribute('a_Normal', normalAttribBuffer);

  let resolution = new Float32Array(2);
  resolution[0] = Config.CanvasWidth;
  resolution[1] = Config.CanvasHeight;

  let lightPositionUniform = new Geometry.Uniform<glm.vec3>("iLightPosition", Geometry.UniformType.Vector3, MakeVec3(0.0, Math.sin(time), 0.0));
  let cameraPositionUniform = new Geometry.Uniform<glm.vec3>("iViewPosition", Geometry.UniformType.Vector3, cameraPosition);

  let modelUniform = new Geometry.Uniform<glm.mat4>("iModel", Geometry.UniformType.Matrix4, model);
  let viewUniform = new Geometry.Uniform<glm.mat4>("iView", Geometry.UniformType.Matrix4, view);
  let projectionUniform = new Geometry.Uniform<glm.mat4>("iProjection", Geometry.UniformType.Matrix4, projection);

  let timeUniform = new Geometry.Uniform<number>("iTime", Geometry.UniformType.Float, time);
  let resolutionUniform = new Geometry.Uniform<Float32Array>("iResolution", Geometry.UniformType.Vector2, resolution);
  let tintColorUniform = new Geometry.Uniform<Float32Array>("iTintColor", Geometry.UniformType.Vector3, new Float32Array([0.0, 1.0, 1.0]))

  let material = new Geometry.Material("vertex-normal", "fragment-normal", new Geometry.BufferUniform([
    modelUniform, viewUniform, projectionUniform,
    timeUniform, resolutionUniform, tintColorUniform,
    lightPositionUniform, cameraPositionUniform]));
  let mesh = new Geometry.Mesh( geometry, material );

  material.SetUniform("iTintColor", new Float32Array([0.2, 0.5, 0.0]))

  let scaled = glm.mat4.scale(model, model, MakeVec3(0.5, 0.5, 0.5))
  //let rotated = glm.mat4.rotateY(scaled, scaled, time)
  //let translated = glm.mat4.translate(scaled, scaled, MakeVec3(Math.cos(time), 0, 0))
  material.SetUniform("iModel", scaled)

  gl.clearColor(0.1, 0.3, 0.5, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  material.SetUniform("iLightPosition", MakeVec3(Math.sin(time), 0, 3));
  
  mesh.BindAttributes();
  mesh.DrawIndexed();

  let material2 = new Geometry.Material("vertex-normal", "fragment-normal", new Geometry.BufferUniform([
    modelUniform, viewUniform, projectionUniform,
    timeUniform, resolutionUniform, tintColorUniform,
    lightPositionUniform, cameraPositionUniform]));
  let mesh2 = new Geometry.Mesh( geometry, material2 );

  let translated = glm.mat4.translate(scaled, scaled, MakeVec3(3.0 + Math.cos(time), 0, 0))
  material2.SetUniform("iModel", translated)
  material2.SetUniform("iTintColor", new Float32Array([0.3, 0.2, 0.8]))

  mesh2.BindAttributes();
  mesh2.DrawIndexed();

  // INIT SHADERS
  /*
  let simplestShader = Geometry.Material.InitShaders("vertex-color", "fragment-fbm")
  let program = Geometry.Material.CreateProgram(simplestShader.vertex, simplestShader.fragment)
  gl.useProgram(program)
  let vertexPosAttribLocation = gl.getAttribLocation(program, "a_VertexPos")
  if (vertexPosAttribLocation < 0) {
    alert("attrib not found!")
    return
  }

  let colorPosAttribLocation = gl.getAttribLocation(program, "a_Color")
  if (colorPosAttribLocation < 0) {
    alert("attrib not found!")
    return
  }

  let timeUniformPosition = gl.getUniformLocation(program, "iTime");
  let resolutionUniformPosition = gl.getUniformLocation(program, "iResolution");

  gl.uniform1f(timeUniformPosition, time)
  gl.uniform2fv(resolutionUniformPosition, [512.0, 512.0]);
  
  let buffer = gl.createBuffer()
  gl.enableVertexAttribArray(vertexPosAttribLocation)
  gl.enableVertexAttribArray(colorPosAttribLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.2, 0, 0,
    0, 1, 0.0,
    0.2, 0.0, 0.0]), gl.STATIC_DRAW) // TODO array

    gl.vertexAttribPointer(
      vertexPosAttribLocation,          // location
      3, // size (elements per vertex)
      gl.FLOAT,                         // type
      false,                            // normalize
      0,                                // stride, number of elements per vertex
      0                                 // offset
    )

    let colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0]), gl.STATIC_DRAW) // TODO array

  gl.vertexAttribPointer(
    colorPosAttribLocation,          // location
    4, // size (elements per vertex)
    gl.FLOAT,                         // type
    false,                            // normalize
    0,                                // stride, number of elements per vertex
    0                                // offset
)

  gl.clearColor(0.2, 0.4, 0.1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.drawArrays(gl.TRIANGLES, 0, 3)

  gl.disableVertexAttribArray(vertexPosAttribLocation)
  gl.disableVertexAttribArray(colorPosAttribLocation)
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
  // webGL render canvas
  let renderCanvasElem: HTMLCanvasElement = document.createElement<"canvas">("canvas")
  renderCanvasElem.id     = Config.RenderCanvasID
  renderCanvasElem.width  = Config.CanvasWidth
  renderCanvasElem.height = Config.CanvasHeight
  renderCanvasElem.style.border = "1px solid #007FFF"
  renderCanvasElem.innerHTML = "Your browser doesn't appear to support the TODO add error alert" +
                      "<code>&lt;canvas&gt;</code> element."

  document.getElementById(Config.MainContaierID).appendChild(renderCanvasElem)

  // blocks canvas
  let blocksCanvasElem: HTMLCanvasElement = document.createElement<"canvas">("canvas")
  blocksCanvasElem.id     = Config.BlocksCanvasID
  blocksCanvasElem.width  = Config.CanvasWidth
  blocksCanvasElem.height = Config.CanvasHeight
  blocksCanvasElem.style.border = "1px solid #007FFF"
  blocksCanvasElem.innerHTML = "Your browser doesn't appear to support the TODO add error alert" +
                      "<code>&lt;canvas&gt;</code> element."

  document.getElementById(Config.MainContaierID).appendChild(blocksCanvasElem)

  let ctx = blocksCanvasElem.getContext("2d");
  ctx.strokeStyle = "#333355";
  let grid = 30;
  
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      let yOffset = y*Config.CanvasHeight / grid;
      ctx.beginPath();
      ctx.moveTo(0, yOffset);
      ctx.lineTo(Config.CanvasWidth, yOffset);
      ctx.stroke();

      let xOffset = y*Config.CanvasWidth / grid;
      ctx.beginPath();
      ctx.moveTo(xOffset, 0);
      ctx.lineTo(xOffset, Config.CanvasHeight);
      ctx.stroke();
    }
  }
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