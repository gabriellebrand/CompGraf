//Obtem o canvas, definido no .html
var canvas = document.getElementById("canvas");

//Usada para acessar as funcoes da OpenGL.
var gl;

//Um programa (conjunto de shaders) para ser executado na placa
var program;

var scene;

//default
var vertexShader = "vertexShaderSrc";
var fragmentShader = "fragmentShaderSrc";

//shader de iluminacao por vertice
function renderVertexPressed() {
    vertexShader = "vertexShaderSrc";
    fragmentShader = "fragmentShaderSrc";   
    render();
}

//shader de iluminacao por fragmento
function renderFragPressed() {
    vertexShader = "vertexShaderSrc2";
    fragmentShader = "fragmentShaderSrc2";
    render();
}

function render1Pressed() {
    scene = initScene1();
    render();
}

function render2Pressed() {
    scene = initScene2();
    render();
}

function render () {
    initProgram(vertexShader, fragmentShader);
    updateVAOs(scene.objects);
    drawScene();
}

function updateVAOs(objects) {
    for (let i = 0; i < objects.length; i++) {
        objects[i].vao = Model.createVAO(gl, program, objects[i]);
    }
}

function onLoad(){
    //Inicializar o contexto WebGL
    initGL();
    //Criar um programa (conjunto de shaders) WebGL
    initProgram(vertexShader, fragmentShader);
    //inicializa as duas cenas
    scene = initScene2();
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
    program.vertexColorAttr = gl.getAttribLocation(program, "color");   

    program.mvUniform =  gl.getUniformLocation(program, "mv");
    program.nmUniform =  gl.getUniformLocation(program, "nm");
    program.mvpUniform = gl.getUniformLocation(program, "mvp");

    program.light = gl.getUniformLocation(program, "leye");
    program.lightColor = gl.getUniformLocation(program, "lcolor");
    
    program.amb = gl.getUniformLocation(program, "amb");
    program.spc = gl.getUniformLocation(program, "spc");
    program.shi = gl.getUniformLocation(program, "shi");
}

function initScene1(){
    //Posições da câmera
    var camera = {};
    camera.eye = [20, 20, 20];
    camera.up = [0, 1, 0];
    camera.center = [0,0,0];

    //Definir as matrizes de view e projection
    var view = mat4.create();
    var proj = mat4.create();
    mat4.lookAt(view, camera.eye, camera.center, camera.up);
    mat4.perspective(proj, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    //luzes
    var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    let light1 = {pos: [10.0, 10.0, 10.0, 1.0], color: [0.4, 0.4, 0.4]};
    let light2 = {pos: [-10.0, 10.0, -10.0, 1.0], color: [0.5, 0.5, 0.8]};
    vec3.transformMat4(light1.pos, light1.pos, view);
    vec3.transformMat4(light2.pos, light2.pos, view); 
    var lightsPos = [];
    lightsPos = lightsPos.concat(light1.pos);
    lightsPos = lightsPos.concat(light2.pos);
    var lightsColors = [];
    lightsColors = lightsColors.concat(light1.color);
    lightsColors = lightsColors.concat(light2.color);

    var objects = [];

    //Criar os objetos
    var cube = Cube.createCube();
    Model.scale(cube, [12, 0.5, 12]);
    Model.translate(cube, [0, -2, 0])
    cube.vao = Model.createVAO(gl, program, cube);
    objects.push(cube);

    var bunny = Bunny.createBunny();
    bunny.material.difuseColor = [Math.random()*1.2, Math.random()*1.2, Math.random()*1.2];
    Model.scale(bunny, [0.6, 0.6, 0.6]);
    bunny.vao = Model.createVAO(gl, program, bunny);
    objects.push(bunny);

    for (let i = 0; i < 8; i++) {
        let angle = i*(Math.PI/4);
        let sphere = Sphere.createSphere();
        Model.scale(sphere, [1.0, 1.0, 1.5]);
        Model.rotate(sphere, [1, 1, 1], Math.PI/4);
        Model.translate(sphere, [0, 0, 5]);
        Model.rotate(sphere, [0, 1, 0], angle);
        sphere.vao = Model.createVAO(gl, program, sphere);
        objects.push(sphere);
    }

    return {
        camera: camera,
        view: view,
        proj: proj,
        objects: objects,
        ambientLight: ambientLight,
        lightsPos: lightsPos,
        lightsColors: lightsColors
    };
}

function initScene2(){
    //Define cor de fundo.
    gl.clearColor(0.4, 0.4, 0.4, 1);
        
    //Posições da câmera
    var camera = {};
    camera.eye = [100, 40, 40];
    camera.up = [0, 1, 0];
    camera.center = [0,0,0];

    //Definir as matrizes de view e projection
    var view = mat4.create();
    var proj = mat4.create();
    mat4.lookAt(view, camera.eye, camera.center, camera.up);
    mat4.perspective(proj, 90, gl.viewportWidth / gl.viewportHeight, 30, 230);

    //luzes
    var ambientLight = vec3.fromValues(0.2, 0.2, 0.2);
    let light1 = {pos: [40.0, 120.0, 0.0, 1.0], color: [0.4, 0.4, 0.4]};
    let light2 = {pos: [40.0, 120.0, 0.0, 1.0], color: [0.4, 0.4, 0.4]};
    vec3.transformMat4(light1.pos, light1.pos, view);
    vec3.transformMat4(light2.pos, light2.pos, view); 
    var lightsPos = [];
    lightsPos = lightsPos.concat(light1.pos);
    lightsPos = lightsPos.concat(light2.pos);
    var lightsColors = [];
    lightsColors = lightsColors.concat(light1.color);
    lightsColors = lightsColors.concat(light2.color);

    var objects = [];

    //Criar os objetos
    var cube = Cube.createCube();
    Model.scale(cube, [65, 2.5, 50]);
    Model.translate(cube, [-15, -48.5, 0]);
    cube.colors = Model.solidColorBuffer(cube.vertices.length, [0.7, 0.7, 0.0]);
    cube.vao = Model.createVAO(gl, program, cube);
    objects.push(cube);

    var cube = Cube.createCube();
    Model.scale(cube, [65, 50, 2.5]);
    Model.translate(cube, [-15, 0, -48.5]);
    cube.colors = Model.solidColorBuffer(cube.vertices.length, [0.7, 0.7, 0.0]);
    cube.vao = Model.createVAO(gl, program, cube);
    objects.push(cube);

    let sphere = Sphere.createSphere();
    sphere.colors = Model.solidColorBuffer(sphere.vertices.length, [0.0, 0.0, 1.0]);
    Model.scale(sphere, [22.5, 22.5, 22.5]);
    Model.translate(sphere, [0, 20, 0]);
    sphere.vao = Model.createVAO(gl, program, sphere);
    objects.push(sphere);

    return {
        camera: camera,
        view: view,
        proj: proj,
        objects: objects,
        ambientLight: ambientLight,
        lightsPos: lightsPos,
        lightsColors: lightsColors
    };
}


function drawScene() {
    //Definir tamanho e limpar a janela
    gl.viewport(0,0,gl.viewportWidth,gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    for(let i = 0; i < scene.objects.length; i++) {
        gl.bindVertexArray(scene.objects[i].vao);

        var model = scene.objects[i].model;
        var modelView = mat4.create();
        var mvp = mat4.create();
        var nm = mat4.create();

        mat4.multiply(modelView, scene.view, model);
        mat4.multiply(mvp, scene.proj, modelView);

        mat4.invert(nm, modelView);
        mat4.transpose(nm, nm);

        gl.uniformMatrix4fv(program.mvUniform, false, modelView);
        gl.uniformMatrix4fv(program.nmUniform, false, nm);
        gl.uniformMatrix4fv(program.mvpUniform, false, mvp);

        gl.uniform4fv(program.light, scene.lightsPos);
        gl.uniform3fv(program.lightColor, scene.lightsColors);
        gl.uniform3fv(program.amb, scene.ambientLight);
        gl.uniform3fv(program.spc, scene.objects[i].material.specular);
        gl.uniform1f(program.shi, scene.objects[i].material.shi);
        
        //Desenhar
        gl.drawElements(gl.TRIANGLES, scene.objects[i].elements.length, gl.UNSIGNED_SHORT, 0);

        //Desabilitar buffers habilitados
        gl.bindVertexArray(null);
    }
}
