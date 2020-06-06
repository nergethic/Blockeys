import './styles/main.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/App';

import {Config} from './config';
import {AppState} from './appState';
import {Geometry} from './renderer/geometry';
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

function tick() {
  requestAnimationFrame(tick)

  dt = clock.getDt()
  time += dt;

  let geometry = new Geometry.BufferGeometry();
  let vertices = new Float32Array([
    -0.2, 0, 0,
    0, 1, 0.0,
    0.2, 0.0, 0.0]);
  geometry.SetVertices(vertices);

  let colorData = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0]);
  let colorAttribBuffer = new Geometry.BufferAttribute(colorData, 4);
  geometry.SetAttribute('a_Color', colorAttribBuffer);

  let material = new Geometry.MeshColorMaterial(new Geometry.BufferUniform());
  let mesh = new Geometry.Mesh( geometry, material );

  gl.clearColor(0.2, 0.4, 0.1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  
  mesh.BindAttributes();
  mesh.Draw();

  let geometry2 = new Geometry.BufferGeometry();
  let vertices2 = new Float32Array([
    -0.5, 0, 0,
    -0.3, 1, 0.0,
    -0.1, 0.0, 0.0]);
  geometry2.SetVertices(vertices2);
  let mesh2 = new Geometry.Mesh( geometry2, material );
  mesh2.BindAttributes();
  mesh2.Draw();

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
  let canvas: HTMLCanvasElement = document.getElementById(Config.CanvasID) as HTMLCanvasElement
  
  if (canvas == null) {
    // TODO: logger error
    alert("error, canvas is null!")
    return
  }

  AppState.gl = 
    canvas.getContext("webgl",              { antialias: true }) as WebGL2RenderingContext ||
    canvas.getContext("experimental-webgl", { antialias: true }) as WebGL2RenderingContext ||
    canvas.getContext("moz-webgl",          { antialias: true }) as WebGL2RenderingContext ||
    canvas.getContext("webkit-3d",          { antialias: true }) as WebGL2RenderingContext

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
    //gl.cullFace(gl.FRONT)
    //gl.enable(gl.CULL_FACE)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND)
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
  let canvasElem: HTMLCanvasElement = document.createElement<"canvas">("canvas")
  canvasElem.id     = Config.CanvasID
  canvasElem.width  = Config.CanvasWidth
  canvasElem.height = Config.CanvasHeight
  canvasElem.style.border = "1px solid #007FFF"
  canvasElem.innerHTML = "Your browser doesn't appear to support the TODO add error alert" +
                      "<code>&lt;canvas&gt;</code> element."

  document.getElementById(Config.MainContaierID).appendChild(canvasElem)
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

// glm::mat4 myModelMatrix = myTranslationMatrix * myRotationMatrix * myScaleMatrix;