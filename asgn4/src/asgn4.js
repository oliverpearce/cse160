// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
      v_VertPos = u_ModelMatrix * a_Position;
   }`

// Fragment shader program
var FSHADER_SOURCE =`
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;

    uniform bool u_spotOn;
    uniform vec3 u_spotPos;
    uniform vec3 u_spotColor;
    uniform vec3 u_spotDir;
    uniform float u_spotCutoff;
    uniform float u_spotExp;

    void main() {
      if(u_whichTexture == -3){
         gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // Use normal
      } else if(u_whichTexture == -2){
         gl_FragColor = u_FragColor;                  // Use color
      } else if (u_whichTexture == -1){
         gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
      } else if(u_whichTexture == 0){
         gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
      } else if(u_whichTexture == 1){
         gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
      } else if(u_whichTexture == 2){
         gl_FragColor = texture2D(u_Sampler2, v_UV);  // Use texture2
      } else {
         gl_FragColor = vec4(1, 0.2, 0.2, 1);              // Error, Red
      }

      vec3 lightVector = u_lightPos - vec3(v_VertPos);
      float r = length(lightVector);

      // Red/Green Distance Visualization
      // if(r<1.0){
      //    gl_FragColor = vec4(1,0,0,1);
      // } else if (r<2.0){
      //    gl_FragColor = vec4(0,1,0,1);
      // }

      // Light Falloff Visualization 1/r^2
      // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

      // N dot L
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      // Reflection
      vec3 R = reflect(-L, N);

      // eye
      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

      // Lighting
      float specular = pow(max(dot(E,R), 0.0), 10.0) * 0.5;
      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.8;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
      vec3 globalLight = ambient + diffuse;

      if(u_lightOn){
         if(u_spotOn){
            vec3 spotDir = normalize(-u_spotDir);
            vec3 spotVector = normalize(u_spotPos - vec3(v_VertPos));
            float spotCos = dot(spotDir, spotVector);

            if(spotCos > cos(radians(u_spotCutoff))){
               float spotFactor = pow(spotCos, u_spotExp);
               vec3 spotEffect = u_spotColor * spotFactor;
               // globalLight += spotEffect;
               globalLight = mix(globalLight, spotEffect, spotFactor);
            }
         }
         // gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
         // PLEASE
         globalLight += specular;
         gl_FragColor = vec4(globalLight, 1.0);
      }
    }`

// Globals
var gl;
var canvas;
var a_Position;
var a_UV;
var a_Normal;
var u_FragColor;
var u_Size;
var u_ModelMatrix;
var u_NormalMatrix;
var u_ProjectionMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_Sampler0;
var u_Sampler1;
var u_Sampler2;
var u_whichTexture;
var u_lightPos;
var u_cameraPos;

// Camera Movement
var g_camera;
var horizAngle = 0; // Camera

// Lighting 
var g_normalOn = false;
var g_lightOn = true;
var u_lightOn;
var g_lightPos = [0,1,1];

var g_spotOn = true;
var u_spotOn;
var u_spotPos;
var g_spotPos = [-2.5, 1.0, -1.5];
var u_spotColor;
var g_spotColor = [1.0, 0.0, 0.0];
var u_spotDir;
var u_spotCutoff;
var u_spotExp;

// set up canvas and gl variables
function setupWebGL(){
   // Retrieve <canvas> element
   canvas = document.getElementById('asgn4');
   if (!canvas) {
       console.log('Failed to retrieve the <canvas> element');
       return;
   }

   // Get the rendering context for WebGL
   gl = getWebGLContext(canvas);
   if(!gl){
       console.log('Failed to get the rendering context for WebGL');
       return;
   }

   // enable depth
   gl.enable(gl.DEPTH_TEST);
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

   // Get the storage location of a_UV
   a_UV = gl.getAttribLocation(gl.program, 'a_UV');
   if (a_UV < 0) {
       console.log('Failed to get the storage location of a_UV');
       return;
   }

   // Get the storage location of a_Normal
   a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
   if (a_Normal < 0) {
       console.log('Failed to get the storage location of a_Normal');
       return;
   }

   // Get the storage location of u_WhichTexture
   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
       console.log('Failed to get u_whichTexture');
       return;
   }

   // Get the storage location of u_lightPos
   u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
   if (!u_lightPos) {
      console.log('Failed to get u_lightPos');
      return;
   }

   // Get the storage location of u_FragColor
   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
       console.log('Failed to get u_FragColor');
       return;
   }

   // Get the storage location of u_lightOn
   u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
   if (!u_lightOn) {
       console.log('Failed to get u_lightOn');
       return;
   }

   // Get the storage location of u_cameraPos
   u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
   if (!u_cameraPos) {
       console.log('Failed to get u_cameraPos');
       return;
   }

   // Get the storage location of u_ModelMatrix
   u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   if (!u_ModelMatrix) {
       console.log('Failed to get u_ModelMatrix');
       return;
   }

   // Get the storage location of u_GlobalRotateMatrix
   u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
   if (!u_GlobalRotateMatrix) {
       console.log('Failed to get u_GlobalRotateMatrix');
       return;
   }

   // Get the storage location of u_ViewMatrix
   u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   if (!u_ViewMatrix) {
       console.log('Failed to get u_ViewMatrix');
       return;
   }

   // Get the storage location of u_NormalMatrix
   u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
   if (!u_NormalMatrix) {
       console.log('Failed to get u_NormalMatrix');
       return;
   }

   // Get the storage location of u_ProjectionMatrix
   u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
   if (!u_ProjectionMatrix) {
       console.log('Failed to get u_ProjectionMatrix');
       return;
   }

   // Get the storage location of u_Sampler0
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }

   // Get the storage location of u_Sampler1
   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }

   // Get the storage location of u_Sampler2
   u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
   if (!u_Sampler2) {
     console.log('Failed to get the storage location of u_Sampler2');
     return false;
   }

   // on, pos, color, dir, cutoff, exp

   // Get the storage location of u_spotOn
   u_spotOn = gl.getUniformLocation(gl.program, 'u_spotOn');
   if (!u_spotOn) {
     console.log('Failed to get the storage location of u_spotOn');
     return false;
   }

   // Get the storage location of u_spotPos
   u_spotPos = gl.getUniformLocation(gl.program, 'u_spotPos');
   if (!u_spotPos) {
     console.log('Failed to get the storage location of u_spotPos');
     return false;
   }

   // Get the storage location of u_spotColor
   u_spotColor = gl.getUniformLocation(gl.program, 'u_spotColor');
   if (!u_spotColor) {
     console.log('Failed to get the storage location of u_spotColor');
     return false;
   }

   // Get the storage location of u_spotDir
   u_spotDir = gl.getUniformLocation(gl.program, 'u_spotDir');
   if (!u_spotDir) {
     console.log('Failed to get the storage location of u_spotDir');
     return false;
   }

   // Get the storage location of u_spotCutoff
   u_spotCutoff = gl.getUniformLocation(gl.program, 'u_spotCutoff');
   if (!u_spotCutoff) {
     console.log('Failed to get the storage location of u_spotCutoff');
     return false;
   }

   // Get the storage location of u_spotPos
   u_spotExp = gl.getUniformLocation(gl.program, 'u_spotExp');
   if (!u_spotExp) {
     console.log('Failed to get the storage location of u_spotExp');
     return false;
   }

   // Set an initial value for this matrix to identity
   var identityM = new Matrix4();
   gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// set up actions for HTML UI elements
function addActionsForHtmlUI(){
   // sliders
   document.getElementById('horizAngleSlide').addEventListener('mousemove', function(ev) { 
      // only when clicked!
      if(ev.buttons == 1){ 
         horizAngle = this.value; 
         document.getElementById('horizAngleValue').textContent = this.value;
         renderScene();
      }
   });

   document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { 
      if(ev.buttons == 1){ 
         g_lightPos[0] = this.value / 100; 
         document.getElementById('lightValueX').textContent = this.value / 100;
         renderScene();
      }
   });

   document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { 
      if(ev.buttons == 1){ 
         g_lightPos[1] = this.value / 100; 
         document.getElementById('lightValueY').textContent = this.value / 100;
         renderScene();
      }
   });

   document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { 
      if(ev.buttons == 1){ 
         g_lightPos[2] = this.value / 100; 
         document.getElementById('lightValueZ').textContent = this.value / 100;
         renderScene();
      }
   });

   document.getElementById('redSlide').addEventListener('mousemove', function(ev) { 
      if(ev.buttons == 1){ 
         g_spotColor[0] = this.value / 255; 
         document.getElementById('redValue').textContent = this.value;
         renderScene();
      }
   });

   document.getElementById('greenSlide').addEventListener('mousemove', function(ev) { 
      if(ev.buttons == 1){ 
         g_spotColor[1] = this.value / 255; 
         document.getElementById('greenValue').textContent = this.value;
         renderScene();
      }
   });

   document.getElementById('blueSlide').addEventListener('mousemove', function(ev) { 
      if(ev.buttons == 1){ 
         g_spotColor[2] = this.value / 255; 
         document.getElementById('blueValue').textContent = this.value;
         renderScene();
      }
   });

   // buttons
   document.getElementById('normal_on').onclick = function() { g_normalOn = true; };
   document.getElementById('normal_off').onclick = function() { g_normalOn = false; };

   document.getElementById('light_on').onclick = function() { g_lightOn = true; };
   document.getElementById('light_off').onclick = function() { g_lightOn = false; };

   document.getElementById('spot_on').onclick = function() { g_spotOn = true; };
   document.getElementById('spot_off').onclick = function() { g_spotOn = false; };
}

function isPowerOf2(value) {
   return (value & (value - 1)) == 0;
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

   // Set the texture unit 0 to the sampler
   gl.uniform1i(u_Sampler0, 0);

   console.log("Finished loadTexture");
}

function main() {
   setupWebGL();
   connectVariablesToGLSL();
   addActionsForHtmlUI();

   g_camera = new Camera();
   document.onkeydown = keydown;

   initTextures();

   // Specify the color for clearing <canvas>
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;

function tick(){
   // save current time
   g_seconds = performance.now()/1000 - g_startTime;

   // update animation angles
   updateAnimationAngles();

   // draw everything
   renderScene();

   // tell browser to update when it has time
   requestAnimationFrame(tick);
}

function updateAnimationAngles(){
   g_lightPos[0] = cos(g_seconds);
   // document.getElementById('lightValueX').textContent = g_lightPos[0] / 100;
}

function keydown(ev){
   if(ev.keyCode == 65){ // D
      g_camera.right();
   } else if (ev.keyCode == 68){ // A
      g_camera.left();
   } else if (ev.keyCode == 87){ // W
      g_camera.forward();
   } else if (ev.keyCode == 83){ // S
      g_camera.back();
   } else if (ev.keyCode==81){ // Q
      g_camera.panLeft();
   } else if (ev.keyCode==69){ // E
      g_camera.panRight();
   }
   
   renderScene();
}

// Draw every shape that is supposed to be on the canvas
function renderScene(){
   // check time at start of draw
   var startTime = performance.now();

   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.clear(gl.COLOR_BUFFER_BIT);

   // Pass the projection matrix
   var projMat = g_camera.projMat;
   gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

   // Pass the view matrix
   var viewMatrix = g_camera.viewMatrix;
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

   // Pass the matrix to u_ModelMatrix attribute
   var globalRotMat = new Matrix4().rotate(horizAngle, 0,1,0);
   gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

   // Pass the light position to GLSL
   gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

   // Pass the camera position to GLSL
   gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

   // Pass the light status
   gl.uniform1i(u_lightOn, g_lightOn);

   // Pass the spotlight status
   gl.uniform1i(u_spotOn, g_spotOn);

   gl.uniform3fv(u_spotPos, new Float32Array(g_spotPos));
	gl.uniform3fv(u_spotDir, new Float32Array([0.0, -1.0, 0.0]));
   // Cutoff angle in degrees
	gl.uniform1f(u_spotCutoff, 30.0); 
   // Spot intensity falloff
	gl.uniform1f(u_spotExp, 15.0); 
	gl.uniform3fv(u_spotColor, new Float32Array(g_spotColor));

   // Draw the light
   var light = new Cube();
   light.color=[2,2,0,1];
   light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
   light.matrix.scale(0.1, 0.1, 0.1);
   light.matrix.translate(-0.5, -0.5, -0.5);
   light.render();

   // Draw Sphere 
   var sphere = new Sphere();
   sphere.color = [1.0, 1.0, 1.0, 1];
   sphere.textureNum = 0;
   if (g_normalOn) sphere.textureNum = -3;
   sphere.matrix.scale(0.5, 0.5, 0.5);
   sphere.matrix.translate(2, 0.5, -1.5);
   sphere.render();

   // Draw Cube
   var box = new Cube();
   box.color = [0.9, 0.6, 0.95, 1];
   // box.textureNum = 2;
   if (g_normalOn) box.textureNum = -3;
   box.matrix.scale(0.5, 0.5, 0.5);
   box.matrix.translate(-2, 0.5, -1.5);
   box.matrix.translate(-0.5, -0.5, -0.5);
   box.normalMatrix.setInverseOf(box.matrix).transpose();
   box.render();

   // Draw the floor 
   var floor = new Cube();
   floor.color = [0.2, 0.9, 0.4, 1];
   floor.textureNum = 1;
   floor.matrix.translate(0, -0.25, 0);
   floor.matrix.scale(10, 0.1, 10);
   floor.matrix.translate(-0.5, -0.5, -0.5);
   floor.normalMatrix.setInverseOf(floor.matrix).transpose();
   floor.render();

   // Draw the sky 
   var sky = new Cube();
   sky.color = [0.66, 0.96, 0.96, 1];
   if (g_normalOn) sky.textureNum = -3;
   sky.matrix.scale(-10, -10, -10);
   sky.matrix.translate(-0.5, -0.5, -0.5);
   // sky.normalMatrix.setInverseOf(sky.matrix).transpose();
   sky.render();

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