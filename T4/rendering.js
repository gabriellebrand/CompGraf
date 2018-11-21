//Obtem o canvas, definido no .html
var canvas = document.getElementById("canvas");

//Usada para acessar as funcoes da OpenGL.
var gl;

//Um programa (conjunto de shaders) para ser executado na placa
var program;

//Encapsula um conjunto de definicoes sobre um objeto.
var objects = [];

//Matrizes de transformacao.
var view, proj;

var eye = [20, 20, 20];
var up = [0, 1, 0];
var center = [0,0,0];

var vertexShader = "vertexShaderSrc2";
var fragmentShader = "fragmentShaderSrc2";

function render1Pressed() {
    vertexShader = "vertexShaderSrc";
    fragmentShader = "fragmentShaderSrc";   
    onLoad();
}

function render2Pressed() {
    vertexShader = "vertexShaderSrc2";
    fragmentShader = "fragmentShaderSrc2";
    onLoad();
}

function onLoad(){
    //Inicializar o contexto WebGL
    initGL();

    //Criar um programa (conjunto de shaders) WebGL
    initProgram(vertexShader, fragmentShader);

    //Inicializar a cena
    initScene();

    //Desenhar a cena
    drawScene();
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
		gl.clearColor(0, 0, 0, 1);
		
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

function initProgram(vertexShaderID, fragShaderID){
    //Criar e compilar os shaders
    var vertexShaderSrc = document.getElementById(vertexShaderID).text;
    var fragmentShaderSrc = document.getElementById(fragShaderID).text;
    var vertexShader = createShader(vertexShaderSrc,gl.VERTEX_SHADER);
    var fragmentShader = createShader(fragmentShaderSrc,gl.FRAGMENT_SHADER);

    //Criar o programa e linkar
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
       var info = gl.getProgramInfoLog(program);
	   throw 'Could not compile WebGL program. \n\n' + info;
    }

    //Usar o programa
    gl.useProgram(program);

    //Criar propriedades no programa guardando uniformes e atributos para uso posterior
    program.vertexPosAttr = gl.getAttribLocation(program,"vertexPos");
    program.vertexNormalAttr = gl.getAttribLocation(program, "vertexNormal");
    
    program.colorUniform = gl.getUniformLocation(program, "color");
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

    //Definir as matrizes de view e projection
    view = mat4.create();
    proj = mat4.create();
    mat4.lookAt(view, eye, center, up);
    mat4.perspective(proj, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    //Criar os objetos
    var cube = Cube.createCube();
    Model.scale(cube, [12, 0.5, 12]);
    Model.translate(cube, [0, -2, 0])
    cube.vao = Cube.createCubeVAO(gl, program, cube);
    objects.push(cube);

    var bunny = Bunny.createBunny();
    Model.scale(bunny, [0.6, 0.6, 0.6]);
    bunny.vao = Bunny.createBunnyVAO(gl, program, bunny);
    objects.push(bunny);

    for (let i = 0; i < 8; i++) {
        let angle = i*(Math.PI/4);
        let sphere = Sphere.createSphere();
        Model.scale(sphere, [1.5, 1.5, 1.5]);
        Model.translate(sphere, [0, 0, 10]);
        Model.rotate(sphere, [0, 1, 0], angle);
        sphere.vao = Sphere.createSphereVAO(gl, program, sphere);
        objects.push(sphere);
    }
}

function drawScene() {
    //Definir tamanho e limpar a janela
    gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    var lightPos = vec4.fromValues(0.0, 10.0, 0.0, 1.0);
    var lightPos2 = vec4.fromValues(10.0, 10.0, 10.0, 1.0);
    vec3.transformMat4(lightPos, lightPos, view);
    vec3.transformMat4(lightPos2, lightPos2, view);
    
    var lights = [lightPos[0], lightPos[1],lightPos[2], lightPos[3], lightPos2[0], lightPos2[1],lightPos2[2], lightPos2[3]];
    
    for(let i = 0; i < objects.length; i++) {
        gl.bindVertexArray(objects[i].vao);

        var model = objects[i].model;
        var modelView = mat4.create();
        var mvp = mat4.create();
        var nm = mat4.create();

        mat4.multiply(modelView, view, model);
        mat4.multiply(mvp, proj, modelView);

        mat4.invert(nm, modelView);
        mat4.transpose(nm, nm);

        gl.uniformMatrix4fv(program.mvUniform, false, modelView);
        gl.uniformMatrix4fv(program.nmUniform, false, nm);
        gl.uniformMatrix4fv(program.mvpUniform, false, mvp);

        gl.uniform3fv(program.colorUniform, objects[i].color);
        gl.uniform4fv(program.light, lights);
        gl.uniform3fv(program.amb, ambientLight);
        gl.uniform3fv(program.spc, objects[i].material.specular);
        gl.uniform1f(program.shi, objects[i].material.shi);
        
        //Desenhar
        gl.drawElements(gl.TRIANGLES, objects[i].elements.length, gl.UNSIGNED_SHORT, 0);

        //Desabilitar buffers habilitados
        gl.bindVertexArray(null);
    }
}
