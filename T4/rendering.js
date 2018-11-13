//Obtem o canvas, definido no .html
var canvas = document.getElementById("canvas");

//Usada para acessar as funcoes da OpenGL.
var gl;

//Um programa (conjunto de shaders) para ser executado na placa
var program;

//Encapsula um conjunto de definicoes sobre um objeto.
var vao;

//Matrizes de transformacao.
var view, proj;

function onLoad(){

    //Inicializar o contexto WebGL
    initGL();

    //Criar um programa (conjunto de shaders) WebGL
    initProgram();

    //Inicializar a cena
    initScene();

    //Desenhar a cena
    redraw();
}

function initGL(){
    //Obter contexto para o WebGL
    try 
	{
		//Obtem o contexto do canvas para webgl2.
        gl = canvas.getContext("webgl2");
		
		//Habilita o zuffer.
        gl.enable(gl.DEPTH_TEST);
		
		//Define cor de fundo.
		gl.clearColor( 0, 0, 0, 1);
		
		//Salva as dimensões do canvas.
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) 
	{
    }

    if (!gl) 
	{
        alert("could not initialise WebGL");
    }
}


function createShader(shaderSource, shaderType){
    //Criar o objeto shader
    var shader = gl.createShader(shaderType);

    //Setar o código fonte
    gl.shaderSource(shader, shaderSource);

    //Compilar o shader
    gl.compileShader(shader);

    //Verificar se foi compilado com sucesso
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
		var info = gl.getShaderInfoLog( shader );
		throw 'Could not compile WebGL program. \n\n' + info;
    }

    //Retornar o shader
    return shader;
}

function initProgram(){
    //Criar e compilar os shaders
    var vertexShaderSrc = document.getElementById("vertexShaderSrc").text;
    var fragmentShaderSrc = document.getElementById("fragmentShaderSrc").text;
    var vertexShader = createShader(vertexShaderSrc,gl.VERTEX_SHADER);
    var fragmentShader = createShader(fragmentShaderSrc,gl.FRAGMENT_SHADER);

    //Criar o programa e linkar
    program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
       var info = gl.getProgramInfoLog(program);
	   throw 'Could not compile WebGL program. \n\n' + info;
    }

    //Usar o programa
    gl.useProgram(program);

    //Criar propriedades no programa guardando uniformes e atributos para uso posterior
    program.vertexPosAttr = gl.getAttribLocation(program,"vertexPos");
    program.vertexColorAttr = gl.getAttribLocation(program, "color");
    program.vertexNormalAttr = gl.getAttribLocation(program, "vertexNormal");

    program.mvUniform =  gl.getUniformLocation(program, "mv");
    program.nmUniform =  gl.getUniformLocation(program, "nm");
    program.mvpUniform = gl.getUniformLocation(program, "mvp");

    program.light = gl.getUniformLocation(program, "leye");
    program.amb = gl.getUniformLocation(program, "amb");
    program.dif = gl.getUniformLocation(program, "dif");
    program.spc = gl.getUniformLocation(program, "spc");
    program.shi = gl.getUniformLocation(program, "shi");
}

function initScene(){
    //Posições da câmera
    var eye = [10, 10, -10];
    var center = [0,0,0];
    var up = [0,1,0];

    //Definir as matrizes de view e projection
    view = mat4.create();
    proj = mat4.create();
    mat4.lookAt(view, eye, center, up);
    mat4.perspective(proj, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    //Criar o objeto
    createCube();
}


function createCube(){
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
        [0.3,  0.6,  0.6],    // Front face: cyan
        [0.6,  0.3,  0.3],    // Back face: red
        [0.3,  0.6,  0.3],    // Top face: green
        [0.3,  0.3,  0.6],    // Bottom face: blue
        [0.6,  0.6,  0.3],    // Right face: yellow
        [0.6,  0.3,  0.6]     // Left face: purple
      ];
      
      var color = [];
    
      for (var j=0; j<6; j++) {
        var polygonColor = colorsOfFaces[j];
        
        for (var i=0; i<4; i++) {
          color = color.concat( polygonColor );
        }
      }

      var indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
      ];

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    //Criar VBO dos vertices, linkar e copiar os dados
    var vertexVBO = gl.createBuffer();
	//Define buffer como corrente.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexVBO);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	//Habilita atributo desejado do vertice.
    gl.enableVertexAttribArray(program.vertexPosAttr);
	//Diz que os atributos estao no buffer corrente.
    gl.vertexAttribPointer(program.vertexPosAttr, 3, gl.FLOAT, false, 0, 0);

    //Criar VBO para cores, linkar e copiar os dados
    var vboColor = gl.createBuffer();
	//Define buffer como corrente.
    gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);
	//Habilita atributo desejado do vertice.
    gl.enableVertexAttribArray(program.vertexColorAttr);
	//Diz que os atributos estao no buffer corrente.
    gl.vertexAttribPointer(program.vertexColorAttr, 3, gl.FLOAT, false, 0, 0);

    //Criar VBO para normais, linkar e copiar os dados
    var vboNormals = gl.createBuffer();
    //Define buffer como corrente.
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNormals);
    //Aloca buffer e copia dados.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    //Habilita atributo desejado do vertice.
    gl.enableVertexAttribArray(program.vertexNormalAttr);
    //Diz que os atributos estao no buffer corrente.
    gl.vertexAttribPointer(program.vertexNormalAttr, 3, gl.FLOAT, false, 0, 0);

    //Criar EBO, linkar e copiar os dados
    var EBO = gl.createBuffer();
	//Define o buffer como corrente e o define como buffer de elementos.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
	//Aloca buffer e copia dados.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}



function redraw(){
    //Definir tamanho e limpar a janela
    gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindVertexArray(vao);

    var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    var lightPos = vec4.fromValues(0.0, 10.0, 0.0, 1.0);
    var specular = vec3.fromValues(0.5, 0.5, 0.5);
    var shi = 32.0;
    vec3.transformMat4(lightPos, lightPos, view);
    console.log(lightPos);

    //Desenhar os objetos em diferentes posições
    var model = mat4.create();
    var modelView = mat4.create();
    var mvp = mat4.create();
    var nm = mat4.create();

    for( let x = -5; x <= 5; x+=5 )
    {
        for( let z = -5; z <= 5; z+=5)
        {
            mat4.identity(model);
            mat4.translate(model,model,[x,0,z]);

            mat4.identity(modelView);
            mat4.multiply(modelView,view,model);
            mat4.multiply(mvp,proj,modelView);

            mat4.invert(nm, modelView);
            mat4.transpose(nm, nm);

            gl.uniformMatrix4fv(program.mvUniform, false, modelView);
            gl.uniformMatrix4fv(program.mvpUniform, false, mvp);
            gl.uniformMatrix4fv(program.nmUniform, false, nm);

            gl.uniform4fv(program.light, lightPos);
            gl.uniform3fv(program.amb, ambientLight);
            gl.uniform3fv(program.spc, specular);
            gl.uniform1f(program.shi, shi);
            

            //Desenhar
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }
    }

    //Desabilitar buffers habilitados
      gl.bindVertexArray(null);
}
