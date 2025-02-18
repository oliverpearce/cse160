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
    gl_Position = u_ViewMatrix * u_ProjectionMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform float u_texColorWeight;
  void main() {
    if (u_whichTexture == -3){
        vec4 texColor = texture2D(u_Sampler0, v_UV); // mix base and texture color
        float t = u_texColorWeight;
        gl_FragColor = (1.0 - t) * u_FragColor + t * texColor;
    } else if (u_whichTexture == -2){
        gl_FragColor = u_FragColor;                 // the color
    } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);        // use UV debug color
    } else if (u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV); // the texture0
    } else if (u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV); // the texture1 
    } else if (u_whichTexture == 2){
        gl_FragColor = texture2D(u_Sampler2, v_UV); // the texture2
    } else if (u_whichTexture == 3){
        gl_FragColor = texture2D(u_Sampler3, v_UV); // the texture3
    } else {
        gl_FragColor = vec4(0.5, 0.7, 0.2, 1);      // error, put redish 
    }
  }`

// Globals
let canvas, gl, a_Position, a_UV, u_FragColor, u_ModelMatrix, u_GlobalRotateMatrix, u_ViewMatrix, u_ProjectionMatrix;
let u_whichTexture, u_Sampler0, u_Sampler1, u_Sampler2, u_Sampler3;
let vertexBuffer, vertexArray;
let g_camera;
let g_map;

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
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    // Get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Get the storage location of u_Sampler2
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    // Get the storage location of u_Sampler3
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

    // Set an initial value for this matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// camera
let g_horizAngle = 0;
let g_vertAngle = 0;
let drag = false;
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

        g_horizAngle = 5;
        g_vertAngle = 5;
        document.getElementById('horizAngleValue').textContent = 5;
        document.getElementById('horizAngleSlide').value = 5
        document.getElementById('vertAngleValue').textContent = 5;
        document.getElementById('vertAngleSlide').value = 5;
        document.getElementById('fovValue').textContent = 60;
        document.getElementById('fovSlide').value = 60;

        g_camera = new Camera();

        renderScene();
    }

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

    document.getElementById("fovSlide").addEventListener("mousemove", function () {
		g_fov = this.value;
        document.getElementById('fovValue').textContent = this.value;
        renderScene();
	});
}

function initTextures() {
    var image0 = new Image();  // Create the image object
    if (!image0) {
        console.log('Failed to create the image0 object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image0.onload = function(){ sendTextureToGLSL(image0, gl.TEXTURE0, 0, u_Sampler0); };
    // Tell the browser to load an image
    image0.src = '../images/skybox.jpg';

    var image1 = new Image();
    if (!image1){
        console.log('Failed to create the image1 object');
        return false;
    }
    image1.onload = function(){ sendTextureToGLSL(image1, gl.TEXTURE1, 1, u_Sampler1); };
    image1.src = '../images/mc-dirt.jpg';

    var image2 = new Image();
    if (!image2){
        console.log('Failed to create the image2 object');
        return false;
    }
    image2.onload = function(){ sendTextureToGLSL(image2, gl.TEXTURE2, 2, u_Sampler2); };
    image2.src = '../images/stone.jpg';

    var image3 = new Image();
    if (!image3){
        console.log('Failed to create the image3 object');
        return false;
    }
    image3.onload = function(){ sendTextureToGLSL(image3, gl.TEXTURE3, 3, u_Sampler3); };
    image3.src = '../images/netherrack.png';

    return true;
}
  
function sendTextureToGLSL(image, activeTex, texNum, u_sampler) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(activeTex);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_sampler, texNum);

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

    g_camera = new Camera();
    g_map = new Map();
    document.onkeydown = keydown;

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
    // updateAnimationAngles();

    // draw everything
    renderScene();

    // tell browser to update when it has time
    requestAnimationFrame(tick);
}

function keydown(ev) {
    switch(ev.keyCode) {
      case 87: // W
        g_camera.moveForward();
        break;
      case 83: // S
        g_camera.moveBackwards();
        break;
      case 68: // D
        g_camera.moveRight();
        break;
      case 65: // A
        g_camera.moveLeft();
        break;
      case 81: // Q
        g_camera.panLeft();
        break;
      case 69: // E
        g_camera.panRight();
        break;
    }
  }
  
// camera variables!
// var g_eye = [0, 0, 1];
// var g_at = [0, 0, -100];
// var g_up = [0, 1, 0];

// Draw every shape that is supposed to be on the canvas
function renderScene(){
    // check time at start of draw
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // c l a m p
    // g_horizAngle = Math.max(-180, Math.min(180, g_horizAngle));
    // g_vertAngle = Math.max(-90, Math.min(90, g_vertAngle));

    // pass projection matrix
    // var projMat = new Matrix4();
    // projMat.setPerspective(50, 1*canvas.width/canvas.height, 0.1, 100); // (angle, aspect, near plane, far plane)
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);

    // pass view matrix
    // var viewMat = new Matrix4();
    // viewMat.setLookAt(
    //     g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    //     g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2], 
    //     g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

    // pass matrix
    // var u_GlobalRotMat = new Matrix4()
    // u_GlobalRotMat.rotate(g_horizAngle, 0, 1, 0);
    // u_GlobalRotMat.rotate(g_vertAngle, 1, 0, 0);
    // gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, u_GlobalRotMat.elements);

    // pass matrix to u_ModelMatrix attrib
    var globalRotMat = new Matrix4()
    globalRotMat.rotate(g_horizAngle,0,1,0);
    globalRotMat.rotate(g_vertAngle, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    g_map.render();

    // skybox!
    let g_skybox = new Cube();
    g_skybox.textureNum = 0;
	g_skybox.matrix.setTranslate(
		g_camera.eye.elements[0],
		g_camera.eye.elements[1],
		g_camera.eye.elements[2]
	);
	g_skybox.matrix.scale(1000, 1000, 1000);
    // rotate!!!
	g_skybox.matrix.rotate(g_seconds, 0, 1, 0);
	g_skybox.matrix.translate(-0.5, -0.5, -0.5);
	g_skybox.render();

    // floor
    var floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 5;
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(20, 0, 20);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    // body 
    // var body = new Cube();
    // body.color = [1, 0, 0, 1];
    // body.textureNum = 0;
    // body.matrix.translate(-0.25, -0.75, 0);
    // body.matrix.rotate(-5, 1, 0, 0);
    // body.matrix.scale(0.5, 0.3, 0.5);
    // body.render();

    var duration = performance.now() - startTime;
    sendTextToHtml("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHtml(text, htmlID){
    var htmlElem = document.getElementById(htmlID);
    if (!htmlElem){
        console.log("Failed to get " + htmlElem + " from HTML");
        return;
    }
    htmlElem.innerHTML = text;
}
