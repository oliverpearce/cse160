// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
        gl_FragColor = u_FragColor;                 // the color
    } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);        // use UV debug color
    } else if (u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV); // the texture0
    } else {
        gl_FragColor = vec4(1, 0.2, 0.2, 1);        // error, put redish 
    }
    
    
    
  }`

// Globals
let canvas, gl, a_Position, a_UV, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix, u_Sampler0;
// let u_Size;
let vertexBuffer, vertexArray;

// set up canvas and gl variables
function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // enable depth
    gl.enable(gl.DEPTH_TEST);
    // vertex stuff
    vertexBuffer = gl.createBuffer();
    vertexArray = [];
}

// set up GLSL shader programs and connect GLSL variables
function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_Position
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_ViewMatrix
    // u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    // if (!u_ViewMatrix) {
    //     console.log('Failed to get the storage location of u_ViewMatrix');
    //     return;
    // }

    // Get the storage location of u_ProjectionMatrix
    // u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    // if (!u_ProjectionMatrix) {
    //     console.log('Failed to get the storage location of u_ProjectionMatrix');
    //     return;
    // }

    // Get the storage location of u_Sampler
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// constants
POINT = 0;
TRIANGLE = 1;
CIRCLE = 2;

// globals related to UI
let g_animate = false;
let g_headAngle = 0;
let g_botSnoutAngle = 0;
let g_legAngle1 = 0;
let g_legAngle2 = 0;
let g_tail1Angle = 0;
let g_tail2Angle = 0;
let g_tail3Angle = 0;
// camera
let g_horizAngle = 0;
let g_vertAngle = 0;
let drag = false;
let poke = false;
let nodded = false;
let nod_start = null;
let xpos, ypos;
// colors
let gray = [0.6, 0.6, 0.6, 1.0];
let darkGray = [0.5*0.9, 0.5*0.9, 0.5*0.9, 1.0]; 
let midGray = [0.6*0.9, 0.6*0.9, 0.6*0.9, 1.0];
let white = [1.0,1.0,1.0,1.0];
let red = [1.0, 0.0, 0.0, 1.0];

// set up actions for HTML UI elements
function addActionsForHtmlUI(){
    // have to click on canvas
    const canvas = document.getElementById('webgl');

    // on down click, start tracking movement
    canvas.onmousedown = function (ev) {
        drag = true;
        xpos = ev.clientX;
        ypos = ev.clientY;

        if (ev.shiftKey) {
            poke = true;
            nodded = false;
        }
    };

    // dragging camera around
    canvas.onmousemove = function (ev) {
        if (!drag) return;

        let dx = ev.clientX - xpos;
        let dy = ev.clientY - ypos;

        // rotate the camera, 0.5 is sensitivity
        g_horizAngle += dx * 0.5;
        g_vertAngle += dy * 0.5;
        xpos = ev.clientX;
        ypos = ev.clientY;

        // update sliders
        document.getElementById('horizAngleSlide').value = g_horizAngle;
        document.getElementById('vertAngleSlide').value = g_vertAngle;
        document.getElementById('horizAngleValue').textContent = g_horizAngle;
        document.getElementById('vertAngleValue').textContent = g_vertAngle;

        renderScene();
    };

    canvas.onmouseup = function () {
        drag = false;
    };

    canvas.onmouseleave = function () {
        drag = false; // Stop dragging when mouse leaves canvas
    };

    // button events
    document.getElementById('reset').onclick = function() { 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

        g_headAngle = 0;
        document.getElementById('headValue').textContent = 0;
        document.getElementById('headSlide').value = 0;

        g_botSnoutAngle = 0;
        g_legAngle1 = 0;
        g_legAngle2 = 0;
        g_tail1Angle = 0;
        document.getElementById('tail1Value').textContent = 0;
        document.getElementById('tail1Slide').value = 0;
        g_tail2Angle = 0;
        document.getElementById('tail2Value').textContent = 0;
        document.getElementById('tail2Slide').value = 0;
        g_tail3Angle = 0;
        document.getElementById('tail3Value').textContent = 0;
        document.getElementById('tail3Slide').value = 0;

        g_horizAngle = 5;
        g_vertAngle = 5;
        document.getElementById('horizAngleValue').textContent = 5;
        document.getElementById('horizAngleSlide').value = 5
        document.getElementById('vertAngleValue').textContent = 5;
        document.getElementById('vertAngleSlide').value = 5;
        renderScene();
    }
    
    document.getElementById('animationYellowOff').onclick = function() { g_animate = false; }
    document.getElementById('animationYellowOn').onclick = function() { g_animate = true; }

    // camera slider
    document.getElementById('horizAngleSlide').addEventListener('mousemove', function() {
        g_horizAngle = this.value; 
        document.getElementById('horizAngleValue').textContent = this.value;
        renderScene(); 
    });

    document.getElementById('vertAngleSlide').addEventListener('mousemove', function() {
        g_vertAngle = this.value; 
        document.getElementById('vertAngleValue').textContent = this.value;
        renderScene(); 
    });

    // head slider
    document.getElementById('headSlide').addEventListener('mousemove', function() {
        g_headAngle = this.value; 
        document.getElementById('headValue').textContent = this.value;
        renderScene(); 
    });

    // tail
    document.getElementById('tail1Slide').addEventListener('mousemove', function() {
        g_tail1Angle = this.value; 
        document.getElementById('tail1Value').textContent = this.value;
        renderScene(); 
    });

    document.getElementById('tail2Slide').addEventListener('mousemove', function() {
        g_tail2Angle = this.value; 
        document.getElementById('tail2Value').textContent = this.value;
        renderScene(); 
    });

    document.getElementById('tail3Slide').addEventListener('mousemove', function() {
        g_tail3Angle = this.value; 
        document.getElementById('tail3Value').textContent = this.value;
        renderScene(); 
    });
}

function initTextures() {
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ sendTextureToGLSL(image); };
    // Tell the browser to load an image
    image.src = 'sky.jpg';

    // load more textures!

    return true;
}
  
function sendTextureToGLSL(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function main() {
    // set up canvas and gl variables
    setupWebGL();

    // set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // set up actions for HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    // canvas.onmousedown = click;
    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(tick);
    // renderScene();
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;

function tick() {
    // save current time
    g_seconds = performance.now()/1000 - g_startTime;

    // update animations
    updateAnimationAngles();

    // draw everything
    renderScene();

    // tell browser to update when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles(){
    if (g_animate){
        // c l a m p 
        g_botSnoutAngle = Math.max(-10, Math.min(0, -10 * Math.sin(g_seconds)));

        // walking cycle
        g_legAngle1 = 20 * Math.sin(g_seconds * 3);
        g_legAngle2 = -g_legAngle1;

        // tail wagging
        g_tail1Angle = 20 * Math.sin(g_seconds*2);
        document.getElementById('tail1Value').textContent = Math.round(g_tail1Angle);
        document.getElementById('tail1Slide').value = g_tail1Angle;
        g_tail2Angle = 10 * Math.sin(g_seconds*2);
        document.getElementById('tail2Value').textContent = Math.round(g_tail2Angle);
        document.getElementById('tail2Slide').value = g_tail2Angle;
        g_tail3Angle = 5 * Math.sin(g_seconds*2);
        document.getElementById('tail3Value').textContent = Math.round(g_tail3Angle);
        document.getElementById('tail3Slide').value = g_tail3Angle;
    }

    if (poke && !nodded){
        if (nod_start === null) {
            nod_start = g_seconds;
        }

        // head nodding
        g_headAngle = 30 * Math.sin(g_seconds*3);
        document.getElementById('headValue').textContent = Math.round(g_headAngle);
        document.getElementById('headSlide').value = g_headAngle;

        // tail wagging
        g_tail1Angle = 20 * Math.sin(g_seconds*4);
        document.getElementById('tail1Value').textContent = Math.round(g_tail1Angle);
        document.getElementById('tail1Slide').value = g_tail1Angle;
        g_tail2Angle = 10 * Math.sin(g_seconds*4);
        document.getElementById('tail2Value').textContent = Math.round(g_tail2Angle);
        document.getElementById('tail2Slide').value = g_tail2Angle;
        g_tail3Angle = 5 * Math.sin(g_seconds*4);
        document.getElementById('tail3Value').textContent = Math.round(g_tail3Angle);
        document.getElementById('tail3Slide').value = g_tail3Angle;

        if (g_seconds - nod_start >= 4) {
            nodded = true;
            nod_start = null; // Reset so it can be triggered again
        }
    }
}

// Draw every shape that is supposed to be on the canvas
function renderScene(){
    // check time at start of draw
    var startTime = performance.now();

    // c l a m p
    g_horizAngle = Math.max(-180, Math.min(180, g_horizAngle));
    g_vertAngle = Math.max(-90, Math.min(90, g_vertAngle));

    // pass matrix
    var u_GlobalRotMat = new Matrix4().rotate(g_horizAngle, 0, 1, 0).rotate(g_vertAngle, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, u_GlobalRotMat.elements);

    // pass projection matrix
    var projMat = new Matrix4();
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_horizAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // body 
    var body = new Cube();
    body.matrix.translate(-0.3, -0.5, -0.175);
    body.matrix.scale(0.8, 0.5, 0.5);
    drawCube(body.matrix, darkGray);

    // head 
    var head = new Cube();
    head.matrix.setTranslate(0.3, -0.2, -0.1);
    head.matrix.rotate(g_headAngle, 0, 0);
    var headTopSnout = new Matrix4(head.matrix);
    var headBotSnout = new Matrix4(head.matrix);
    var headCollar = new Matrix4(head.matrix);
    head.matrix.scale(0.35, 0.35, 0.35);
    drawCube(head.matrix, white, -1);

    // top of snout
    var topSnout = new Cube();
    topSnout.matrix = headTopSnout;
    topSnout.matrix.translate(0.3, 0.1, 0.075);
    topSnout.matrix.scale(0.2, 0.1, 0.2);
    drawCube(topSnout.matrix, gray, -2);

    // bottom of snout
    var botSnout = new Cube();
    botSnout.matrix = headBotSnout;
    botSnout.matrix.rotate(g_botSnoutAngle, 0, 0);
    botSnout.matrix.translate(0.3, 0.05, 0.08);
    botSnout.matrix.scale(0.19, 0.09, 0.19);
    drawCube(botSnout.matrix, darkGray);

    // collar 
    var collar = new Cube();
    collar.matrix = headCollar;
    collar.matrix.translate(0, -0.05, 0.03);
    collar.matrix.scale(0.33, 0.1, 0.3);
    drawCube(collar.matrix, red, -1);

    // front right leg
    var bLeftLeg = new Cube();
    bLeftLeg.matrix.translate(-0.1, -0.45, 0.15);
    bLeftLeg.matrix.rotate(180 + g_legAngle1, 0, 0, 1);
    bLeftLeg.matrix.scale(0.15, 0.3, 0.15);
    drawCube(bLeftLeg.matrix, midGray);
    
    var bRightLeg = new Cube();
    bRightLeg.matrix.translate(-0.1, -0.45, -0.15);
    bRightLeg.matrix.rotate(180 + g_legAngle2, 0, 0, 1);
    bRightLeg.matrix.scale(0.15, 0.3, 0.15);
    drawCube(bRightLeg.matrix, gray);

    var fLeftLeg = new Cube();
    fLeftLeg.matrix.translate(0.4, -0.45, 0.15);
    fLeftLeg.matrix.rotate(180 + g_legAngle2, 0, 0, 1);
    fLeftLeg.matrix.scale(0.15, 0.3, 0.15);
    drawCube(fLeftLeg.matrix, midGray);

    var fRightLeg = new Cube();
    fRightLeg.matrix.setTranslate(0.4, -0.45, -0.15);
    fRightLeg.matrix.rotate(180 + g_legAngle1, 0, 0, 1);
    fRightLeg.matrix.scale(0.15, 0.3, 0.15);
    drawCube(fRightLeg.matrix, gray);

    // Tail
    var tail1 = new Cube();
    tail1.matrix.setTranslate(-0.2, -0.2, 0.0);
    tail1.matrix.rotate(135, 0, 0, 1); 
    tail1.matrix.rotate(g_tail1Angle, 1, 0, 0); 
    var tail1to2 = new Matrix4(tail1.matrix);
    tail1.matrix.scale(0.1, 0.2, 0.1); 
    drawCube(tail1.matrix, gray);

    var tail2 = new Cube();
    tail2.matrix = tail1to2;
    tail2.matrix.scale(0.1, 0.2, 0.1); 
    tail2.matrix.translate(0.01, 0.81, 0.001);
    tail2.matrix.rotate(g_tail2Angle, 1, 0, 0); 
    var tail2to3 = new Matrix4(tail2.matrix);
    drawCube(tail2.matrix, midGray);

    var tail3 = new Cube();
    tail3.matrix = tail2to3;
    tail3.matrix.translate(0.01, 0.81, 0.001);
    tail3.matrix.rotate(g_tail3Angle, 1, 0, 0); 
    drawCube(tail3.matrix, darkGray);

    var duration = performance.now() - startTime;
    sendTextToHtml("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function drawCube(M, color, tn){
    var cube = new Cube();
    cube.matrix = M;
    cube.color = color;
    cube.textureNum = tn;
    cube.render();
}

function drawCone(M, color){
    var cone = new Cone();
    cone.matrix = M;
    cone.color = color;
    cone.render();
}

function sendTextToHtml(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if (!htmlElem){
        console.log("Failed to get " + htmlElem + " from HTML");
        return;
    }
    htmlElem.innerHTML = text;
}
