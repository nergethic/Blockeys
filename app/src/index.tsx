import './styles/main.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/App';
//import * as index from './index';
//index.default.x

ReactDOM.render (
<App color="Blue" />,
  document.getElementById("root")
)

window.onload = () => {
  generateHTML()
  initWebGL()

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

  // INIT SHADERS
  let simplestShader = initShaders("vertex", "fragment")
  let program = createProgram(simplestShader.vertex, simplestShader.fragment)
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
}

const AppState = {
}

let gl: WebGLRenderingContext = null

const Config: any = {
  CanvasWidth: 512,
  CanvasHeight: 512,
  CanvasID: 'glCanvas',
  MainContaierID: 'root'
}

function initWebGL() {
  let canvas: HTMLCanvasElement = document.getElementById(Config.CanvasID) as HTMLCanvasElement
  
  if (canvas == null) {
    // TODO: logger error
    alert("error, canvas is null!")
    return
  }

  gl = 
    canvas.getContext("webgl",              { antialias: true }) as WebGLRenderingContext ||
    canvas.getContext("experimental-webgl", { antialias: true }) as WebGLRenderingContext ||
    canvas.getContext("moz-webgl",          { antialias: true }) as WebGLRenderingContext ||
    canvas.getContext("webkit-3d",          { antialias: true }) as WebGLRenderingContext

    if (gl == null || gl == undefined) {
      // TODO: logger error
      alert("Unable to initialize WebGL. Your browser may not support it.")
      return
    }

    let extensions = gl.getSupportedExtensions()
    console.log(extensions) // TODO: turn on some of them

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

function buildShader(shaderSource: string, typeOfShader: number): WebGLShader {
  let shader = gl.createShader(typeOfShader)

  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader)) // TODO Logger
      return null
  }

  return shader
}

class SimpleShader {
  vertex: WebGLShader
  fragment: WebGLShader
}

function initShaders(vertexShaderName: string, fragmentShaderName: string): any {
  let vertexShaderSource, fragmentShaderSource
  vertexShaderSource = (document.getElementById(vertexShaderName) as HTMLScriptElement).text
  fragmentShaderSource = (document.getElementById(fragmentShaderName) as HTMLScriptElement).text

  let shaders = new SimpleShader()
  shaders.vertex = buildShader(vertexShaderSource, gl.VERTEX_SHADER)
  shaders.fragment = buildShader(fragmentShaderSource, gl.FRAGMENT_SHADER)

  return shaders
}

function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
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

  if (Config.Debug) {
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