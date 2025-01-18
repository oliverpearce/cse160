// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
 
// set up canvas and gl variables
function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

// set up GLSL shader programs and connect GLSL variables
function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

// constants
POINT = 0;
TRIANGLE = 1;
CIRCLE = 2;

// globals related to UI
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 8;

// set up actions for HTML UI elements
function addActionsForHtmlUI(){
    // button events
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; }
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; }
    document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes(); }

    document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; }
    document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; }
    document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; }

    // color slider events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

    // size slider
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

    // segment slider
    document.getElementById('segmentSlide').onclick = function() { g_selectedSegments = this.value; }
}

function main() {
    // set up canvas and gl variables
    setupWebGL();

    // set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // set up actions for HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {

    // extract the event click and return it in webgl coords
    let [x,y] = convertCoordinatesEventToGL(ev);

    let point;
    if (g_selectedType == POINT){
        point = new Point();
    }
    else if (g_selectedType == TRIANGLE){
        point = new Triangle();
    }
    else if (g_selectedType == CIRCLE){
        point = new Circle();
    }

    point.position = [x,y]; 
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);

    renderAllShapes();
}

// Extract the event click and return it
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

// Draw every shape that is supposed to be on the canvas
function renderAllShapes(){
    // check time at start of draw
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_points.length;
    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    sendTextToHtml("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHtml(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if (!htmlElem){
        console.log("Failed to get " + htmlElem + " from HTML");
        return;
    }
    htmlElem.innerHTML = text;
}
