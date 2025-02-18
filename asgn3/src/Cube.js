class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.vertices = new Float32Array([

            // front
			1, 0, 0,  0, 0, 0,  0, 1, 0, 
			1, 0, 0,  0, 1, 0,  1, 1, 0,

            // right
			1, 0, 1,  1, 0, 0,  1, 1, 0, 
			1, 0, 1,  1, 1, 0,  1, 1, 1,

            // left
			0, 0, 0,  0, 0, 1,  0, 1, 1, 
			0, 0, 0,  0, 1, 1,  0, 1, 0,

            // back
			0, 0, 1,  1, 0, 1,  1, 1, 1, 
			0, 0, 1,  1, 1, 1,  0, 1, 1,

            // top
			0, 1, 1,  1, 1, 1,  1, 1, 0, 
			0, 1, 1,  1, 1, 0,  0, 1, 0,

            // bottom
			1, 0, 1,  0, 0, 1,  0, 0, 0, 
			1, 0, 1,  0, 0, 0,  1, 0, 0,
		]);
        this.buffer = null;
        
        this.uvs = new Float32Array([
            // front
			0.25, 0.25,  0.5, 0.25,  0.5, 0.5, 
			0.25, 0.25,  0.5, 0.5,  0.25, 0.5,

            // right
			0.5, 0.25,  0.75, 0.25,  0.75, 0.5, 
            0.5, 0.25,  0.75, 0.5,  0.5, 0.5,

            // left
			0.0, 0.25,  0.25, 0.25,  0.25, 0.5, 
			0.0, 0.25,  0.25, 0.5,  0.0, 0.5,

            //back
			0.75, 0.25,  1.0, 0.25,  1.0, 0.5, 
			0.75, 0.25,  1.0, 0.5,  0.75, 0.5,

            // top
			0.25, 0.5,  0.5, 0.5,  0.5, 0.75,
			0.25, 0.5,  0.5, 0.75, 0.25, 0.75,

            //bottom
			0.25, 0.0,  0.5, 0,  0.5, 0.25, 
			0.25, 0.0,  0.5, 0.25,  0.25, 0.25,
		]);
        this.uvBuffer = null;

        this.textureNum = 0;
    }
  
    render(){
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // check buffer
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
                console.log("Failed to create buffer object");
                return -1;
            }
        }

        if (this.uvBuffer === null) {
            this.uvBuffer = gl.createBuffer();
            if (!this.uvBuffer) {
                console.log("Failed to create uvbuffer object");
                return -1;
            }
        }

        // pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // position buffer!
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // uv buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.DYNAMIC_DRAW);
        const a_UV = gl.getAttribLocation(gl.program, 'a_UV');
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
    
        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);  
    }
}