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

function tick() {
  requestAnimationFrame(tick)
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

    AppState.gl = gl

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
    
    gl.clearColor(0, 0, 0, 1)
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