var Utils = {};

Utils.findVertex = function(vertices, v) {
    for (let i = 0; i < vertices.length; i += 3) {
        if (vertices[i] == v[0] && vertices[i+1] == v[1] && vertices[i+2] == v[2])
            return Math.floor(i/3);
    }

    return -1;
}

var Model = {};

Model.createVAO = function(gl, program, object) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    //Criar VBO dos vertices, linkar e copiar os dados
    var vertexVBO = gl.createBuffer();
	//Define buffer como corrente.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexVBO);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
	//Habilita atributo desejado do vertice.
    gl.enableVertexAttribArray(program.vertexPosAttr);
	//Diz que os atributos estao no buffer corrente.
    gl.vertexAttribPointer(program.vertexPosAttr, 3, gl.FLOAT, false, 0, 0);

    var vboNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.vertexNormalAttr);
    gl.vertexAttribPointer(program.vertexNormalAttr, 3, gl.FLOAT, false, 0, 0);

    //Criar EBO, linkar e copiar os dados
    var EBO = gl.createBuffer();
	//Define o buffer como corrente e o define como buffer de elementos.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.elements), gl.STATIC_DRAW);

    return vao;

}

Model.transform = function(object, rotation, translation, scale) {
    mat4.fromRotationTranslationScale(object.model, rotation, 
                                      translation, scale);
}

Model.rotate = function(object, axis, angle) {
    let rotation = mat4.create();
    mat4.fromRotation(rotation, angle, axis);
    mat4.multiply(object.model, rotation, object.model);
}

Model.translate = function(object, translation) {
    let translationMat = mat4.create();
    mat4.translate(translationMat, translationMat, translation);
    mat4.multiply(object.model, translationMat, object.model);
}

Model.scale = function(object, scale) {
    let scaleMat = mat4.create();
    mat4.scale(scaleMat, scaleMat, scale);
    mat4.multiply(object.model, scaleMat, object.model);
}