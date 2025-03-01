 class Cube {
    constructor() {
      this.type = 'cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.textureNum = -2;
      this.matrix = new Matrix4();
      this.normalMatrix = new Matrix4();
      
      // Buffers for vertex attributes
      this.positionBuffer = null;
      this.uvBuffer = null;
      this.normalBuffer = null;
      
      this.positions = null;
      this.uvs = null;
      this.normals = null;
    }
    
    // Generate vertices arrays 
    generateVertices() {
      const pos = [];
      const uv = [];
      const norm = [];
      
      // Front face (normal: 0,0,-1)
      pos.push(...[0,0,0,  1,1,0,  1,0,0]);
      uv.push(...[0,0,  1,1,  1,0]);
      norm.push(...[0,0,-1,  0,0,-1,  0,0,-1]);
      
      pos.push(...[0,0,0,  0,1,0,  1,1,0]);
      uv.push(...[0,0,  0,1,  1,1]);
      norm.push(...[0,0,-1,  0,0,-1,  0,0,-1]);
      
      // Top face (normal: 0,1,0)
      pos.push(...[1,1,0,  1,1,1,  0,1,0]);
      uv.push(...[1,0,  1,1,  0,0]);
      norm.push(...[0,1,0,  0,1,0,  0,1,0]);
      
      pos.push(...[0,1,1,  1,1,1,  0,1,0]);
      uv.push(...[0,1,  1,1,  0,0]);
      norm.push(...[0,1,0,  0,1,0,  0,1,0]);
      
      // Right face (normal: 1,0,0)
      pos.push(...[1,0,0,  1,1,0,  1,1,1]);
      uv.push(...[0,0,  0,1,  1,1]);
      norm.push(...[1,0,0,  1,0,0,  1,0,0]);
      
      pos.push(...[1,0,0,  1,0,1,  1,1,1]);
      uv.push(...[0,0,  1,0,  1,1]);
      norm.push(...[1,0,0,  1,0,0,  1,0,0]);
      
      // Left face (normal: -1,0,0)
      pos.push(...[0,0,0,  0,0,1,  0,1,1]);
      uv.push(...[1,0,  0,0,  0,1]);
      norm.push(...[-1,0,0, -1,0,0, -1,0,0]);
      
      pos.push(...[0,0,0,  0,1,0,  0,1,1]);
      uv.push(...[1,0,  1,1,  0,1]);
      norm.push(...[-1,0,0, -1,0,0, -1,0,0]);
      
      // Bottom face (normal: 0,-1,0)
      pos.push(...[0,0,0,  1,0,1,  1,0,0]);
      uv.push(...[0,1,  1,0,  1,1]);
      norm.push(...[0,-1,0,  0,-1,0,  0,-1,0]);
      
      pos.push(...[0,0,0,  0,0,1,  1,0,1]);
      uv.push(...[0,1,  0,0,  1,0]);
      norm.push(...[0,-1,0,  0,-1,0,  0,-1,0]);
      
      // Back face (normal: 0,0,1)
      pos.push(...[1,0,1,  0,0,1,  0,1,1]);
      uv.push(...[0,0,  1,0,  1,1]);
      norm.push(...[0,0,1,  0,0,1,  0,0,1]);
      
      pos.push(...[1,0,1,  1,1,1,  0,1,1]);
      uv.push(...[0,1,  0,1,  1,1]);
      norm.push(...[0,0,1,  0,0,1,  0,0,1]);
      
      this.positions = new Float32Array(pos);
      this.uvs = new Float32Array(uv);
      this.normals = new Float32Array(norm);
    }
    
    // Setup buffers if they haven't been created yet
    setupBuffers() {
      if (!this.positions || !this.uvs || !this.normals) {
        this.generateVertices();
      }
      
      // Position Buffer
      if (!this.positionBuffer) {
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
      }

      // UV Buffer
      if (!this.uvBuffer) {
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
      }

      // Normal Buffer
      if (!this.normalBuffer) {
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
      }
    }
    
    render() {
      gl.uniform1i(u_whichTexture, this.textureNum);
      
      gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
      
      this.setupBuffers();
      
      const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      
      const a_UV = gl.getAttribLocation(gl.program, 'a_UV');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);
      
      const a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
      
      // Draw all triangles
      const nVertices = this.positions.length / 3; 
      gl.drawArrays(gl.TRIANGLES, 0, nVertices);
    }
  }