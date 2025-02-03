class Cube{
    constructor(){
        this.type='cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();

        this.buffer = null;
        this.vertices = null;
    }

    // generate the vertices
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    generateVertices() {
        let v = [];
        var rgba = this.color;

        // front of cube
        v.push(...[
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0
        ]);
        
        // gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        // top of cube
        v.push(...[
            0, 1, 0,  0, 1, 1,  1, 1, 1, 
            0, 1, 0,  1, 1, 1,  1, 1, 0
        ]);

        // gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        // right of cube
        v.push(...[
            1, 0, 0,  1, 1, 0,  1, 1, 1,
            1, 0, 0,  1, 1, 1,  1, 0, 1
        ]);

        // gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        // left of cube
        v.push(...[
            0, 0, 0,  0, 1, 0,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 0, 1
        ]);

        // gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        // bottom of cube
        v.push(...[
            0, 0, 1,  1, 0, 1,  1, 0, 0,
            0, 0, 1,  1, 0, 0,  0, 0, 0
        ]);

        // gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        // back of cube
        v.push(...[
            1, 0, 1,  1, 1, 1,  0, 0, 1,
            1, 1, 1,  0, 1, 1,  0, 0, 1
        ]);

        // store vertices
        this.vertices = new Float32Array(v);
    }
  
    render(){
        // check vertices
        if (this.vertices === null) {
            this.generateVertices();
        }

        // check buffer
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
                console.log("Failed to create buffer object");
                return -1;
            }
        }

        // bind vertices to buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
  
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // position attrib
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);  
    }
}