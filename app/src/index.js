"use strict";
exports.__esModule = true;
require("./styles/main.scss");
var React = require("react");
var ReactDOM = require("react-dom");
var App_1 = require("./components/App");
//import * as index from './index';
//index.default.x
ReactDOM.render(<App_1["default"] color="Blue"/>, document.getElementById("root"));
window.onload = function () {
    generateHTML();
    initWebGL();
    tick();
};
var Clock = /** @class */ (function () {
    function Clock() {
        this.running = false;
        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;
    }
    Clock.prototype.start = function () {
        this.startTime = (performance || Date).now();
        this.oldTime = this.startTime;
        this.elapsedTime = 0;
        this.running = true;
    };
    Clock.prototype.stop = function () {
        this.getElapsedTime();
        this.running = false;
    };
    Clock.prototype.getElapsedTime = function () {
        this.getDt();
        return this.elapsedTime;
    };
    Clock.prototype.getDt = function () {
        var diff = 0.0;
        if (!this.running) {
            this.start();
        }
        var now = (performance || Date).now();
        var dt = (now - this.oldTime) / 1000.0;
        this.oldTime = now;
        this.elapsedTime += dt;
        return dt;
    };
    return Clock;
}());
var time = 0.0;
var dt = 0.0;
var clock = new Clock();
function tick() {
    requestAnimationFrame(tick);
    dt = clock.getDt();
    time += dt;
    // INIT SHADERS
    var simplestShader = initShaders("vertex", "fragment");
    var program = createProgram(simplestShader.vertex, simplestShader.fragment);
    gl.useProgram(program);
    var vertexPosAttribLocation = gl.getAttribLocation(program, "a_VertexPos");
    if (vertexPosAttribLocation < 0) {
        alert("attrib not found!");
        return;
    }
    var colorPosAttribLocation = gl.getAttribLocation(program, "a_Color");
    if (colorPosAttribLocation < 0) {
        alert("attrib not found!");
        return;
    }
    var timeUniformPosition = gl.getUniformLocation(program, "iTime");
    var resolutionUniformPosition = gl.getUniformLocation(program, "iResolution");
    gl.uniform1f(timeUniformPosition, time);
    gl.uniform2fv(resolutionUniformPosition, [512.0, 512.0]);
    var buffer = gl.createBuffer();
    gl.enableVertexAttribArray(vertexPosAttribLocation);
    gl.enableVertexAttribArray(colorPosAttribLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.2, 0, 0,
        0, 1, 0.0,
        0.2, 0.0, 0.0
    ]), gl.STATIC_DRAW); // TODO array
    gl.vertexAttribPointer(vertexPosAttribLocation, // location
    3, // size (elements per vertex)
    gl.FLOAT, // type
    false, // normalize
    0, // stride, number of elements per vertex
    0 // offset
    );
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ]), gl.STATIC_DRAW); // TODO array
    gl.vertexAttribPointer(colorPosAttribLocation, // location
    4, // size (elements per vertex)
    gl.FLOAT, // type
    false, // normalize
    0, // stride, number of elements per vertex
    0 // offset
    );
    gl.clearColor(0.2, 0.4, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(vertexPosAttribLocation);
    gl.disableVertexAttribArray(colorPosAttribLocation);
}
var AppState = {};
var gl = null;
var Config = {
    CanvasWidth: 512,
    CanvasHeight: 512,
    CanvasID: 'glCanvas',
    MainContaierID: 'root'
};
function initWebGL() {
    var canvas = document.getElementById(Config.CanvasID);
    if (canvas == null) {
        // TODO: logger error
        alert("error, canvas is null!");
        return;
    }
    gl =
        canvas.getContext("webgl", { antialias: true }) ||
            canvas.getContext("experimental-webgl", { antialias: true }) ||
            canvas.getContext("moz-webgl", { antialias: true }) ||
            canvas.getContext("webkit-3d", { antialias: true });
    if (gl == null || gl == undefined) {
        // TODO: logger error
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }
    var extensions = gl.getSupportedExtensions();
    console.log(extensions); // TODO: turn on some of them
    gl.enable(gl.SCISSOR_TEST);
    gl.enable(gl.DEPTH_TEST);
    //gl.cullFace(gl.FRONT)
    //gl.enable(gl.CULL_FACE)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    //gl.disable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, Config.CanvasWidth, Config.CanvasHeight);
    gl.scissor(0, 0, Config.CanvasWidth, Config.CanvasHeight);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
function generateHTML() {
    var canvasElem = document.createElement("canvas");
    canvasElem.id = Config.CanvasID;
    canvasElem.width = Config.CanvasWidth;
    canvasElem.height = Config.CanvasHeight;
    canvasElem.style.border = "1px solid #007FFF";
    canvasElem.innerHTML = "Your browser doesn't appear to support the TODO add error alert" +
        "<code>&lt;canvas&gt;</code> element.";
    document.getElementById(Config.MainContaierID).appendChild(canvasElem);
}
function buildShader(shaderSource, typeOfShader) {
    var shader = gl.createShader(typeOfShader);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader)); // TODO Logger
        return null;
    }
    return shader;
}
var SimpleShader = /** @class */ (function () {
    function SimpleShader() {
    }
    return SimpleShader;
}());
function initShaders(vertexShaderName, fragmentShaderName) {
    var vertexShaderSource, fragmentShaderSource;
    vertexShaderSource = document.getElementById(vertexShaderName).text;
    fragmentShaderSource = document.getElementById(fragmentShaderName).text;
    var shaders = new SimpleShader();
    shaders.vertex = buildShader(vertexShaderSource, gl.VERTEX_SHADER);
    shaders.fragment = buildShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    return shaders;
}
function createProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        // TODO LOGGER
        console.log("LINKING ERROR!");
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    if (Config.Debug) {
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            // TODO LOGGER
            console.log("VALIDATION ERROR!");
            gl.deleteProgram(program);
            return null;
        }
    }
    return program;
}
