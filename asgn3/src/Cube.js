class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.buffer = null;
        this.uvBuffer = null;
        this.vertices = null;
        this.uvs = null;
        this.textureNum = 0;
    }

    // generate the vertices
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    generateVertices() {
        let v = [];
        let uv = [];

        // Define vertices and corresponding UVs for each face
        const faces = [
            [ // front
                0, 0, 0,  1, 1, 0,  1, 0, 0,
                0, 0, 0,  0, 1, 0,  1, 1, 0
            ],
            [ // top
                0, 1, 0,  0, 1, 1,  1, 1, 1, 
                0, 1, 0,  1, 1, 1,  1, 1, 0
            ],
            [ // right
                1, 0, 0,  1, 1, 0,  1, 1, 1,
                1, 0, 0,  1, 1, 1,  1, 0, 1
            ],
            [ // left
                0, 0, 0,  0, 1, 0,  0, 1, 1,
                0, 0, 0,  0, 1, 1,  0, 0, 1
            ],
            [ // bottom
                0, 0, 1,  1, 0, 1,  1, 0, 0,
                0, 0, 1,  1, 0, 0,  0, 0, 0
            ],
            [ // back
                1, 0, 1,  1, 1, 1,  0, 0, 1,
                1, 1, 1,  0, 1, 1,  0, 0, 1
            ]
        ];

        // UVs for each triangle (shared across all faces)
        const faceUVs = [1, 0,  0, 1,  1, 1,  1, 0,  0, 1,  1, 1];

        for (let i = 0; i < faces.length; i++) {
            v.push(...faces[i]);
            uv.push(...faceUVs);
        }

        this.vertices = new Float32Array(v);
        this.uvs = new Float32Array(uv);
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

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw the cube
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);  
    }
}