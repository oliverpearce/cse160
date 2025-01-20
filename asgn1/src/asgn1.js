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
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, alpha: true });
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
let stopAnimating = false;

// set up actions for HTML UI elements
function addActionsForHtmlUI(){
    // button events
    document.getElementById('red').onclick = function() { 
        g_selectedColor = [1.0,0.0,0.0,1.0]; 
        document.getElementById('redSlide').value = 100; 
        document.getElementById('redValue').textContent = 100;
        document.getElementById('greenSlide').value = 0; 
        document.getElementById('greenValue').textContent = 0;  
        document.getElementById('blueSlide').value = 0;   
        document.getElementById('blueValue').textContent = 0; 
        document.getElementById('alphaSlide').value = 100;   
        document.getElementById('alphaValue').textContent = 100; 
    }
    document.getElementById('green').onclick = function() { 
        g_selectedColor = [0.0,1.0,0.0,1.0];
        document.getElementById('redSlide').value = 0; 
        document.getElementById('redValue').textContent = 0;
        document.getElementById('greenSlide').value = 100; 
        document.getElementById('greenValue').textContent = 100;  
        document.getElementById('blueSlide').value = 0;   
        document.getElementById('blueValue').textContent = 0; 
        document.getElementById('alphaSlide').value = 100;   
        document.getElementById('alphaValue').textContent = 100; 
    }
    document.getElementById('blue').onclick = function() { 
        g_selectedColor = [0.0,0.0,1.0,1.0]; 
        document.getElementById('redSlide').value = 0; 
        document.getElementById('redValue').textContent = 0;
        document.getElementById('greenSlide').value = 0; 
        document.getElementById('greenValue').textContent = 0;  
        document.getElementById('blueSlide').value = 100;   
        document.getElementById('blueValue').textContent = 100; 
        document.getElementById('alphaSlide').value = 100;   
        document.getElementById('alphaValue').textContent = 100;
    }
    document.getElementById('clear').onclick = function() { g_shapesList = []; renderAllShapes(); stopAnimating=true; }

    document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; }
    document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; }
    document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; }

    document.getElementById('umbrella').onclick = function() { umbrella(); }
    document.getElementById('raindrop').onclick = function() { raindrop(); }
    document.getElementById('animate').onclick = function() { stopAnimating=false; animate(); }
    document.getElementById('stopAnimate').onclick = function() { stopAnimating=true; }

    // color slider events
    // https://www.geeksforgeeks.org/how-to-change-the-color-of-html-element-in-javascript/#
    document.getElementById('redValue').style.color = "red"; 
    document.getElementById('redSlide').addEventListener('mouseup', function() { 
        g_selectedColor[0] = this.value/100; 
        document.getElementById('redValue').textContent = this.value;  
    });
    document.getElementById('greenValue').style.color = "green"; 
    document.getElementById('greenSlide').addEventListener('mouseup', function() { 
        g_selectedColor[1] = this.value/100; 
        document.getElementById('greenValue').textContent = this.value;  
    });
    document.getElementById('blueValue').style.color = "blue"; 
    document.getElementById('blueSlide').addEventListener('mouseup', function() { 
        g_selectedColor[2] = this.value/100; 
        document.getElementById('blueValue').textContent = this.value;  
    });

    // alpha slider
    document.getElementById('alphaSlide').addEventListener('mouseup', function() { 
        g_selectedColor[3] = this.value/100 
        document.getElementById('alphaValue').textContent = this.value; 
    });

    // size slider
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { 
        g_selectedSize = this.value; 
        document.getElementById('sizeValue').textContent = this.value; 
    });

    // segment slider
    document.getElementById('segmentSlide').onclick = function() { 
        g_selectedSegments = this.value; 
        document.getElementById('segmentValue').textContent = this.value; 
    };
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
    // console.log(point.color);
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

var triList = [];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// helper func for raindrop
function getRandomCoords() {
    // bottom left, -0.8, -0.8 
    // top left, -0.8, 0.5
    // bottom right, 0.5, -0.8
    // top right, 0.5, 0.5

    // -0.8 to 0.5
    // 0 to 1.3

    // x-axis
    xpos = Math.random() * 1.3 - 0.8;

    // y-axis
    ypos = Math.random() * 1.3 - 0.8;

    return [xpos, ypos];

  }

// draw a raindrop at random pos on canvas!
function raindrop() {
    let base = getRandomCoords();
    let currAlpha = 1.0;

    // Loop through the position list and create triangles
    for (let i = 0; i < 6; i++) {
        let triangle = new Triangle();
        let newPos = [base[0] + 0.1 * i, base[1] + 0.1 * i];
        triangle.position = newPos;
        triangle.color = [0.0, 0.0, 1.0, currAlpha]; 
        triangle.size = 15;
        currAlpha -= 0.07;

        // Add the triangle to the shapes list
        g_shapesList.push(triangle);
        triList.push(triangle);
    }

    // Render all shapes
    renderAllShapes();
}

// animate the rain!
function animate() {
    if (stopAnimating){
        return;
    } 

    let g_alphaIncrement = 0.07;  // Increment value for changing alpha

    // 1 - 0.63 = 0.37

    // Loop through each shape and update its alpha value
    for (let i = 0; i < triList.length; i++) {
        let triangle = triList[i];
        triangle.color[3] -= g_alphaIncrement;

        // if color is too low alpha, reset it!
        if (triangle.color[3] <= 0.37) {
            triangle.color[3] = 1.0;
        }
    }

    // Re-render all shapes
    renderAllShapes();

    // stall the animation! (https://www.w3schools.com/js/js_timing.asp)
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 100);
}

function umbrella() {
    // 9x9 grid for easily drawing pixel art
    let pixels = [
        [' ', ' ', ' ', 'x', 'x', 'x', ' ', ' ', ' '],
        [' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', ' '],
        [' ', 'x', 'x', 'x', 'x', 'x', 'x', 'x', ' '],
        ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
        ['x', ' ', 'x', ' ', 'x', ' ', 'x', ' ', 'x'],
        [' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' '],
        [' ', ' ', 'x', ' ', 'x', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    ];
    
    // loop through pixels to make pixel art
    for (let row = 0; row < pixels.length; row++) {
        for (let col = 0; col < pixels[row].length; col++) {
            if (pixels[row][col] === 'x') {
                let xPos = -0.8 + col * 0.1; 
                let yPos = 0 - row * 0.1; // y coords are strange

                let point = new Triangle();
                point.position = [xPos, yPos];
                point.color = [0.5, 0.0, 0.7, 1.0];
                point.size = 15; 
                g_shapesList.push(point); 
            }
        }
    }

    renderAllShapes();
}

