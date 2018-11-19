var Sphere = {};

Sphere.createSphere = function() {
   /*http://en.wikipedia.org/wiki/Icosahedron
    * (0, ±1, ±φ)
    * (±1, ±φ, 0)
    * (±φ, 0, ±1)
    * φ = (1 + √5) / 2 
    */

    //constroi os vertices do icosaedro (raio = 1)
    let t = ( 1 + Math.sqrt( 5.0 ) ) / 2.0 ;
    var initialVertices = [];
    for( let i = 0 ; i < 4; i++ ) {
        let v = [0.0, i&2 ? -1.0:1.0, i&1 ? -t:t];
        vec3.normalize(v, v);
        initialVertices.push(v); 
    }
    for( let i = 4 ; i < 8; i++ ) {
        let v = [i&2 ? -1.0:1.0, i&1 ? -t:t, 0.0];
        vec3.normalize(v, v);
        initialVertices.push(v); 
    }
    for( let i = 8 ; i < 12; i++ ) {
        let v = [i&1 ? -t:t, 0.0, i&2 ? -1.0:1.0];
        vec3.normalize(v, v);
        initialVertices.push(v); 
    }

    //triangulos iniciais da esfera -> triangulos do icosaedro
    var initialElements = [
        [0, 2, 8],
        [0, 8, 4],
        [0, 4, 6],
        [0, 6, 9],
        [0, 9, 2],
        [2, 7, 5],
        [2, 5, 8],
        [2, 9, 7],
        [8, 5, 10],
        [8, 10, 4],
        [10, 5, 3],
        [10, 3, 1],
        [10, 1, 4],
        [1, 6, 4],
        [1, 3, 11],
        [1, 11, 6],
        [6, 11, 9],
        [11, 3, 7],
        [11, 7, 9],
        [3, 5, 7]
    ];

    var vertices = [];
    var elements = [];
    var normals = [];

    var triangleSubdivision = function (v1, v2, v3, depth) {
        if (depth == 0) {
            //procura o indice do vertice caso ele ja tenha sido adicionado
            let i1 = Utils.findVertex(vertices, v1);
            let i2 = Utils.findVertex(vertices, v2);
            let i3 = Utils.findVertex(vertices, v3);

            if (i1 < 0) {
                vertices = vertices.concat(v1);
                normals = normals.concat(v1);
                i1 = Math.floor(vertices.length / 3) - 1;
            }
            if (i2 < 0) {
                vertices = vertices.concat(v2);
                normals = normals.concat(v2);
                i2 = Math.floor(vertices.length / 3) - 1;
            }
            if (i3 < 0) {
                vertices = vertices.concat(v3);
                normals = normals.concat(v3);
                i3 = Math.floor(vertices.length / 3) - 1;
            }

            elements = elements.concat([i1, i2, i3]);
            return;
        }

        var v12 = [];
        var v23 = [];
        var v31 = [];
        for (let i = 0; i < 3; i++) {
            v12 = [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]];
            v23 = [v2[0]+v3[0], v2[1]+v3[1], v2[2]+v3[2]];
            v31 = [v3[0]+v1[0], v3[1]+v1[1], v3[2]+v1[2]];
        }

        vec3.normalize(v12, v12);
        vec3.normalize(v23, v23);
        vec3.normalize(v31, v31);

        triangleSubdivision(v1, v12, v31, depth - 1);
        triangleSubdivision(v2, v23, v12, depth - 1);
        triangleSubdivision(v3, v31, v23, depth - 1);
        triangleSubdivision(v12, v23, v31, depth - 1);
    };

    //subdivide os triangulos do icosaedro
    for (let i = 0; i < initialElements.length; i++) {
        triangleSubdivision(initialVertices[initialElements[i][0]],
                            initialVertices[initialElements[i][1]],
                            initialVertices[initialElements[i][2]], 3);
    }

    colors = [];

    for (let i = 0; i < vertices.length; i++) {
        colors = colors.concat([0.3, 0.3, 0.8]);
    }

    console.log(vertices.length);
    console.log(elements.length);

    var model = mat4.create();
    mat4.identity(model);

    return {
        vertices: vertices,
        normals: normals,
        elements: elements,
        colors: colors,
        material: {
            specular: vec3.fromValues(0.5, 0.5, 0.5),
            shi: 24.0
        },
        model: model
    }
}

Sphere.createSphereVAO = function(gl, program, sphere) {
    var spherevao = Model.createVAO(gl, program, sphere);
    return spherevao;
}