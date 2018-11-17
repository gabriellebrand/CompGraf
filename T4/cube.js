var Cube = {};

Cube.createCubeData = function() {
    //Definir vértices e índices
    var vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
      ];

      var normals = [
        //Front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        //Back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        //Top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        //Bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        //Right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        //Left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];


    var colorsOfFaces = [
        [0.3, 0.6, 0.6],    // Front face: cyan
        [0.6, 0.3, 0.3],    // Back face: red
        [0.3, 0.6, 0.3],    // Top face: green
        [0.3, 0.3, 0.6],    // Bottom face: blue
        [0.6, 0.6, 0.3],    // Right face: yellow
        [0.6, 0.3, 0.6]     // Left face: purple
    ];

    var color = [];

    for (var j = 0; j < 6; j++) {
        var polygonColor = colorsOfFaces[j];

        for (var i = 0; i < 4; i++) {
            color = color.concat(polygonColor);
        }
    }

    var elements = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
    ];

    return {
        vertices: vertices,
        normals: normals,
        elements: elements,
        colors: color,
        material: {
            specular: vec3.fromValues(0.5, 0.5, 0.5),
            shi: 32.0
        }
    }
}

Cube.createCubeVAO = function(gl, program, cube) {
    var cubevao = gl.createVertexArray();
    gl.bindVertexArray(cubevao);

    //Criar VBO dos vertices, linkar e copiar os dados
    var vertexVBO = gl.createBuffer();
	//Define buffer como corrente.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexVBO);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);
	//Habilita atributo desejado do vertice.
    gl.enableVertexAttribArray(program.vertexPosAttr);
	//Diz que os atributos estao no buffer corrente.
    gl.vertexAttribPointer(program.vertexPosAttr, 3, gl.FLOAT, false, 0, 0);

    //Criar VBO para cores, linkar e copiar os dados
    var vboColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.vertexColorAttr);
    gl.vertexAttribPointer(program.vertexColorAttr, 3, gl.FLOAT, false, 0, 0);

    var vboNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.vertexNormalAttr);
    gl.vertexAttribPointer(program.vertexNormalAttr, 3, gl.FLOAT, false, 0, 0);

    //Criar EBO, linkar e copiar os dados
    var EBO = gl.createBuffer();
	//Define o buffer como corrente e o define como buffer de elementos.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.elements), gl.STATIC_DRAW);

    return cubevao;
}